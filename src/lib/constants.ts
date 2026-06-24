import type { AnimalCondition, CaseStatus, TreatmentReportType } from "@/types";

export const APP_NAME = "Animal Rescue System";

export const CASE_NUMBER_PREFIX = "CASE";

export const ANIMAL_CONDITIONS: {
  value: AnimalCondition;
  label: string;
  labelTh: string;
}[] = [
  { value: "HIT_BY_VEHICLE", label: "Hit by vehicle", labelTh: "ถูกรถชน" },
  { value: "BROKEN_LEG", label: "Broken leg", labelTh: "ขาหัก" },
  { value: "UNABLE_TO_WALK", label: "Unable to walk", labelTh: "เดินไม่ได้" },
  { value: "SEVERE_WOUND", label: "Severe wound", labelTh: "บาดแผลรุนแรง" },
  { value: "TRAPPED", label: "Trapped in dangerous location", labelTh: "ติดอยู่ในที่อันตราย" },
  { value: "EMERGENCY", label: "Emergency condition", labelTh: "ภาวะฉุกเฉิน" },
  { value: "OTHER", label: "Other", labelTh: "อื่นๆ" },
];

export const CASE_STATUS_FLOW: CaseStatus[] = [
  "NEW",
  "ACCEPTED",
  "ON_THE_WAY",
  "RESCUED",
  "UNDER_TREATMENT",
  "RECOVERY",
  "READY_FOR_ADOPTION",
  "ADOPTED",
  "CLOSED",
];

export const CASE_STATUS_LABELS: Record<
  CaseStatus,
  { en: string; th: string }
> = {
  NEW: { en: "New", th: "ใหม่" },
  ACCEPTED: { en: "Accepted", th: "รับเคสแล้ว" },
  ON_THE_WAY: { en: "On the Way", th: "กำลังเดินทาง" },
  RESCUED: { en: "Rescued", th: "ช่วยเหลือแล้ว" },
  UNDER_TREATMENT: { en: "Under Treatment", th: "กำลังรักษา" },
  RECOVERY: { en: "Recovery", th: "ฟื้นตัว" },
  READY_FOR_ADOPTION: { en: "Ready for Adoption", th: "พร้อมรับเลี้ยง" },
  ADOPTED: { en: "Adopted", th: "ได้บ้านแล้ว" },
  CLOSED: { en: "Closed", th: "ปิดเคส" },
};

/** ชื่อสถานะที่แสดง — กรณีผู้แจ้งติ๊กรับเลี้ยงต่อเอง */
export function getCaseStatusLabel(
  status: CaseStatus,
  wantsToAdopt?: boolean
): string {
  if (wantsToAdopt && status === "ADOPTED") {
    return "ผู้แจ้งรับเลี้ยงต่อ";
  }
  return CASE_STATUS_LABELS[status].th;
}

/** สีประจำสถานะ — ใช้ใน timeline, badge และการ์ดสถานะ */
export const CASE_STATUS_STYLES: Record<
  CaseStatus,
  {
    dot: string;
    line: string;
    badge: string;
    card: string;
    title: string;
  }
> = {
  NEW: {
    dot: "bg-sky-500",
    line: "bg-sky-200",
    badge: "bg-sky-100 text-sky-800 border border-sky-200",
    card: "border-sky-200 bg-sky-50",
    title: "text-sky-800",
  },
  ACCEPTED: {
    dot: "bg-indigo-500",
    line: "bg-indigo-200",
    badge: "bg-indigo-100 text-indigo-800 border border-indigo-200",
    card: "border-indigo-200 bg-indigo-50",
    title: "text-indigo-800",
  },
  ON_THE_WAY: {
    dot: "bg-amber-500",
    line: "bg-amber-200",
    badge: "bg-amber-100 text-amber-900 border border-amber-300",
    card: "border-amber-300 bg-amber-50",
    title: "text-amber-900",
  },
  RESCUED: {
    dot: "bg-cyan-500",
    line: "bg-cyan-200",
    badge: "bg-cyan-100 text-cyan-800 border border-cyan-200",
    card: "border-cyan-200 bg-cyan-50",
    title: "text-cyan-800",
  },
  UNDER_TREATMENT: {
    dot: "bg-violet-500",
    line: "bg-violet-200",
    badge: "bg-violet-100 text-violet-800 border border-violet-200",
    card: "border-violet-200 bg-violet-50",
    title: "text-violet-800",
  },
  RECOVERY: {
    dot: "bg-emerald-500",
    line: "bg-emerald-200",
    badge: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    card: "border-emerald-200 bg-emerald-50",
    title: "text-emerald-800",
  },
  READY_FOR_ADOPTION: {
    dot: "bg-pink-500",
    line: "bg-pink-200",
    badge: "bg-pink-100 text-pink-800 border border-pink-200",
    card: "border-pink-200 bg-pink-50",
    title: "text-pink-800",
  },
  ADOPTED: {
    dot: "bg-teal-500",
    line: "bg-teal-200",
    badge: "bg-teal-100 text-teal-800 border border-teal-200",
    card: "border-teal-200 bg-teal-50",
    title: "text-teal-800",
  },
  CLOSED: {
    dot: "bg-slate-400",
    line: "bg-slate-200",
    badge: "bg-slate-100 text-slate-700 border border-slate-200",
    card: "border-slate-200 bg-slate-50",
    title: "text-slate-700",
  },
};

/** รายงานอาการระหว่างรักษา (หลังสถานะกำลังรักษา) */
export const TREATMENT_REPORT_OPTIONS: {
  value: TreatmentReportType;
  labelTh: string;
}[] = [
  { value: "STABLE", labelTh: "อาการดีขึ้น / ปลอดภัย" },
  { value: "CRITICAL", labelTh: "อาการหนัก / วิกฤต" },
  { value: "DECEASED", labelTh: "เสียชีวิต (ทนไม่ไหวแล้ว)" },
];

export const TREATMENT_REPORT_STYLES: Record<
  TreatmentReportType,
  { dot: string; line: string; title: string }
> = {
  STABLE: {
    dot: "bg-green-500",
    line: "bg-green-200",
    title: "text-green-800",
  },
  CRITICAL: {
    dot: "bg-red-500",
    line: "bg-red-200",
    title: "text-red-800",
  },
  DECEASED: {
    dot: "bg-gray-700",
    line: "bg-gray-300",
    title: "text-gray-800",
  },
};

export const THAI_PROVINCES = [
  "กรุงเทพมหานคร",
  "กระบี่",
  "กาญจนบุรี",
  "กาฬสินธุ์",
  "กำแพงเพชร",
  "ขอนแก่น",
  "จันทบุรี",
  "ฉะเชิงเทรา",
  "ชลบุรี",
  "ชัยนาท",
  "ชัยภูมิ",
  "ชุมพร",
  "เชียงราย",
  "เชียงใหม่",
  "ตรัง",
  "ตราด",
  "ตาก",
  "นครนายก",
  "นครปฐม",
  "นครพนม",
  "นครราชสีมา",
  "นครศรีธรรมราช",
  "นครสวรรค์",
  "นนทบุรี",
  "นราธิวาส",
  "น่าน",
  "บึงกาฬ",
  "บุรีรัมย์",
  "ปทุมธานี",
  "ประจวบคีรีขันธ์",
  "ปราจีนบุรี",
  "ปัตตานี",
  "พระนครศรีอยุธยา",
  "พังงา",
  "พัทลุง",
  "พิจิตร",
  "พิษณุโลก",
  "เพชรบุรี",
  "เพชรบูรณ์",
  "แพร่",
  "ภูเก็ต",
  "มหาสารคาม",
  "มุกดาหาร",
  "แม่ฮ่องสอน",
  "ยโสธร",
  "ยะลา",
  "ร้อยเอ็ด",
  "ระนอง",
  "ระยอง",
  "ราชบุรี",
  "ลพบุรี",
  "ลำปาง",
  "ลำพูน",
  "เลย",
  "ศรีสะเกษ",
  "สกลนคร",
  "สงขลา",
  "สตูล",
  "สมุทรปราการ",
  "สมุทรสงคราม",
  "สมุทรสาคร",
  "สระแก้ว",
  "สระบุรี",
  "สิงห์บุรี",
  "สุโขทัย",
  "สุพรรณบุรี",
  "สุราษฎร์ธานี",
  "สุรินทร์",
  "หนองคาย",
  "หนองบัวลำภู",
  "อ่างทอง",
  "อำนาจเจริญ",
  "อุดรธานี",
  "อุตรดิตถ์",
  "อุทัยธานี",
  "อุบลราชธานี",
] as const;

export const FIRESTORE_COLLECTIONS = {
  USERS: "users",
  CLINICS: "clinics",
  CASES: "cases",
  CASE_UPDATES: "caseUpdates",
  CASE_TIMELINE: "caseTimeline",
  ANIMALS: "animals",
  COUNTERS: "counters",
} as const;

export const STORAGE_PATHS = {
  CASE_IMAGES: "cases",
  CASE_UPDATES: "case-updates",
  ANIMAL_IMAGES: "animals",
} as const;

export const DEMO_CLINIC_ID = "clinic-demo";

export const DEMO_CLINICS = [
  {
    id: DEMO_CLINIC_ID,
    clinicName: "คลินิกสัตวแพทย์กรุงเทพ (Demo)",
    province: "กรุงเทพมหานคร",
  },
  {
    id: "clinic-saraburi",
    clinicName: "คลินิกสัตวแพทย์สระบุรี (Demo)",
    province: "สระบุรี",
  },
] as const;
