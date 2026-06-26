import { NextResponse } from "next/server";
import { z } from "zod";
import { animalSchema } from "@/lib/validations/schemas";
import { animalSchemaInputFromFormData } from "@/lib/animal-form-fields";
import {
  createAnimal,
  listClinicAnimals,
  syncDraftAnimalsForProvince,
  syncAllDraftAnimals,
  type CreateAnimalImageFile,
} from "@/lib/server/animal-store";
import { getSpeciesIcon, getSpeciesLabel } from "@/lib/constants";
import { DEMO_CLINIC_ID } from "@/lib/constants";
import type { AnimalSpecies } from "@/types";
import { MAX_ANIMAL_IMAGES } from "@/lib/animal-images";

async function toImageFiles(files: File[]): Promise<CreateAnimalImageFile[]> {
  return Promise.all(
    files.map(async (file) => ({
      buffer: Buffer.from(await file.arrayBuffer()),
      mimeType: file.type,
      originalName: file.name,
    }))
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId") ?? undefined;
    const province = searchParams.get("province") ?? undefined;
    const status = searchParams.get("status") as
      | "AVAILABLE"
      | "PENDING"
      | "ADOPTED"
      | null;
    const sync = searchParams.get("sync") !== "false";
    const syncAll = searchParams.get("all") === "true";

    if (sync) {
      if (syncAll) {
        await syncAllDraftAnimals();
      } else if (province) {
        await syncDraftAnimalsForProvince(province);
      }
    }

    const animals = await listClinicAnimals(
      clinicId ?? undefined,
      status ?? undefined
    );

    return NextResponse.json({
      animals: animals.map((a) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
        speciesLabel: getSpeciesLabel(a.species),
        speciesIcon: getSpeciesIcon(a.species),
        coverImage: a.imageUrls[0] ?? null,
        profileComplete: a.profileComplete,
      })),
    });
  } catch (err) {
    console.error("[GET /api/clinic/animals]", err);
    return NextResponse.json(
      { error: { message: "โหลดรายการสัตว์ไม่สำเร็จ" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    const parsed = animalSchema.safeParse(animalSchemaInputFromFormData(formData));

    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: "ข้อมูลไม่ครบหรือไม่ถูกต้อง" } },
        { status: 400 }
      );
    }

    const clinicId =
      (formData.get("clinicId") as string | null) ?? DEMO_CLINIC_ID;

    const animal = await createAnimal({
      ...parsed.data,
      species: parsed.data.species as AnimalSpecies,
      clinicId,
      imageFiles: imageFiles.length
        ? await toImageFiles(imageFiles)
        : undefined,
    });

    if (!animal) {
      return NextResponse.json(
        {
          error: {
            message:
              "ไม่สามารถลงทะเบียนได้ (เคสไม่พบ, ลงทะเบียนแล้ว หรือสถานะไม่ถูกต้อง)",
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        id: animal.id,
        animal: {
          ...animal,
          createdAt: animal.createdAt.toISOString(),
          updatedAt: animal.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/clinic/animals]", err);
    return NextResponse.json(
      { error: { message: "เกิดข้อผิดพลาดภายในระบบ" } },
      { status: 500 }
    );
  }
}
