import { Timestamp, FieldValue } from "firebase-admin/firestore";
import type {
  AnimalCondition,
  AnimalSpecies,
  CaseStatus,
  CaseTimelineEvent,
  PlacementStatus,
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
  species: AnimalSpecies;
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
    species: (data.species as AnimalSpecies | undefined) ?? null,
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
    placementStatus: data.placementStatus ?? null,
    donationGoal: data.donationGoal ?? 5000,
    donationTotal: data.donationTotal ?? 0,
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
  wantsToAdopt = false,
  placementStatus?: PlacementStatus | null
): CaseStatus | null {
  // หลังฟื้นตัวต้องเลือกผลลัพธ์ (รอศูนย์ / ผู้แจ้งรับเลี้ยง / เสียชีวิต) แทนการกดขั้นถัดไป
  if (current === "RECOVERY") return null;

  // รอศูนย์พักพิง — ปิดเคสผ่านหน้าจัดการศูนย์ (ได้เจ้าของแล้ว → ADOPTED)
  if (current === "READY_FOR_ADOPTION" && placementStatus) return null;

  const i = CASE_STATUS_FLOW.indexOf(current);
  if (i === -1 || i >= CASE_STATUS_FLOW.length - 1) return null;

  let next = CASE_STATUS_FLOW[i + 1]!;

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
    species: data.species,
    condition: data.condition,
    description: data.description,
    imageUrls,
    latitude: data.latitude,
    longitude: data.longitude,
    province,
    status: "NEW",
    createdAt: now,
    updatedAt: now,
    donationGoal: 5000,
    donationTotal: 0,
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
  placementStatus?: PlacementStatus | PlacementStatus[];
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
  if (filters?.placementStatus) {
    const wanted = Array.isArray(filters.placementStatus)
      ? filters.placementStatus
      : [filters.placementStatus];
    cases = cases.filter(
      (c) => c.placementStatus && wanted.includes(c.placementStatus)
    );
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

  const expected = getNextStatus(
    rescueCase.status,
    rescueCase.wantsToAdopt,
    rescueCase.placementStatus
  );
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

export type RecoveryOutcome = "awaitingShelter" | "reporterAdopt";

export async function setRecoveryOutcome(
  caseNumber: string,
  outcome: RecoveryOutcome,
  note?: string
): Promise<RescueCase | null> {
  const rescueCase = await getCaseByNumber(caseNumber);
  if (!rescueCase || rescueCase.status !== "RECOVERY") return null;

  const db = getDb();
  const now = new Date();

  if (outcome === "reporterAdopt") {
    if (!rescueCase.wantsToAdopt) return null;

    await db.collection("cases").doc(rescueCase.id).update({
      status: "ADOPTED",
      placementStatus: "HOMED",
      updatedAt: Timestamp.fromDate(now),
    });

    await addTimeline(
      rescueCase.id,
      "ADOPTED",
      "ผู้แจ้งรับเลี้ยงต่อ",
      note ?? "ส่งมอบสัตว์ให้ผู้แจ้งเคสดูแลต่อตามที่แจ้งไว้ตอนรายงานเคส",
      "clinic"
    );

    return {
      ...rescueCase,
      status: "ADOPTED",
      placementStatus: "HOMED",
      updatedAt: now,
    };
  }

  if (rescueCase.wantsToAdopt) return null;

  await db.collection("cases").doc(rescueCase.id).update({
    status: "READY_FOR_ADOPTION",
    placementStatus: "AWAITING_SHELTER",
    updatedAt: Timestamp.fromDate(now),
  });

  await addTimeline(
    rescueCase.id,
    "READY_FOR_ADOPTION",
    "รอศูนย์พักพิง / ยังไม่ได้บ้าน",
    note ?? "สัตว์ฟื้นตัวแล้ว รอจัดหาศูนย์พักพิงหรือเจ้าของ",
    "clinic"
  );

  return {
    ...rescueCase,
    status: "READY_FOR_ADOPTION",
    placementStatus: "AWAITING_SHELTER",
    updatedAt: now,
  };
}

export type PlacementAction = "markInShelter" | "markHomed";

export async function updatePlacement(
  caseNumber: string,
  action: PlacementAction,
  note?: string
): Promise<RescueCase | null> {
  const rescueCase = await getCaseByNumber(caseNumber);
  if (!rescueCase) return null;

  const db = getDb();
  const now = new Date();

  if (action === "markInShelter") {
    if (rescueCase.placementStatus !== "AWAITING_SHELTER") return null;

    await db.collection("cases").doc(rescueCase.id).update({
      placementStatus: "IN_SHELTER",
      updatedAt: Timestamp.fromDate(now),
    });

    await addTimeline(
      rescueCase.id,
      rescueCase.status,
      "ส่งเข้าศูนย์พักพิงแล้ว",
      note ?? "สัตว์อยู่ในศูนย์พักพิงแล้ว รอหาเจ้าของ",
      "clinic"
    );

    return {
      ...rescueCase,
      placementStatus: "IN_SHELTER",
      updatedAt: now,
    };
  }

  if (
    rescueCase.placementStatus !== "AWAITING_SHELTER" &&
    rescueCase.placementStatus !== "IN_SHELTER"
  ) {
    return null;
  }

  await db.collection("cases").doc(rescueCase.id).update({
    status: "ADOPTED",
    placementStatus: "HOMED",
    updatedAt: Timestamp.fromDate(now),
  });

  await addTimeline(
    rescueCase.id,
    "ADOPTED",
    "ได้เจ้าของแล้ว",
    note ?? "สัตว์ได้รับการรับเลี้ยงหรือมีเจ้าของแล้ว",
    "clinic"
  );

  return {
    ...rescueCase,
    status: "ADOPTED",
    placementStatus: "HOMED",
    updatedAt: now,
  };
}

export async function listShelterCases(province?: string): Promise<RescueCase[]> {
  return listCases({
    province,
    placementStatus: ["AWAITING_SHELTER", "IN_SHELTER"],
  });
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

export interface ClinicDashboardData {
  totalCases: number;
  activeCases: number;
  todayCases: number;
  stats: {
    newCases: number;
    acceptedCases: number;
    onTheWay: number;
    rescued: number;
    underTreatment: number;
    recovery: number;
    readyForAdoption: number;
    adopted: number;
    closedCases: number;
  };
  recentCases: RescueCase[];
  urgentCases: RescueCase[];
}

export async function getClinicDashboard(
  province?: string
): Promise<ClinicDashboardData> {
  const cases = await listCases(province ? { province } : undefined);
  const count = (status: CaseStatus) =>
    cases.filter((c) => c.status === status).length;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return {
    totalCases: cases.length,
    activeCases: cases.filter((c) => c.status !== "CLOSED").length,
    todayCases: cases.filter((c) => c.createdAt >= todayStart).length,
    stats: {
      newCases: count("NEW"),
      acceptedCases: count("ACCEPTED"),
      onTheWay: count("ON_THE_WAY"),
      rescued: count("RESCUED"),
      underTreatment: count("UNDER_TREATMENT"),
      recovery: count("RECOVERY"),
      readyForAdoption: count("READY_FOR_ADOPTION"),
      adopted: count("ADOPTED"),
      closedCases: count("CLOSED"),
    },
    recentCases: cases.slice(0, 5),
    urgentCases: cases.filter((c) => c.status === "NEW").slice(0, 5),
  };
}

/** บันทึกบริจาค — user โอน PromptPay แล้วกดยืนยันในเว็บ */
export async function addDonation(
  caseNumber: string,
  amount: number,
  donorName?: string
): Promise<{ donationTotal: number; donationGoal: number }> {
  if (!Number.isFinite(amount) || amount < 1 || amount > 100000) {
    throw new Error("จำนวนเงินไม่ถูกต้อง");
  }

  const rescueCase = await getCaseByNumber(caseNumber);
  if (!rescueCase) throw new Error("ไม่พบเคสนี้");
  if (rescueCase.status === "CLOSED") {
    throw new Error("เคสปิดแล้ว ไม่รับบริจาค");
  }

  const db = getDb();
  const now = new Date();
  const goal = rescueCase.donationGoal ?? 5000;
  const newTotal = (rescueCase.donationTotal ?? 0) + amount;

  await db.collection("donations").add({
    caseNumber,
    caseId: rescueCase.id,
    amount,
    donorName: donorName?.trim() || "ไม่ระบุชื่อ",
    createdAt: Timestamp.fromDate(now),
  });

  await db.collection("cases").doc(rescueCase.id).update({
    donationTotal: newTotal,
    updatedAt: Timestamp.fromDate(now),
  });

  return { donationTotal: newTotal, donationGoal: goal };
}
