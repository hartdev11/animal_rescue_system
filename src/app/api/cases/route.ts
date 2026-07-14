import { NextResponse } from "next/server";
import { z } from "zod";
import { ANIMAL_CONDITIONS, ANIMAL_SPECIES } from "@/lib/constants";
import { MAX_CASE_IMAGES } from "@/lib/case-images";
import { createCase, type CreateCaseImageFile } from "@/lib/server/case-store";
import type { AnimalCondition, AnimalSpecies } from "@/types";

const conditionValues = ANIMAL_CONDITIONS.map((c) => c.value);
const speciesValues = ANIMAL_SPECIES.map((s) => s.value);

const bodySchema = z.object({
  reporterName: z.string().trim().min(1).max(100),
  phoneNumber: z.string().min(9).max(15),
  wantsToAdopt: z
    .enum(["true", "false"])
    .transform((v) => v === "true"),
  species: z.enum(speciesValues as [string, ...string[]]),
  condition: z.enum(conditionValues as [string, ...string[]]),
  description: z.string().min(10).max(1000),
  province: z.string().min(1),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

async function toImageFiles(files: File[]): Promise<CreateCaseImageFile[]> {
  return Promise.all(
    files.map(async (file) => ({
      buffer: Buffer.from(await file.arrayBuffer()),
      mimeType: file.type,
      originalName: file.name,
    }))
  );
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFiles = formData
      .getAll("images")
      .filter((f): f is File => f instanceof File && f.size > 0);

    if (imageFiles.length === 0) {
      return NextResponse.json(
        { error: { message: "กรุณาอัปโหลดรูปสัตว์อย่างน้อย 1 รูป" } },
        { status: 400 }
      );
    }

    if (imageFiles.length > MAX_CASE_IMAGES) {
      return NextResponse.json(
        { error: { message: `อัปโหลดได้สูงสุด ${MAX_CASE_IMAGES} รูป` } },
        { status: 400 }
      );
    }

    const parsed = bodySchema.safeParse({
      reporterName: formData.get("reporterName"),
      phoneNumber: formData.get("phoneNumber"),
      wantsToAdopt: formData.get("wantsToAdopt") ?? "false",
      species: formData.get("species"),
      condition: formData.get("condition"),
      description: formData.get("description"),
      province: formData.get("province"),
      latitude: formData.get("latitude"),
      longitude: formData.get("longitude"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: "ข้อมูลไม่ครบหรือไม่ถูกต้อง" } },
        { status: 400 }
      );
    }

    const rescueCase = await createCase({
      ...parsed.data,
      species: parsed.data.species as AnimalSpecies,
      condition: parsed.data.condition as AnimalCondition,
      imageFiles: await toImageFiles(imageFiles),
    });

    return NextResponse.json(
      {
        caseNumber: rescueCase.caseNumber,
        trackingUrl: `/case/${rescueCase.caseNumber}`,
        id: rescueCase.id,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/cases]", err);
    return NextResponse.json(
      { error: { message: "เกิดข้อผิดพลาดภายในระบบ" } },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST to create a case" });
}
