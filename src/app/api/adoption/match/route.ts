import { NextResponse } from "next/server";
import { z } from "zod";
import { listAvailableAnimals } from "@/lib/server/animal-store";
import { getShelterById } from "@/lib/server/shelter-store";
import { getSpeciesIcon, getSpeciesLabel } from "@/lib/constants";
import {
  matchAnimals,
  getSpeciesFilterLabel,
  type MatchableAnimal,
  type MatchPreferences,
} from "@/lib/adoption-match";

const temperamentTraitSchema = z.enum([
  "affectionate",
  "active",
  "calm",
  "independent",
  "good_with_kids",
  "good_with_elderly",
]);

const matchSchema = z.object({
  mode: z.enum(["quiz", "tags"]),
  quizAnswers: z
    .object({
      livingSpace: z.string().optional(),
      activityLevel: z.string().optional(),
      household: z.string().optional(),
      experience: z.string().optional(),
      temperament: z.string().optional(),
      species: z.string().optional(),
    })
    .optional(),
  selectedTraits: z.array(temperamentTraitSchema).optional(),
  selectedSpecies: z
    .enum(["DOG", "CAT", "RABBIT", "BIRD", "OTHER"])
    .optional(),
  shelterId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = matchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: "ข้อมูลไม่ถูกต้อง" } },
        { status: 400 }
      );
    }

    const { mode, quizAnswers, selectedTraits, selectedSpecies, shelterId } =
      parsed.data;

    if (mode === "tags" && (!selectedTraits?.length || !selectedSpecies)) {
      return NextResponse.json(
        { error: { message: "กรุณาเลือกชนิดสัตว์และแท็กนิสัยอย่างน้อย 1 ข้อ" } },
        { status: 400 }
      );
    }

    if (mode === "quiz" && !quizAnswers) {
      return NextResponse.json(
        { error: { message: "กรุณาตอบแบบทดสอบให้ครบ" } },
        { status: 400 }
      );
    }

    const animals = await listAvailableAnimals({ shelterId });

    const shelterCache = new Map<
      string,
      { name: string; province: string } | null
    >();

    async function getShelterInfo(id: string) {
      if (shelterCache.has(id)) return shelterCache.get(id) ?? null;
      const shelter = await getShelterById(id);
      const info = shelter
        ? { name: shelter.name, province: shelter.province }
        : null;
      shelterCache.set(id, info);
      return info;
    }

    const matchable: MatchableAnimal[] = await Promise.all(
      animals.map(async (a) => {
        const shelter = await getShelterInfo(a.shelterId);
        return {
          id: a.id,
          name: a.name,
          species: a.species,
          speciesLabel: getSpeciesLabel(a.species),
          speciesIcon: getSpeciesIcon(a.species),
          breed: a.breed,
          estimatedAge: a.estimatedAge,
          weight: a.weight,
          description: a.description,
          personality: a.personality,
          temperamentTraits: a.temperamentTraits,
          energyLevel: a.energyLevel,
          suitableForCondo: a.suitableForCondo,
          suitableForKids: a.suitableForKids,
          suitableForElderly: a.suitableForElderly,
          hasDisability: a.hasDisability,
          disabilityNotes: a.disabilityNotes,
          vaccinationStatus: a.vaccinationStatus,
          sterilizationStatus: a.sterilizationStatus,
          coverImage: a.imageUrls[0] ?? null,
          shelterName: shelter?.name ?? null,
          shelterProvince: shelter?.province ?? null,
        };
      })
    );

    const preferences: MatchPreferences = {
      mode,
      quizAnswers,
      selectedTraits,
      selectedSpecies,
      shelterId,
    };

    const results = matchAnimals(matchable, preferences);
    const speciesFilter = getSpeciesFilterLabel(preferences);

    return NextResponse.json({
      results,
      total: results.length,
      speciesFilter,
      dataSource:
        "ข้อมูลจากคลินิกที่กรอกในฟอร์มลงทะเบียน — ไม่มีการเดาจากข้อความอิสระ",
    });
  } catch (err) {
    console.error("[POST /api/adoption/match]", err);
    return NextResponse.json(
      { error: { message: "วิเคราะห์ไม่สำเร็จ" } },
      { status: 500 }
    );
  }
}
