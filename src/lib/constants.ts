import type {
  AnimalCondition,
  AnimalSpecies,
  CaseStatus,
  EnergyLevel,
  PlacementStatus,
  TemperamentTrait,
  TreatmentReportType,
} from "@/types";

export const APP_NAME = "Animal Rescue System";

/** เป้าหมายบริจาคเริ่มต้นต่อเคส (บาท) */
export const DEFAULT_DONATION_GOAL = 5000;

/** เลขพร้อมเพย์รับบริจาค — ตั้งใน .env.local เป็น NEXT_PUBLIC_PROMPTPAY_ID */
export const PROMPTPAY_ID =
  process.env.NEXT_PUBLIC_PROMPTPAY_ID ?? "0812345678";

export const ANIMAL_SPECIES: {
  value: AnimalSpecies;
  label: string;
  icon: string;
  /** คำค้นหาเพิ่ม เช่น หมา dog */
  aliases: string[];
}[] = [
  { value: "DOG", label: "สุนัข", icon: "🐕", aliases: ["หมา", "dog", "สุนัข", "โฮ่ง"] },
  { value: "CAT", label: "แมว", icon: "🐈", aliases: ["cat", "แมว", "เหมียว", "น้อล"] },
  {
    value: "RABBIT",
    label: "กระต่าย",
    icon: "🐇",
    aliases: ["กระต่าย", "rabbit", "bunny", "กระตาย"],
  },
  { value: "BIRD", label: "นก", icon: "🐦", aliases: ["bird", "นก", "นกแก้ว"] },
  {
    value: "OTHER",
    label: "อื่นๆ",
    icon: "🐾",
    aliases: ["อื่นๆ", "other", "สัตว์อื่น"],
  },
];

export function getSpeciesLabel(species: AnimalSpecies): string {
  return ANIMAL_SPECIES.find((s) => s.value === species)?.label ?? species;
}

export function getSpeciesIcon(species: AnimalSpecies): string {
  return ANIMAL_SPECIES.find((s) => s.value === species)?.icon ?? "🐾";
}

/** กรองชนิดสัตว์จากข้อความพิมพ์ (หมา / แมว / dog …) */
export function matchSpeciesQuery(query: string): typeof ANIMAL_SPECIES {
  const q = query.trim().toLowerCase().normalize("NFC");
  if (!q) return ANIMAL_SPECIES;
  return ANIMAL_SPECIES.filter((s) => {
    const hay = [s.label, s.value, ...s.aliases].join(" ").toLowerCase();
    return hay.includes(q);
  });
}

export function resolveSpeciesFromQuery(query: string): AnimalSpecies | null {
  const q = query.trim().toLowerCase().normalize("NFC");
  if (!q) return null;
  const exact = ANIMAL_SPECIES.find(
    (s) =>
      s.value.toLowerCase() === q ||
      s.label.toLowerCase() === q ||
      s.aliases.some((a) => a.toLowerCase() === q)
  );
  if (exact) return exact.value;
  const matched = matchSpeciesQuery(q);
  return matched.length === 1 ? matched[0]!.value : null;
}

export const TEMPERAMENT_TRAITS: {
  value: TemperamentTrait;
  label: string;
  quizValue?: string;
}[] = [
  { value: "affectionate", label: "ขี้อ้อน ชอบติดคน", quizValue: "affectionate" },
  { value: "active", label: "กระตือรือร้น ชอบเล่น", quizValue: "active" },
  { value: "calm", label: "สงบ เงียบ", quizValue: "independent" },
  { value: "independent", label: "เป็นอิสระ ไม่กวน", quizValue: "independent" },
  { value: "good_with_kids", label: "อยู่กับเด็กได้", quizValue: "kids" },
  { value: "good_with_elderly", label: "เหมาะกับผู้สูงอายุ", quizValue: "elderly" },
];

export const ENERGY_LEVELS: { value: EnergyLevel; label: string }[] = [
  { value: "low", label: "น้อย — สงบ ไม่ต้องใช้เวลามาก" },
  { value: "medium", label: "ปานกลาง" },
  { value: "high", label: "เยอะ — ชอบออกกำลังกาย" },
];

export function getTemperamentTraitLabel(trait: TemperamentTrait): string {
  return TEMPERAMENT_TRAITS.find((t) => t.value === trait)?.label ?? trait;
}

export function getEnergyLevelLabel(level: EnergyLevel): string {
  return ENERGY_LEVELS.find((l) => l.value === level)?.label ?? level;
}


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

export const PLACEMENT_STATUS_LABELS: Record<
  PlacementStatus,
  { th: string; description: string }
> = {
  AWAITING_SHELTER: {
    th: "รอศูนย์พักพิง",
    description: "ยังไม่มีศูนย์พักพิงหรือเจ้าของ",
  },
  IN_SHELTER: {
    th: "อยู่ในศูนย์พักพิง",
    description: "ส่งเข้าศูนย์แล้ว รอหาเจ้าของ",
  },
  HOMED: {
    th: "ได้เจ้าของแล้ว",
    description: "มีผู้รับเลี้ยงหรือเจ้าของแล้ว",
  },
};

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
  SHELTERS: "shelters",
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
    /** LINE OA จริง — AnimalRescueSystem */
    lineId: "@816nyxpw",
  },
  {
    id: "clinic-saraburi",
    clinicName: "คลินิกสัตวแพทย์สระบุรี (Demo)",
    province: "สระบุรี",
    /** ใช้ OA เดียวกันชั่วคราวจนกว่าจะมี OA แยกจังหวัด */
    lineId: "@816nyxpw",
  },
] as const;

export type DemoClinic = (typeof DEMO_CLINICS)[number];

/** หาคลินิกจาก province หรือ clinicId */
export function findDemoClinic(options: {
  province?: string | null;
  clinicId?: string | null;
}): DemoClinic | undefined {
  const { province, clinicId } = options;
  if (clinicId) {
    const byId = DEMO_CLINICS.find((c) => c.id === clinicId);
    if (byId) return byId;
  }
  if (province) {
    const normalized = province.trim().normalize("NFC");
    return DEMO_CLINICS.find((c) => c.province.normalize("NFC") === normalized);
  }
  return undefined;
}

function normalizeLineId(lineId: string): string {
  return lineId.startsWith("@") ? lineId : `@${lineId}`;
}

/** ข้อความสำเร็จรูปสำหรับวางในแชท LINE แล้วกดส่ง — ไม่มีคำว่า text= */
export function buildClinicLineMessage(options: {
  caseNumber: string;
  speciesLabel?: string | null;
  reportedAt?: Date | string | null;
}): string {
  // บรรทัดหลักตามที่ user ต้องการส่งในแชท
  let message = `สวัสดีครับ/ค่ะ ต้องการติดต่อเรื่องเคส ${options.caseNumber}`;

  // รายละเอียดเสริม (ไม่มี prefix text=)
  const extras: string[] = [];
  if (options.speciesLabel) {
    extras.push(`ชนิดสัตว์: ${options.speciesLabel}`);
  }
  if (options.reportedAt) {
    const date =
      options.reportedAt instanceof Date
        ? options.reportedAt
        : new Date(options.reportedAt);
    if (!Number.isNaN(date.getTime())) {
      extras.push(`แจ้งเมื่อ: ${formatDateForLine(date)}`);
    }
  }
  if (extras.length > 0) {
    message = `${message}\n${extras.join("\n")}`;
  }

  // กันกรณีข้อความเก่า/คลิปบอร์ดมี text= ติดมา
  return message.replace(/^text=/i, "").trim();
}

function formatDateForLine(date: Date): string {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Deep link เปิดแอป LINE โดยตรงเข้าแชท OA
 * ข้อความให้คัดลอกแล้ววางในแชท — ไม่ใส่ ?text= เพื่อกันบั๊กแสดงคำว่า text=
 */
export function buildClinicLineAppUrl(lineId: string): string {
  const id = normalizeLineId(lineId);
  return `line://ti/p/${id}`;
}

/**
 * Universal / web link — เปิดแชท OA
 */
export function buildClinicLineWebUrl(lineId: string): string {
  const id = normalizeLineId(lineId);
  return `https://line.me/R/ti/p/${id}`;
}

/** @deprecated */
export function buildClinicLineUrl(lineId: string): string {
  return buildClinicLineWebUrl(lineId);
}

export const DEMO_SHELTERS = [
  {
    id: "shelter-bkk-01",
    name: "ศูนย์พักพิงสัตว์จรจัด กรุงเทพมหานคร",
    province: "กรุงเทพมหานคร",
    address: "123 ถนนพหลโยธิน แขวงจอมพล เขตจตุจักร กรุงเทพมหานคร 10900",
    phone: "02-123-4567",
    lineId: "@bkkstray",
    email: "contact@bkk-animal-shelter.demo",
    latitude: 13.8199,
    longitude: 100.5536,
    directions:
      "รถไฟฟ้า BTS หมอชิต ทางออก 3 เดินต่อรถเมล์สาย 3 ประมาณ 10 นาที หรือเรียก Grab ไป「ศูนย์พักพิงสัตว์จรจัด กทม.」",
    openHours: "จันทร์–ศุกร์ 09:00–17:00, เสาร์–อาทิตย์ 10:00–16:00",
  },
  {
    id: "shelter-saraburi-01",
    name: "ศูนย์ดูแลสัตว์จรจัด สระบุรี",
    province: "สระบุรี",
    address: "45 ถนนพหลโยธิน ตำบลปากเพรียว อำเภอเมืองสระบุรี สระบุรี 18000",
    phone: "036-987-654",
    lineId: "@saraburishelter",
    email: "info@saraburi-shelter.demo",
    latitude: 14.5289,
    longitude: 100.9103,
    directions:
      "จากเส้นพหลโยธิน ขับมุ่งหน้าเหนือ ผ่านตลาดปากเพรียวประมาณ 2 กม. ศูนย์อยู่ทางซ้ายมือมีป้าย「ศูนย์ดูแลสัตว์จรจัด」",
    openHours: "ทุกวัน 08:30–16:30",
  },
] as const;
