// ─── User & Auth ───────────────────────────────────────────────
export type UserRole = "clinic" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  clinicId?: string;
  displayName?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Clinic ────────────────────────────────────────────────────
export interface Clinic {
  id: string;
  clinicName: string;
  province: string;
  address?: string;
  phone?: string;
  /** LINE Official Account Basic ID เช่น @animalrescue */
  lineId?: string;
  email?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Case ──────────────────────────────────────────────────────
export type CaseStatus =
  | "NEW"
  | "ACCEPTED"
  | "ON_THE_WAY"
  | "RESCUED"
  | "UNDER_TREATMENT"
  | "RECOVERY"
  | "READY_FOR_ADOPTION"
  | "ADOPTED"
  | "CLOSED";

export type AnimalCondition =
  | "HIT_BY_VEHICLE"
  | "BROKEN_LEG"
  | "UNABLE_TO_WALK"
  | "SEVERE_WOUND"
  | "TRAPPED"
  | "EMERGENCY"
  | "OTHER";

/** การจัดหาที่พักหลังรักษา */
export type PlacementStatus =
  | "AWAITING_SHELTER" // รอศูนย์พักพิง / ยังไม่ได้บ้าน
  | "IN_SHELTER" // อยู่ในศูนย์พักพิงแล้ว
  | "HOMED"; // ได้เจ้าของแล้ว

export interface RescueCase {
  id: string;
  caseNumber: string;
  clinicId: string | null;
  reporterName: string;
  phoneNumber: string;
  wantsToAdopt: boolean;
  condition: AnimalCondition;
  description: string;
  imageUrls: string[];
  latitude: number;
  longitude: number;
  province: string;
  status: CaseStatus;
  createdAt: Date;
  updatedAt: Date;
  acceptedAt?: Date;
  closedAt?: Date;
  /** สถานะการจัดหาที่พัก — ใช้หลังฟื้นตัว */
  placementStatus?: PlacementStatus | null;
  /** เป้าหมายบริจาคค่ารักษา (บาท) */
  donationGoal?: number;
  /** ยอดบริจาคที่ได้รับแล้ว (บาท) */
  donationTotal?: number;
}

export type TreatmentReportType = "STABLE" | "CRITICAL" | "DECEASED";

export interface CaseTimelineEvent {
  id: string;
  caseId: string;
  status: CaseStatus;
  title: string;
  description?: string;
  reportType?: TreatmentReportType;
  createdAt: Date;
  createdBy?: string;
}

// ─── Case Updates ──────────────────────────────────────────────
export interface CaseUpdate {
  id: string;
  caseId: string;
  imageUrl?: string;
  note: string;
  createdAt: Date;
  createdBy?: string;
}

// ─── Shelter ───────────────────────────────────────────────────
export interface Shelter {
  id: string;
  name: string;
  province: string;
  address: string;
  phone: string;
  lineId?: string;
  email?: string;
  latitude: number;
  longitude: number;
  directions?: string;
  openHours?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Animals (Adoption) ────────────────────────────────────────
export type AdoptionStatus = "AVAILABLE" | "PENDING" | "ADOPTED";

export type AnimalSpecies = "DOG" | "CAT" | "RABBIT" | "BIRD" | "OTHER";

export type AnimalGender = "MALE" | "FEMALE" | "UNKNOWN";

/** นิสัยที่คลินิกเลือกตรงๆ — ใช้จับคู่เท่านั้น ไม่เดาจากข้อความ */
export type TemperamentTrait =
  | "affectionate"
  | "active"
  | "calm"
  | "independent"
  | "good_with_kids"
  | "good_with_elderly";

export type EnergyLevel = "low" | "medium" | "high";

export interface Animal {
  id: string;
  caseId: string;
  caseNumber: string;
  clinicId: string;
  shelterId: string;
  species: AnimalSpecies;
  breed?: string;
  name: string;
  gender: AnimalGender;
  estimatedAge: string;
  weight?: number;
  description: string;
  personality?: string;
  /** นิสัยที่คลินิกเลือก — ใช้จับคู่ */
  temperamentTraits: TemperamentTrait[];
  /** ระดับพลังงานที่คลินิกประเมิน */
  energyLevel?: EnergyLevel;
  suitableForCondo: boolean;
  suitableForKids: boolean;
  suitableForElderly: boolean;
  hasDisability: boolean;
  disabilityNotes?: string;
  vaccinationStatus: boolean;
  sterilizationStatus: boolean;
  imageUrls: string[];
  adoptionStatus: AdoptionStatus;
  /** false = ร่างจากเคส ยังไม่แสดงหน้าสาธารณะ */
  profileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnimalWithShelter extends Animal {
  shelter: Shelter;
}

// ─── Statistics ────────────────────────────────────────────────
export interface PlatformStatistics {
  totalCases: number;
  animalsRescued: number;
  animalsRecovered: number;
  animalsAdopted: number;
}

export interface ClinicDashboardStats {
  newCases: number;
  acceptedCases: number;
  onTheWay: number;
  underTreatment: number;
  recovery: number;
  readyForAdoption: number;
  closedCases: number;
}

// ─── Form DTOs ─────────────────────────────────────────────────
export interface ReportCaseInput {
  reporterName: string;
  phoneNumber: string;
  wantsToAdopt: boolean;
  condition: AnimalCondition;
  description: string;
  image: File;
  latitude: number;
  longitude: number;
  province: string;
}

export interface CreateAnimalInput {
  caseNumber: string;
  shelterId: string;
  species: AnimalSpecies;
  breed?: string;
  name: string;
  gender: AnimalGender;
  estimatedAge: string;
  weight?: number;
  description: string;
  personality?: string;
  vaccinationStatus: boolean;
  sterilizationStatus: boolean;
  images: File[];
}
