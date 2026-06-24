import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore, initializeFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

// Windows dev: set FIREBASE_ALLOW_INSECURE_TLS=true in .env.local
if (process.env.FIREBASE_ALLOW_INSECURE_TLS === "true") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

let app: App | undefined;
let db: Firestore | undefined;
let storage: Storage | undefined;

export function isFirebaseAdminConfigured(): boolean {
  const accountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const gac = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  return Boolean(
    (accountPath && fs.existsSync(path.resolve(process.cwd(), accountPath))) ||
      (gac && fs.existsSync(path.resolve(process.cwd(), gac)))
  );
}

function getServiceAccountPath(): string {
  const accountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (accountPath) {
    const resolved = path.resolve(process.cwd(), accountPath);
    if (fs.existsSync(resolved)) return resolved;
  }
  const gac = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (gac) {
    const resolved = path.resolve(process.cwd(), gac);
    if (fs.existsSync(resolved)) return resolved;
  }
  throw new Error("ตั้ง FIREBASE_SERVICE_ACCOUNT_PATH ใน .env.local");
}

function getApp(): App {
  if (app) return app;
  if (getApps().length > 0) {
    app = getApps()[0]!;
    return app;
  }

  const sa = JSON.parse(fs.readFileSync(getServiceAccountPath(), "utf-8"));
  app = initializeApp({
    credential: cert({
      projectId: sa.project_id,
      clientEmail: sa.client_email,
      privateKey: sa.private_key,
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
  return app;
}

export function getDb(): Firestore {
  if (!isFirebaseAdminConfigured()) {
    throw new Error("Firebase Admin ยังไม่ได้ตั้งค่า");
  }
  if (!db) {
    try {
      db = initializeFirestore(getApp(), { preferRest: true });
    } catch {
      db = getFirestore(getApp());
    }
  }
  return db;
}

function getStorageInstance(): Storage {
  if (!storage) storage = getStorage(getApp());
  return storage;
}

export async function getStorageBucket() {
  const s = getStorageInstance();
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const names = [
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    projectId ? `${projectId}.firebasestorage.app` : null,
    projectId ? `${projectId}.appspot.com` : null,
  ].filter(Boolean) as string[];

  for (const name of names) {
    const bucket = s.bucket(name);
    const [exists] = await bucket.exists();
    if (exists) return bucket;
  }
  throw new Error("ไม่พบ Storage bucket — เปิด Storage ใน Firebase Console");
}

export async function uploadImages(
  caseId: string,
  files: { buffer: Buffer; mimeType: string }[]
): Promise<string[]> {
  if (files.length === 0) return [];

  const bucket = await getStorageBucket();
  const urls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    const ext = file.mimeType.includes("png")
      ? "png"
      : file.mimeType.includes("webp")
        ? "webp"
        : "jpg";
    const filePath = `cases/${caseId}/${i}.${ext}`;
    const token = randomUUID();

    await bucket.file(filePath).save(file.buffer, {
      metadata: {
        contentType: file.mimeType,
        metadata: { firebaseStorageDownloadTokens: token },
      },
    });

    const encoded = encodeURIComponent(filePath);
    urls.push(
      `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encoded}?alt=media&token=${token}`
    );
  }

  return urls;
}
