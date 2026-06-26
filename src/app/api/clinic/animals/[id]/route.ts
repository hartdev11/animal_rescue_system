import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getAnimalById,
  getAnimalWithShelter,
  updateAnimal,
  type CreateAnimalImageFile,
} from "@/lib/server/animal-store";
import { getSpeciesIcon, getSpeciesLabel } from "@/lib/constants";
import type { AnimalSpecies, AdoptionStatus } from "@/types";
import { MAX_ANIMAL_IMAGES } from "@/lib/animal-images";
import { animalProfileFromFormData } from "@/lib/animal-form-fields";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateSchema = z.object({
  shelterId: z.string().min(1).optional(),
  species: z.enum(["DOG", "CAT", "RABBIT", "BIRD", "OTHER"]).optional(),
  breed: z.string().max(100).optional(),
  name: z.string().min(1).optional(),
  gender: z.enum(["MALE", "FEMALE", "UNKNOWN"]).optional(),
  estimatedAge: z.string().min(1).optional(),
  weight: z.coerce.number().positive().optional(),
  description: z.string().min(10).optional(),
  personality: z.string().max(500).optional(),
  temperamentTraits: z
    .array(
      z.enum([
        "affectionate",
        "active",
        "calm",
        "independent",
        "good_with_kids",
        "good_with_elderly",
      ])
    )
    .optional(),
  energyLevel: z.enum(["low", "medium", "high"]).optional(),
  suitableForCondo: z.boolean().optional(),
  suitableForKids: z.boolean().optional(),
  suitableForElderly: z.boolean().optional(),
  hasDisability: z.boolean().optional(),
  disabilityNotes: z.string().max(500).optional(),
  vaccinationStatus: z.boolean().optional(),
  sterilizationStatus: z.boolean().optional(),
  adoptionStatus: z.enum(["AVAILABLE", "PENDING", "ADOPTED"]).optional(),
});

async function toImageFiles(files: File[]): Promise<CreateAnimalImageFile[]> {
  return Promise.all(
    files.map(async (file) => ({
      buffer: Buffer.from(await file.arrayBuffer()),
      mimeType: file.type,
      originalName: file.name,
    }))
  );
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const result = await getAnimalWithShelter(id);

    if (!result) {
      return NextResponse.json(
        { error: { message: "ไม่พบสัตว์ตัวนี้" } },
        { status: 404 }
      );
    }

    const { shelter, ...animal } = result;

    return NextResponse.json({
      animal: {
        ...animal,
        createdAt: animal.createdAt.toISOString(),
        updatedAt: animal.updatedAt.toISOString(),
        speciesLabel: getSpeciesLabel(animal.species),
        speciesIcon: getSpeciesIcon(animal.species),
      },
      shelter: {
        ...shelter,
        createdAt: shelter.createdAt.toISOString(),
        updatedAt: shelter.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("[GET /api/clinic/animals/[id]]", err);
    return NextResponse.json(
      { error: { message: "โหลดข้อมูลไม่สำเร็จ" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const existing = await getAnimalById(id);
    if (!existing) {
      return NextResponse.json(
        { error: { message: "ไม่พบสัตว์ตัวนี้" } },
        { status: 404 }
      );
    }

    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const imageFiles = formData
        .getAll("images")
        .filter((f): f is File => f instanceof File && f.size > 0);

      if (imageFiles.length > MAX_ANIMAL_IMAGES) {
        return NextResponse.json(
          { error: { message: `อัปโหลดได้สูงสุด ${MAX_ANIMAL_IMAGES} รูป` } },
          { status: 400 }
        );
      }

      const profile = animalProfileFromFormData(formData);

      const parsed = updateSchema.safeParse({
        shelterId: formData.get("shelterId") || undefined,
        species: formData.get("species") || undefined,
        breed: formData.get("breed") || undefined,
        name: formData.get("name") || undefined,
        gender: formData.get("gender") || undefined,
        estimatedAge: formData.get("estimatedAge") || undefined,
        weight: formData.get("weight") || undefined,
        description: formData.get("description") || undefined,
        personality: formData.get("personality") || undefined,
        ...profile,
        adoptionStatus: formData.get("adoptionStatus") ?? undefined,
        vaccinationStatus: formData.has("vaccinationStatus")
          ? formData.get("vaccinationStatus") === "true"
          : undefined,
        sterilizationStatus: formData.has("sterilizationStatus")
          ? formData.get("sterilizationStatus") === "true"
          : undefined,
      });

      if (!parsed.success) {
        return NextResponse.json(
          { error: { message: "ข้อมูลไม่ถูกต้อง" } },
          { status: 400 }
        );
      }

      const publish = formData.get("publish") === "true";

      const updated = await updateAnimal(id, {
        ...parsed.data,
        species: parsed.data.species as AnimalSpecies | undefined,
        adoptionStatus: parsed.data.adoptionStatus as AdoptionStatus | undefined,
        publish,
        imageFiles: imageFiles.length
          ? await toImageFiles(imageFiles)
          : undefined,
      });

      if (!updated) {
        return NextResponse.json(
          { error: { message: "อัปเดตไม่สำเร็จ" } },
          { status: 400 }
        );
      }

      return NextResponse.json({
        animal: {
          ...updated,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        },
      });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: "ข้อมูลไม่ถูกต้อง" } },
        { status: 400 }
      );
    }

    const updated = await updateAnimal(id, {
      ...parsed.data,
      species: parsed.data.species as AnimalSpecies | undefined,
      adoptionStatus: parsed.data.adoptionStatus as AdoptionStatus | undefined,
    });

    if (!updated) {
      return NextResponse.json(
        { error: { message: "อัปเดตไม่สำเร็จ" } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      animal: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("[PATCH /api/clinic/animals/[id]]", err);
    return NextResponse.json(
      { error: { message: "เกิดข้อผิดพลาดภายในระบบ" } },
      { status: 500 }
    );
  }
}
