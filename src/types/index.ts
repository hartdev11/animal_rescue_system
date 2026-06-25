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

// ─── Animals (Adoption) ────────────────────────────────────────
export type AdoptionStatus = "AVAILABLE" | "PENDING" | "ADOPTED";

export type AnimalGender = "MALE" | "FEMALE" | "UNKNOWN";

export interface Animal {
  id: string;
  caseId: string;
  clinicId: string;
  name: string;
  gender: AnimalGender;
  estimatedAge: string;
  weight?: number;
  description: string;
  personality?: string;
  vaccinationStatus: boolean;
  sterilizationStatus: boolean;
  imageUrls: string[];
  adoptionStatus: AdoptionStatus;
  createdAt: Date;
  updatedAt: Date;
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
  caseId: string;
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
