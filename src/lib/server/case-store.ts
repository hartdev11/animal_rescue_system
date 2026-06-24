import { Timestamp, FieldValue } from "firebase-admin/firestore";
import type {
  AnimalCondition,
  CaseStatus,
  CaseTimelineEvent,
  RescueCase,
  TreatmentReportType,
} from "@/types";
import { formatCaseNumber } from "@/lib/utils";
import {
  CASE_STATUS_FLOW,
  CASE_STATUS_LABELS,
  DEMO_CLINICS,
  TREATMENT_REPORT_OPTIONS,
  getCaseStatusLabel,
} from "@/lib/constants";
import { getDb, uploadImages } from "@/lib/server/firebase-admin";

// ─── Types ───────────────────────────────────────────────────────

export interface CreateCaseImageFile {
  buffer: Buffer;
  mimeType: string;
  originalName?: string;
}

export interface CreateCaseData {
  reporterName: string;
  phoneNumber: string;
  wantsToAdopt: boolean;
  condition: AnimalCondition;
  description: string;
  imageFiles?: CreateCaseImageFile[];
  latitude: number;
  longitude: number;
  province: string;
}

// ─── Helpers ─────────────────────────────────────────────────────

function normalizeProvince(province: string) {
  return province.trim().normalize("NFC");
}

function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "string") return new Date(value);
  return new Date();
}

function mapCase(id: string, data: FirebaseFirestore.DocumentData): RescueCase {
  return {
    id,
    caseNumber: data.caseNumber,
    clinicId: data.clinicId ?? null,
    reporterName: data.reporterName ?? "",
    phoneNumber: data.phoneNumber,
    wantsToAdopt: Boolean(data.wantsToAdopt),
    condition: data.condition,
    description: data.description,
    imageUrls: data.imageUrls ?? [],
    latitude: data.latitude,
    longitude: data.longitude,
    province: data.province,
    status: data.status,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    acceptedAt: data.acceptedAt ? toDate(data.acceptedAt) : undefined,
    closedAt: data.closedAt ? toDate(data.closedAt) : undefined,
  };
}

function mapTimeline(
  id: string,
  data: FirebaseFirestore.DocumentData
): CaseTimelineEvent {
  return {
    id,
    caseId: data.caseId,
    status: data.status,
    title: data.title,
    description: data.description,
    reportType: data.reportType,
    createdAt: toDate(data.createdAt),
    createdBy: data.createdBy,
  };
}

async function nextCaseNumber(): Promise<string> {
  const db = getDb();
  const ref = db.collection("counters").doc("caseNumber");
  const year = new Date().getFullYear();

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    let seq = 0;
    let storedYear = year;

    if (snap.exists) {
      const d = snap.data()!;
      storedYear = d.year ?? year;
      seq = d.sequence ?? 0;
    }
    if (storedYear !== year) {
      storedYear = year;
      seq = 0;
    }
    seq += 1;
    tx.set(ref, { year: storedYear, sequence: seq }, { merge: true });
    return formatCaseNumber(storedYear, seq);
  });
}

async function addTimeline(
  caseId: string,
  status: CaseStatus,
  title: string,
  description?: string,
  createdBy = "system"
) {
  const db = getDb();
  const ref = db.collection("caseTimeline").doc();
  const now = new Date();

  await ref.set({
    caseId,
    status,
    title,
    description: description ?? null,
    createdAt: Timestamp.fromDate(now),
    createdBy,
  });
}

async function seedClinics() {
  const db = getDb();
  const batch = db.batch();

  for (const clinic of DEMO_CLINICS) {
    batch.set(
      db.collection("clinics").doc(clinic.id),
      {
        clinicName: clinic.clinicName,
        province: clinic.province,
        isActive: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  await batch.commit();
}

// ─── Public API ──────────────────────────────────────────────────

export function getNextStatus(
  current: CaseStatus,
  wantsToAdopt = false
): CaseStatus | null {
  const i = CASE_STATUS_FLOW.indexOf(current);
  if (i === -1 || i >= CASE_STATUS_FLOW.length - 1) return null;

  let next = CASE_STATUS_FLOW[i + 1]!;

  // ผู้แจ้งต้องการรับเลี้ยงเอง — ข้าม "พร้อมรับเลี้ยง" ไปส่งมอบให้ผู้แจ้งเลย
  if (wantsToAdopt && current === "RECOVERY" && next === "READY_FOR_ADOPTION") {
    next = "ADOPTED";
  }

  return next;
}

export async function createCase(data: CreateCaseData): Promise<RescueCase> {
  const db = getDb();
  const now = new Date();
  const caseNumber = await nextCaseNumber();
  const id = `case_${Date.now()}`;
  const province = normalizeProvince(data.province);
  const clinic = DEMO_CLINICS.find((c) => c.province === province);

  const imageUrls = data.imageFiles?.length
    ? await uploadImages(id, data.imageFiles)
    : [];

  const rescueCase: RescueCase = {
    id,
    caseNumber,
    clinicId: clinic?.id ?? null,
    reporterName: data.reporterName.trim(),
    phoneNumber: data.phoneNumber,
    wantsToAdopt: data.wantsToAdopt,
    condition: data.condition,
    description: data.description,
    imageUrls,
    latitude: data.latitude,
    longitude: data.longitude,
    province,
    status: "NEW",
    createdAt: now,
    updatedAt: now,
  };

  await db
    .collection("cases")
    .doc(id)
    .set({
      ...rescueCase,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });

  await addTimeline(
    id,
    "NEW",
    "ส่งรายงานเคส",
    "ผู้แจ้งส่งรายงานฉุกเฉินเข้าระบบ",
    "reporter"
  );

  await seedClinics().catch(() => {});

  return rescueCase;
}

export async function getCaseByNumber(
  caseNumber: string
): Promise<RescueCase | null> {
  const db = getDb();
  const snap = await db
    .collection("cases")
    .where("caseNumber", "==", caseNumber)
    .limit(1)
    .get();

  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  return mapCase(doc.id, doc.data());
}

export async function getCaseTimeline(
  caseNumber: string
): Promise<CaseTimelineEvent[]> {
  const rescueCase = await getCaseByNumber(caseNumber);
  if (!rescueCase) return [];

  const db = getDb();
  const snap = await db
    .collection("caseTimeline")
    .where("caseId", "==", rescueCase.id)
    .get();

  return snap.docs
    .map((doc) => mapTimeline(doc.id, doc.data()))
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export async function listCases(filters?: {
  province?: string;
  status?: CaseStatus;
}): Promise<RescueCase[]> {
  const db = getDb();
  const snap = await db
    .collection("cases")
    .orderBy("createdAt", "desc")
    .limit(200)
    .get();

  let cases = snap.docs.map((doc) => mapCase(doc.id, doc.data()));

  if (filters?.province) {
    const p = normalizeProvince(filters.province);
    cases = cases.filter((c) => normalizeProvince(c.province) === p);
  }
  if (filters?.status) {
    cases = cases.filter((c) => c.status === filters.status);
  }

  return cases;
}

export async function acceptCase(
  caseNumber: string,
  clinicId: string
): Promise<RescueCase | null> {
  const rescueCase = await getCaseByNumber(caseNumber);
  if (!rescueCase || rescueCase.status !== "NEW") return null;

  const db = getDb();
  const now = new Date();

  await db.collection("cases").doc(rescueCase.id).update({
    clinicId,
    status: "ACCEPTED",
    acceptedAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });

  await addTimeline(
    rescueCase.id,
    "ACCEPTED",
    "คลินิกรับเคสแล้ว",
    "คลินิกตรวจสอบและรับเคสเข้าระบบ",
    "clinic"
  );

  return {
    ...rescueCase,
    clinicId,
    status: "ACCEPTED",
    acceptedAt: now,
    updatedAt: now,
  };
}

export async function updateCaseStatus(
  caseNumber: string,
  newStatus: CaseStatus,
  note?: string
): Promise<RescueCase | null> {
  const rescueCase = await getCaseByNumber(caseNumber);
  if (!rescueCase) return null;

  const expected = getNextStatus(rescueCase.status, rescueCase.wantsToAdopt);
  if (expected !== newStatus) return null;

  const db = getDb();
  const now = new Date();
  const updates: Record<string, unknown> = {
    status: newStatus,
    updatedAt: Timestamp.fromDate(now),
  };
  if (newStatus === "CLOSED") {
    updates.closedAt = Timestamp.fromDate(now);
  }

  await db.collection("cases").doc(rescueCase.id).update(updates);

  let timelineTitle = getCaseStatusLabel(newStatus, rescueCase.wantsToAdopt);
  let timelineNote = note;

  if (newStatus === "ADOPTED" && rescueCase.wantsToAdopt) {
    timelineTitle = "ผู้แจ้งรับเลี้ยงต่อ";
    timelineNote =
      note ??
      "ส่งมอบสัตว์ให้ผู้แจ้งเคสดูแลต่อตามที่แจ้งไว้ตอนรายงานเคส";
  }

  await addTimeline(
    rescueCase.id,
    newStatus,
    timelineTitle,
    timelineNote,
    "clinic"
  );

  return {
    ...rescueCase,
    status: newStatus,
    updatedAt: now,
    ...(newStatus === "CLOSED" ? { closedAt: now } : {}),
  };
}

export async function addTreatmentReport(
  caseNumber: string,
  reportType: TreatmentReportType,
  note?: string
): Promise<RescueCase | null> {
  const rescueCase = await getCaseByNumber(caseNumber);
  if (!rescueCase) return null;

  const canReport = ["UNDER_TREATMENT", "RECOVERY"].includes(rescueCase.status);
  if (!canReport) return null;

  const label =
    TREATMENT_REPORT_OPTIONS.find((o) => o.value === reportType)?.labelTh ??
    reportType;

  const db = getDb();
  const now = new Date();
  const ref = db.collection("caseTimeline").doc();

  await ref.set({
    caseId: rescueCase.id,
    status: rescueCase.status,
    reportType,
    title: `รายงานอาการ: ${label}`,
    description: note?.trim() || null,
    createdAt: Timestamp.fromDate(now),
    createdBy: "clinic",
  });

  if (reportType === "DECEASED") {
    await db.collection("cases").doc(rescueCase.id).update({
      status: "CLOSED",
      closedAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });
    await addTimeline(
      rescueCase.id,
      "CLOSED",
      CASE_STATUS_LABELS.CLOSED.th,
      "สัตว์เสียชีวิตระหว่างการรักษา",
      "clinic"
    );
    return {
      ...rescueCase,
      status: "CLOSED",
      updatedAt: now,
      closedAt: now,
    };
  }

  await db.collection("cases").doc(rescueCase.id).update({
    updatedAt: Timestamp.fromDate(now),
  });

  return { ...rescueCase, updatedAt: now };
}

export async function getClinicStats(province?: string) {
  const cases = await listCases(province ? { province } : undefined);
  return {
    newCases: cases.filter((c) => c.status === "NEW").length,
    acceptedCases: cases.filter((c) => c.status === "ACCEPTED").length,
    onTheWay: cases.filter((c) => c.status === "ON_THE_WAY").length,
    underTreatment: cases.filter((c) => c.status === "UNDER_TREATMENT").length,
    recovery: cases.filter((c) => c.status === "RECOVERY").length,
    readyForAdoption: cases.filter((c) => c.status === "READY_FOR_ADOPTION").length,
    closedCases: cases.filter((c) => c.status === "CLOSED").length,
  };
}
