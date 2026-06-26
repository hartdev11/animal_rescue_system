import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { Shelter } from "@/types";
import { DEMO_SHELTERS, FIRESTORE_COLLECTIONS } from "@/lib/constants";
import { getDb } from "@/lib/server/firebase-admin";

function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "string") return new Date(value);
  return new Date();
}

function mapShelter(id: string, data: FirebaseFirestore.DocumentData): Shelter {
  return {
    id,
    name: data.name ?? "",
    province: data.province ?? "",
    address: data.address ?? "",
    phone: data.phone ?? "",
    lineId: data.lineId,
    email: data.email,
    latitude: data.latitude ?? 0,
    longitude: data.longitude ?? 0,
    directions: data.directions,
    openHours: data.openHours,
    isActive: data.isActive !== false,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export async function seedShelters(): Promise<void> {
  const db = getDb();
  const batch = db.batch();

  for (const shelter of DEMO_SHELTERS) {
    batch.set(
      db.collection(FIRESTORE_COLLECTIONS.SHELTERS).doc(shelter.id),
      {
        name: shelter.name,
        province: shelter.province,
        address: shelter.address,
        phone: shelter.phone,
        lineId: shelter.lineId,
        email: shelter.email,
        latitude: shelter.latitude,
        longitude: shelter.longitude,
        directions: shelter.directions,
        openHours: shelter.openHours,
        isActive: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  await batch.commit();
}

export async function listShelters(province?: string): Promise<Shelter[]> {
  await seedShelters().catch(() => {});

  const db = getDb();
  const snap = await db
    .collection(FIRESTORE_COLLECTIONS.SHELTERS)
    .where("isActive", "==", true)
    .get();

  let shelters = snap.docs.map((doc) => mapShelter(doc.id, doc.data()));

  if (province) {
    const normalized = province.trim().normalize("NFC");
    shelters = shelters.filter((s) => s.province === normalized);
  }

  return shelters.sort((a, b) => a.name.localeCompare(b.name, "th"));
}

export async function getShelterById(id: string): Promise<Shelter | null> {
  await seedShelters().catch(() => {});

  const db = getDb();
  const doc = await db.collection(FIRESTORE_COLLECTIONS.SHELTERS).doc(id).get();
  if (!doc.exists) return null;
  return mapShelter(doc.id, doc.data()!);
}
