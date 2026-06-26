import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type {
  Animal,
  AnimalGender,
  AnimalSpecies,
  AnimalWithShelter,
  AdoptionStatus,
  EnergyLevel,
  TemperamentTrait,
} from "@/types";
import {
  DEMO_CLINIC_ID,
  DEMO_CLINICS,
  FIRESTORE_COLLECTIONS,
} from "@/lib/constants";
import { parseEnergyLevel, parseTemperamentTraits } from "@/lib/animal-form-fields";
import { getDb, uploadAnimalImages } from "@/lib/server/firebase-admin";
import { getCaseByNumber, updatePlacement, listShelterCases } from "@/lib/server/case-store";
import { getShelterById, seedShelters, listShelters } from "@/lib/server/shelter-store";

export interface CreateAnimalImageFile {
  buffer: Buffer;
  mimeType: string;
  originalName?: string;
}

export interface CreateAnimalData {
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
  temperamentTraits?: TemperamentTrait[];
  energyLevel?: EnergyLevel;
  suitableForCondo?: boolean;
  suitableForKids?: boolean;
  suitableForElderly?: boolean;
  hasDisability?: boolean;
  disabilityNotes?: string;
  vaccinationStatus: boolean;
  sterilizationStatus: boolean;
  imageFiles?: CreateAnimalImageFile[];
}

export interface UpdateAnimalData {
  shelterId?: string;
  species?: AnimalSpecies;
  breed?: string;
  name?: string;
  gender?: AnimalGender;
  estimatedAge?: string;
  weight?: number;
  description?: string;
  personality?: string;
  temperamentTraits?: TemperamentTrait[];
  energyLevel?: EnergyLevel;
  suitableForCondo?: boolean;
  suitableForKids?: boolean;
  suitableForElderly?: boolean;
  hasDisability?: boolean;
  disabilityNotes?: string;
  vaccinationStatus?: boolean;
  sterilizationStatus?: boolean;
  adoptionStatus?: AdoptionStatus;
  imageFiles?: CreateAnimalImageFile[];
  /** บันทึกจากฟอร์มคลินิก = เผยแพร่หน้าสาธารณะ */
  publish?: boolean;
}

function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "string") return new Date(value);
  return new Date();
}

function mapAnimal(id: string, data: FirebaseFirestore.DocumentData): Animal {
  return {
    id,
    caseId: data.caseId ?? "",
    caseNumber: data.caseNumber ?? "",
    clinicId: data.clinicId ?? "",
    shelterId: data.shelterId ?? "",
    species: data.species,
    breed: data.breed,
    name: data.name ?? "",
    gender: data.gender ?? "UNKNOWN",
    estimatedAge: data.estimatedAge ?? "",
    weight: data.weight,
    description: data.description ?? "",
    personality: data.personality,
    temperamentTraits: parseTemperamentTraits(data.temperamentTraits),
    energyLevel: parseEnergyLevel(data.energyLevel),
    suitableForCondo: Boolean(data.suitableForCondo),
    suitableForKids: Boolean(data.suitableForKids),
    suitableForElderly: Boolean(data.suitableForElderly),
    hasDisability: Boolean(data.hasDisability),
    disabilityNotes: data.disabilityNotes,
    vaccinationStatus: Boolean(data.vaccinationStatus),
    sterilizationStatus: Boolean(data.sterilizationStatus),
    imageUrls: data.imageUrls ?? [],
    adoptionStatus: data.adoptionStatus ?? "AVAILABLE",
    profileComplete: data.profileComplete !== false,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

const DEMO_ANIMAL_IMAGES = {
  dog: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
  cat: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80",
  rabbit: "https://images.unsplash.com/photo-1585110391145-9164c3e906d1?w=800&q=80",
} as const;

async function seedDemoAnimals(): Promise<void> {
  const db = getDb();
  const existing = await db.collection(FIRESTORE_COLLECTIONS.ANIMALS).limit(1).get();
  if (!existing.empty) return;

  await seedShelters();

  const now = Timestamp.now();
  const demos = [
    {
      id: "animal-demo-01",
      caseId: "demo",
      caseNumber: "DEMO-000001",
      clinicId: DEMO_CLINIC_ID,
      shelterId: "shelter-bkk-01",
      species: "DOG" as AnimalSpecies,
      breed: "ไทยหลังอาน",
      name: "มะลิ",
      gender: "FEMALE" as AnimalGender,
      estimatedAge: "2 ปี",
      weight: 12,
      description:
        "สุนัขพันธุ์ไทยหลังอาน ฟื้นตัวจากอุบัติเหตุเรียบร้อยแล้ว ขาแข็งแรงดี ชอบเล่นกับคน",
      personality: "ขี้อ้อน ชอบให้ลูบหัว ไม่กัดคน อยู่กับเด็กได้",
      temperamentTraits: ["affectionate", "active", "good_with_kids"] as TemperamentTrait[],
      energyLevel: "medium" as EnergyLevel,
      suitableForCondo: false,
      suitableForKids: true,
      suitableForElderly: false,
      hasDisability: false,
      vaccinationStatus: true,
      sterilizationStatus: true,
      imageUrls: [DEMO_ANIMAL_IMAGES.dog],
    },
    {
      id: "animal-demo-02",
      caseId: "demo",
      caseNumber: "DEMO-000002",
      clinicId: DEMO_CLINIC_ID,
      shelterId: "shelter-bkk-01",
      species: "CAT" as AnimalSpecies,
      breed: "สีสวาด",
      name: "จอมโหด",
      gender: "MALE" as AnimalGender,
      estimatedAge: "1 ปี",
      weight: 4,
      description: "แมวจรจัดที่ช่วยเหลือจากถูกทิ้ง สุขภาพดี ฉีดวัคซีนครบ",
      personality: "เงียบๆ ชอบนอนอุ่นๆ ค่อยๆ เปิดใจกับคนใหม่",
      temperamentTraits: ["calm", "independent"] as TemperamentTrait[],
      energyLevel: "low" as EnergyLevel,
      suitableForCondo: true,
      suitableForKids: false,
      suitableForElderly: true,
      hasDisability: false,
      vaccinationStatus: true,
      sterilizationStatus: true,
      imageUrls: [DEMO_ANIMAL_IMAGES.cat],
    },
    {
      id: "animal-demo-03",
      caseId: "demo",
      caseNumber: "DEMO-000003",
      clinicId: "clinic-saraburi",
      shelterId: "shelter-saraburi-01",
      species: "RABBIT" as AnimalSpecies,
      breed: "ฮอลแลนด์ลอป",
      name: "กระต่ายขาว",
      gender: "FEMALE" as AnimalGender,
      estimatedAge: "8 เดือน",
      weight: 2,
      description: "กระต่ายแข็งแรง กินอาหารได้ดี ต้องการบ้านที่มีพื้นที่วิ่งเล่น",
      personality: "ขี้อาย ชอบแครอทและผักใบเขียว",
      temperamentTraits: ["calm", "independent"] as TemperamentTrait[],
      energyLevel: "low" as EnergyLevel,
      suitableForCondo: true,
      suitableForKids: false,
      suitableForElderly: true,
      hasDisability: false,
      vaccinationStatus: false,
      sterilizationStatus: true,
      imageUrls: [DEMO_ANIMAL_IMAGES.rabbit],
    },
  ];

  const batch = db.batch();
  for (const animal of demos) {
    batch.set(db.collection(FIRESTORE_COLLECTIONS.ANIMALS).doc(animal.id), {
      ...animal,
      adoptionStatus: "AVAILABLE",
      profileComplete: true,
      createdAt: now,
      updatedAt: now,
    });
  }
  await batch.commit();
}

export async function getAnimalById(id: string): Promise<Animal | null> {
  await seedDemoAnimals().catch(() => {});

  const db = getDb();
  const doc = await db.collection(FIRESTORE_COLLECTIONS.ANIMALS).doc(id).get();
  if (!doc.exists) return null;
  return mapAnimal(doc.id, doc.data()!);
}

export async function getAnimalByCaseId(caseId: string): Promise<Animal | null> {
  const db = getDb();
  const snap = await db
    .collection(FIRESTORE_COLLECTIONS.ANIMALS)
    .where("caseId", "==", caseId)
    .limit(1)
    .get();

  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  return mapAnimal(doc.id, doc.data());
}

/** ซิงก์สัตว์ออกจากหน้ารับเลี้ยงเมื่อเคสได้เจ้าของแล้ว */
export async function markAnimalAdoptedByCaseId(caseId: string): Promise<void> {
  const db = getDb();
  const snap = await db
    .collection(FIRESTORE_COLLECTIONS.ANIMALS)
    .where("caseId", "==", caseId)
    .limit(1)
    .get();

  if (snap.empty) return;

  const doc = snap.docs[0]!;
  const data = doc.data();
  if (data.adoptionStatus === "ADOPTED") return;

  await doc.ref.update({
    adoptionStatus: "ADOPTED",
    profileComplete: true,
    updatedAt: Timestamp.fromDate(new Date()),
  });
}

function defaultDraftName(caseNumber: string) {
  return `สัตว์จากเคส ${caseNumber}`;
}

function isProfileReady(
  animal: Pick<
    Animal,
    | "name"
    | "species"
    | "estimatedAge"
    | "description"
    | "shelterId"
    | "temperamentTraits"
    | "energyLevel"
    | "hasDisability"
    | "disabilityNotes"
  >
): boolean {
  return (
    animal.name.trim().length > 0 &&
    !animal.name.startsWith("สัตว์จากเคส ") &&
    !!animal.species &&
    animal.estimatedAge.trim().length > 0 &&
    animal.estimatedAge !== "ไม่ทราบ" &&
    animal.description.trim().length >= 10 &&
    !!animal.shelterId &&
    animal.temperamentTraits.length >= 1 &&
    !!animal.energyLevel &&
    (!animal.hasDisability ||
      (animal.disabilityNotes?.trim().length ?? 0) >= 5)
  );
}

async function resolveDefaultShelterId(province: string): Promise<string | null> {
  const shelters = await listShelters(province);
  return shelters[0]?.id ?? null;
}

/** สร้างร่างสัตว์จากเคส — ดึงรูปจากเคสทันที รอกรอกรายละเอียดจากคลินิก */
export async function ensureDraftAnimalFromCase(
  caseNumber: string
): Promise<Animal | null> {
  const rescueCase = await getCaseByNumber(caseNumber);
  if (!rescueCase || rescueCase.wantsToAdopt) return null;

  const allowedPlacement =
    rescueCase.placementStatus === "AWAITING_SHELTER" ||
    rescueCase.placementStatus === "IN_SHELTER";

  if (!allowedPlacement) return null;

  const existing = await getAnimalByCaseId(rescueCase.id);
  if (existing) return existing;

  const shelterId = await resolveDefaultShelterId(rescueCase.province);
  if (!shelterId) return null;

  const clinicId =
    rescueCase.clinicId ||
    DEMO_CLINICS.find((c) => c.province === rescueCase.province)?.id ||
    DEMO_CLINIC_ID;

  const db = getDb();
  const now = new Date();
  const id = `animal_${Date.now()}`;

  const animal: Animal = {
    id,
    caseId: rescueCase.id,
    caseNumber: rescueCase.caseNumber,
    clinicId,
    shelterId,
    species: "OTHER",
    name: defaultDraftName(rescueCase.caseNumber),
    gender: "UNKNOWN",
    estimatedAge: "ไม่ทราบ",
    description:
      rescueCase.description.trim().length >= 10
        ? rescueCase.description.trim()
        : "สัตว์ฟื้นตัวแล้ว รอคลินิกกรอกรายละเอียดเพิ่มเติม",
    temperamentTraits: [],
    suitableForCondo: false,
    suitableForKids: false,
    suitableForElderly: false,
    hasDisability: false,
    vaccinationStatus: false,
    sterilizationStatus: false,
    imageUrls: rescueCase.imageUrls ?? [],
    adoptionStatus: "PENDING",
    profileComplete: false,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection(FIRESTORE_COLLECTIONS.ANIMALS).doc(id).set({
    ...animal,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });

  return animal;
}

export async function syncDraftAnimalsForProvince(
  province?: string
): Promise<number> {
  const cases = await listShelterCases(province);
  let created = 0;

  for (const rescueCase of cases) {
    if (rescueCase.wantsToAdopt) continue;
    const existing = await getAnimalByCaseId(rescueCase.id);
    if (existing) continue;
    const draft = await ensureDraftAnimalFromCase(rescueCase.caseNumber);
    if (draft) created += 1;
  }

  return created;
}

/** ดึงเคสศูนย์พักพิงทุกจังหวัดมาสร้างร่าง (สำหรับข้อมูลเก่า) */
export async function publishReadyPendingAnimals(): Promise<number> {
  const db = getDb();
  const snap = await db
    .collection(FIRESTORE_COLLECTIONS.ANIMALS)
    .where("adoptionStatus", "==", "PENDING")
    .get();

  let published = 0;
  const now = new Date();

  for (const doc of snap.docs) {
    const animal = mapAnimal(doc.id, doc.data());
    if (!isProfileReady(animal)) continue;
    await doc.ref.update({
      adoptionStatus: "AVAILABLE",
      profileComplete: true,
      updatedAt: now,
    });
    published += 1;
  }

  return published;
}

export async function syncAllDraftAnimals(): Promise<{
  created: number;
  published: number;
}> {
  const created = await syncDraftAnimalsForProvince(undefined);
  const published = await publishReadyPendingAnimals();
  return { created, published };
}

export async function getAnimalByCaseNumber(
  caseNumber: string
): Promise<Animal | null> {
  const rescueCase = await getCaseByNumber(caseNumber);
  if (!rescueCase) return null;
  return getAnimalByCaseId(rescueCase.id);
}

export async function getAnimalWithShelter(
  id: string
): Promise<AnimalWithShelter | null> {
  const animal = await getAnimalById(id);
  if (!animal) return null;

  const shelter = await getShelterById(animal.shelterId);
  if (!shelter) return null;

  return { ...animal, shelter };
}

export async function listAvailableAnimals(
  options?: { species?: AnimalSpecies; shelterId?: string }
): Promise<Animal[]> {
  await seedDemoAnimals().catch(() => {});

  const db = getDb();
  const snap = await db
    .collection(FIRESTORE_COLLECTIONS.ANIMALS)
    .where("adoptionStatus", "==", "AVAILABLE")
    .get();

  let animals = snap.docs.map((doc) => mapAnimal(doc.id, doc.data()));

  animals = animals.filter(
    (a) => a.adoptionStatus === "AVAILABLE" && a.profileComplete !== false
  );

  if (options?.shelterId) {
    animals = animals.filter((a) => a.shelterId === options.shelterId);
  }

  if (options?.species) {
    animals = animals.filter((a) => a.species === options.species);
  }

  return animals.sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
}

export async function listClinicAnimals(
  clinicId?: string,
  adoptionStatus?: AdoptionStatus
): Promise<Animal[]> {
  await seedDemoAnimals().catch(() => {});

  const db = getDb();
  let query: FirebaseFirestore.Query = db.collection(FIRESTORE_COLLECTIONS.ANIMALS);

  if (clinicId) {
    query = query.where("clinicId", "==", clinicId);
  }

  const snap = await query.get();
  let animals = snap.docs.map((doc) => mapAnimal(doc.id, doc.data()));

  if (adoptionStatus) {
    animals = animals.filter((a) => a.adoptionStatus === adoptionStatus);
  }

  return animals.sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
}

export async function createAnimal(data: CreateAnimalData): Promise<Animal | null> {
  const rescueCase = await getCaseByNumber(data.caseNumber);
  if (!rescueCase) return null;

  const existing = await getAnimalByCaseId(rescueCase.id);
  if (existing) return null;

  const allowedPlacement =
    rescueCase.placementStatus === "AWAITING_SHELTER" ||
    rescueCase.placementStatus === "IN_SHELTER";

  if (!allowedPlacement) return null;

  const shelter = await getShelterById(data.shelterId);
  if (!shelter) return null;

  const clinicId =
    data.clinicId ||
    rescueCase.clinicId ||
    DEMO_CLINICS.find((c) => c.province === rescueCase.province)?.id ||
    DEMO_CLINIC_ID;

  const db = getDb();
  const now = new Date();
  const id = `animal_${Date.now()}`;

  const uploadedUrls = data.imageFiles?.length
    ? await uploadAnimalImages(id, data.imageFiles)
    : [];

  const imageUrls = [...new Set([...rescueCase.imageUrls, ...uploadedUrls])];

  const animal: Animal = {
    id,
    caseId: rescueCase.id,
    caseNumber: rescueCase.caseNumber,
    clinicId,
    shelterId: data.shelterId,
    species: data.species,
    breed: data.breed?.trim() || undefined,
    name: data.name.trim(),
    gender: data.gender,
    estimatedAge: data.estimatedAge.trim(),
    weight: data.weight,
    description: data.description.trim(),
    personality: data.personality?.trim() || undefined,
    temperamentTraits: data.temperamentTraits ?? [],
    energyLevel: data.energyLevel,
    suitableForCondo: data.suitableForCondo ?? false,
    suitableForKids: data.suitableForKids ?? false,
    suitableForElderly: data.suitableForElderly ?? false,
    hasDisability: data.hasDisability ?? false,
    disabilityNotes: data.disabilityNotes?.trim() || undefined,
    vaccinationStatus: data.vaccinationStatus,
    sterilizationStatus: data.sterilizationStatus,
    imageUrls,
    adoptionStatus: "AVAILABLE",
    profileComplete: true,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection(FIRESTORE_COLLECTIONS.ANIMALS).doc(id).set({
    ...animal,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });

  if (rescueCase.placementStatus === "AWAITING_SHELTER") {
    await updatePlacement(
      data.caseNumber,
      "markInShelter",
      `ลงทะเบียนรับเลี้ยง: ${animal.name} ที่ ${shelter.name}`
    );
  }

  return animal;
}

export async function updateAnimal(
  id: string,
  data: UpdateAnimalData
): Promise<Animal | null> {
  const current = await getAnimalById(id);
  if (!current) return null;

  if (data.shelterId) {
    const shelter = await getShelterById(data.shelterId);
    if (!shelter) return null;
  }

  const db = getDb();
  const now = new Date();

  let imageUrls = current.imageUrls;
  if (data.imageFiles?.length) {
    const uploaded = await uploadAnimalImages(id, data.imageFiles);
    imageUrls = [...current.imageUrls, ...uploaded];
  }

  const patch: Record<string, unknown> = {
    updatedAt: Timestamp.fromDate(now),
  };

  if (data.shelterId !== undefined) patch.shelterId = data.shelterId;
  if (data.species !== undefined) patch.species = data.species;
  if (data.breed !== undefined) patch.breed = data.breed?.trim() || null;
  if (data.name !== undefined) patch.name = data.name.trim();
  if (data.gender !== undefined) patch.gender = data.gender;
  if (data.estimatedAge !== undefined) patch.estimatedAge = data.estimatedAge.trim();
  if (data.weight !== undefined) patch.weight = data.weight ?? null;
  if (data.description !== undefined) patch.description = data.description.trim();
  if (data.personality !== undefined) patch.personality = data.personality?.trim() || null;
  if (data.temperamentTraits !== undefined) patch.temperamentTraits = data.temperamentTraits;
  if (data.energyLevel !== undefined) patch.energyLevel = data.energyLevel ?? null;
  if (data.suitableForCondo !== undefined) patch.suitableForCondo = data.suitableForCondo;
  if (data.suitableForKids !== undefined) patch.suitableForKids = data.suitableForKids;
  if (data.suitableForElderly !== undefined) patch.suitableForElderly = data.suitableForElderly;
  if (data.hasDisability !== undefined) patch.hasDisability = data.hasDisability;
  if (data.disabilityNotes !== undefined) {
    patch.disabilityNotes = data.disabilityNotes?.trim() || null;
  }
  if (data.vaccinationStatus !== undefined) patch.vaccinationStatus = data.vaccinationStatus;
  if (data.sterilizationStatus !== undefined) patch.sterilizationStatus = data.sterilizationStatus;
  if (data.adoptionStatus !== undefined) patch.adoptionStatus = data.adoptionStatus;
  if (data.imageFiles?.length) patch.imageUrls = imageUrls;

  const merged: Animal = {
    ...current,
    shelterId: (patch.shelterId as string) ?? current.shelterId,
    species: (patch.species as AnimalSpecies) ?? current.species,
    breed: data.breed !== undefined ? data.breed?.trim() || undefined : current.breed,
    name: (patch.name as string) ?? current.name,
    gender: (patch.gender as AnimalGender) ?? current.gender,
    estimatedAge: (patch.estimatedAge as string) ?? current.estimatedAge,
    weight: data.weight !== undefined ? data.weight : current.weight,
    description: (patch.description as string) ?? current.description,
    personality:
      data.personality !== undefined
        ? data.personality?.trim() || undefined
        : current.personality,
    temperamentTraits:
      data.temperamentTraits !== undefined
        ? data.temperamentTraits
        : current.temperamentTraits,
    energyLevel:
      data.energyLevel !== undefined ? data.energyLevel : current.energyLevel,
    suitableForCondo:
      data.suitableForCondo !== undefined
        ? data.suitableForCondo
        : current.suitableForCondo,
    suitableForKids:
      data.suitableForKids !== undefined
        ? data.suitableForKids
        : current.suitableForKids,
    suitableForElderly:
      data.suitableForElderly !== undefined
        ? data.suitableForElderly
        : current.suitableForElderly,
    hasDisability:
      data.hasDisability !== undefined ? data.hasDisability : current.hasDisability,
    disabilityNotes:
      data.disabilityNotes !== undefined
        ? data.disabilityNotes?.trim() || undefined
        : current.disabilityNotes,
    vaccinationStatus:
      data.vaccinationStatus !== undefined
        ? data.vaccinationStatus
        : current.vaccinationStatus,
    sterilizationStatus:
      data.sterilizationStatus !== undefined
        ? data.sterilizationStatus
        : current.sterilizationStatus,
    adoptionStatus:
      (patch.adoptionStatus as AdoptionStatus) ?? current.adoptionStatus,
    imageUrls,
  };

  if (
    merged.adoptionStatus !== "ADOPTED" &&
    (data.publish || isProfileReady(merged))
  ) {
    patch.adoptionStatus = "AVAILABLE";
    patch.profileComplete = true;
    merged.adoptionStatus = "AVAILABLE";
    merged.profileComplete = true;
  }

  await db.collection(FIRESTORE_COLLECTIONS.ANIMALS).doc(id).update(patch);

  if (merged.adoptionStatus === "AVAILABLE" && merged.profileComplete) {
    const rescueCase = await getCaseByNumber(current.caseNumber);
    if (
      rescueCase?.placementStatus === "AWAITING_SHELTER" ||
      rescueCase?.placementStatus === "IN_SHELTER"
    ) {
      if (rescueCase.placementStatus === "AWAITING_SHELTER") {
        await updatePlacement(
          current.caseNumber,
          "markInShelter",
          `เผยแพร่รับเลี้ยง: ${merged.name}`
        );
      }
    }
  }

  if (data.adoptionStatus === "ADOPTED" || patch.adoptionStatus === "ADOPTED") {
    await updatePlacement(
      current.caseNumber,
      "markHomed",
      `สัตว์ ${current.name} ได้เจ้าของแล้ว`
    );
  }

  return {
    ...current,
    shelterId: (patch.shelterId as string) ?? current.shelterId,
    species: (patch.species as AnimalSpecies) ?? current.species,
    breed: data.breed !== undefined ? data.breed?.trim() || undefined : current.breed,
    name: (patch.name as string) ?? current.name,
    gender: (patch.gender as AnimalGender) ?? current.gender,
    estimatedAge: (patch.estimatedAge as string) ?? current.estimatedAge,
    weight: data.weight !== undefined ? data.weight : current.weight,
    description: (patch.description as string) ?? current.description,
    personality:
      data.personality !== undefined
        ? data.personality?.trim() || undefined
        : current.personality,
    temperamentTraits:
      data.temperamentTraits !== undefined
        ? data.temperamentTraits
        : current.temperamentTraits,
    energyLevel:
      data.energyLevel !== undefined ? data.energyLevel : current.energyLevel,
    suitableForCondo:
      data.suitableForCondo !== undefined
        ? data.suitableForCondo
        : current.suitableForCondo,
    suitableForKids:
      data.suitableForKids !== undefined
        ? data.suitableForKids
        : current.suitableForKids,
    suitableForElderly:
      data.suitableForElderly !== undefined
        ? data.suitableForElderly
        : current.suitableForElderly,
    hasDisability:
      data.hasDisability !== undefined ? data.hasDisability : current.hasDisability,
    disabilityNotes:
      data.disabilityNotes !== undefined
        ? data.disabilityNotes?.trim() || undefined
        : current.disabilityNotes,
    vaccinationStatus:
      data.vaccinationStatus !== undefined
        ? data.vaccinationStatus
        : current.vaccinationStatus,
    sterilizationStatus:
      data.sterilizationStatus !== undefined
        ? data.sterilizationStatus
        : current.sterilizationStatus,
    adoptionStatus:
      data.adoptionStatus !== undefined ? data.adoptionStatus : merged.adoptionStatus,
    profileComplete: merged.profileComplete,
    imageUrls,
    updatedAt: now,
  };
}

export async function getAdoptionStatistics() {
  await seedDemoAnimals().catch(() => {});

  const db = getDb();
  const [casesSnap, animalsSnap] = await Promise.all([
    db.collection(FIRESTORE_COLLECTIONS.CASES).get(),
    db.collection(FIRESTORE_COLLECTIONS.ANIMALS).get(),
  ]);

  const cases = casesSnap.docs.map((d) => d.data());
  const animals = animalsSnap.docs.map((d) => d.data());

  const rescuedStatuses = new Set([
    "RESCUED",
    "UNDER_TREATMENT",
    "RECOVERY",
    "READY_FOR_ADOPTION",
    "ADOPTED",
    "CLOSED",
  ]);

  return {
    totalCases: cases.length,
    animalsRescued: cases.filter((c) => rescuedStatuses.has(c.status)).length,
    animalsRecovered: cases.filter((c) =>
      ["RECOVERY", "READY_FOR_ADOPTION", "ADOPTED"].includes(c.status)
    ).length,
    animalsAdopted: animals.filter((a) => a.adoptionStatus === "ADOPTED").length,
  };
}
