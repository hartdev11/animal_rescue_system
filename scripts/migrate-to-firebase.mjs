/**
 * ย้ายข้อมูลจาก .data/cases.json ไป Firestore + Firebase Storage
 *
 * ใช้: npm run migrate:firebase
 */
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, initializeFirestore, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

function configureFirebaseTls() {
  if (process.env.FIREBASE_ALLOW_INSECURE_TLS === "true") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    if (!configureFirebaseTls.warned) {
      console.warn(
        "[migrate] FIREBASE_ALLOW_INSECURE_TLS=true — ปิดการตรวจสอบ TLS (dev เท่านั้น)"
      );
      configureFirebaseTls.warned = true;
    }
  }
}
configureFirebaseTls.warned = false;

configureFirebaseTls();

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (!serviceAccountPath) {
  console.error("❌ ตั้ง FIREBASE_SERVICE_ACCOUNT_PATH ใน .env.local ก่อน");
  process.exit(1);
}

const absAccountPath = path.resolve(root, serviceAccountPath);
if (!fs.existsSync(absAccountPath)) {
  console.error(`❌ ไม่พบไฟล์ service account: ${absAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(absAccountPath, "utf-8"));
const bucketName =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
  `${serviceAccount.project_id}.appspot.com`;

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: bucketName,
  });
}

let db;
try {
  db = initializeFirestore(getApps()[0], { preferRest: true });
} catch {
  db = getFirestore();
}
const storage = getStorage();
const dataFile = path.join(root, ".data", "cases.json");

if (!fs.existsSync(dataFile)) {
  console.log("ℹ️ ไม่พบ .data/cases.json — ข้ามการ migrate");
  process.exit(0);
}

const store = JSON.parse(fs.readFileSync(dataFile, "utf-8"));

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout: ${label} (${ms}ms)`)), ms)
    ),
  ]);
}

async function resolveBucket() {
  const candidates = [
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    `${serviceAccount.project_id}.firebasestorage.app`,
    `${serviceAccount.project_id}.appspot.com`,
  ].filter(Boolean);

  for (const name of [...new Set(candidates)]) {
    const bucket = storage.bucket(name);
    try {
      const [exists] = await withTimeout(bucket.exists(), 10000, `bucket.exists(${name})`);
      if (exists) return bucket;
    } catch {
      // try next candidate
    }
  }

  return null;
}

async function uploadDataUrl(bucket, caseId, dataUrl, index) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return dataUrl;

  const [, mimeType, base64] = match;
  const ext = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : "jpg";
  const filePath = `cases/${caseId}/${index}.${ext}`;
  const token = randomUUID();
  const buffer = Buffer.from(base64, "base64");

  await bucket.file(filePath).save(buffer, {
    metadata: {
      contentType: mimeType,
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });

  const encoded = encodeURIComponent(filePath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encoded}?alt=media&token=${token}`;
}

async function migrateImages(bucket, caseId, imageUrls, legacyImageUrl) {
  const sources =
    imageUrls?.length > 0 ? imageUrls : legacyImageUrl ? [legacyImageUrl] : [];

  if (!bucket) {
    // อย่าเขียน base64 ลง Firestore (ใหญ่เกิน limit + ช้ามาก)
    return sources.filter((src) => !src.startsWith("data:"));
  }

  const migrated = [];
  for (let i = 0; i < sources.length; i++) {
    const src = sources[i];
    if (src.startsWith("data:")) {
      try {
        migrated.push(await uploadDataUrl(bucket, caseId, src, i));
      } catch (err) {
        console.warn(`⚠️ อัปโหลดรูปเคส ${caseId} ไม่สำเร็จ — เก็บ URL เดิมไว้ก่อน`);
        migrated.push(src);
      }
    } else {
      migrated.push(src);
    }
  }
  return migrated;
}

async function main() {
  console.log("🚀 เริ่ม migrate ไป Firebase...");

  try {
    await withTimeout(db.collection("cases").limit(1).get(), 5000, "Firestore read");
    console.log("✓ เชื่อมต่อ Firestore สำเร็จ");
  } catch (err) {
    console.error("❌ Firestore ไม่พร้อม");
    console.error(`   1) เปิด: https://console.firebase.google.com/project/${serviceAccount.project_id}/firestore`);
    console.error("   2) กด Create database → Production mode → asia-southeast1");
    console.error(`   รายละเอียด: ${err.message}`);
    process.exit(1);
  }

  const bucket = await resolveBucket();
  if (!bucket) {
    console.warn(
      "⚠️ ไม่พบ Storage bucket — ย้ายเฉพาะข้อมูลเคส/timeline (ข้ามรูป base64)"
    );
    console.warn(
      "   เปิด Storage: Firebase Console → Build → Storage → Get started แล้วรัน migrate อีกครั้ง"
    );
  } else {
    console.log(`📦 ใช้ Storage bucket: ${bucket.name}`);
  }

  let caseCount = 0;
  let timelineCount = 0;

  for (const [caseNumber, rawCase] of Object.entries(store.cases ?? {})) {
    const caseId = rawCase.id;
    console.log(`→ migrate ${caseNumber}`);
    const imageUrls = await migrateImages(
      bucket,
      caseId,
      rawCase.imageUrls,
      rawCase.imageUrl
    );

    await db
      .collection("cases")
      .doc(caseId)
      .set(
        {
          caseNumber: rawCase.caseNumber ?? caseNumber,
          clinicId: rawCase.clinicId ?? null,
          phoneNumber: rawCase.phoneNumber,
          condition: rawCase.condition,
          description: rawCase.description,
          imageUrls,
          latitude: rawCase.latitude,
          longitude: rawCase.longitude,
          province: rawCase.province,
          status: rawCase.status,
          createdAt: Timestamp.fromDate(new Date(rawCase.createdAt)),
          updatedAt: Timestamp.fromDate(new Date(rawCase.updatedAt)),
          ...(rawCase.acceptedAt
            ? { acceptedAt: Timestamp.fromDate(new Date(rawCase.acceptedAt)) }
            : {}),
          ...(rawCase.closedAt
            ? { closedAt: Timestamp.fromDate(new Date(rawCase.closedAt)) }
            : {}),
        },
        { merge: true }
      );

    caseCount++;

    const events = store.timelines?.[caseNumber] ?? [];
    for (const event of events) {
      await db
        .collection("caseTimeline")
        .doc(event.id)
        .set(
          {
            caseId: event.caseId,
            status: event.status,
            title: event.title,
            description: event.description ?? null,
            createdAt: Timestamp.fromDate(new Date(event.createdAt)),
            createdBy: event.createdBy ?? "system",
          },
          { merge: true }
        );
      timelineCount++;
    }
  }

  if (store.sequence != null && store.year != null) {
    await db
      .collection("counters")
      .doc("caseNumber")
      .set({ sequence: store.sequence, year: store.year }, { merge: true });
  }

  console.log(`✅ migrate เสร็จ: ${caseCount} เคส, ${timelineCount} timeline events`);
  if (!bucket) {
    console.log("ℹ️ เปิด Storage แล้วรัน npm run migrate:firebase อีกครั้งเพื่อย้ายรูป");
  }
  console.log("👉 รีสตาร์ท npm run dev แล้วทดสอบ");
}

main().catch((err) => {
  console.error("❌ migrate ล้มเหลว:", err);
  process.exit(1);
});
