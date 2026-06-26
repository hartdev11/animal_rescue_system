import { NextResponse } from "next/server";
import { listAvailableAnimals } from "@/lib/server/animal-store";
import { getShelterById } from "@/lib/server/shelter-store";
import { getSpeciesIcon, getSpeciesLabel } from "@/lib/constants";
import type { AnimalSpecies } from "@/types";

const SPECIES_VALUES = ["DOG", "CAT", "RABBIT", "BIRD", "OTHER"] as const;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const speciesParam = searchParams.get("species");
    const shelterId = searchParams.get("shelterId") ?? undefined;
    const species =
      speciesParam && SPECIES_VALUES.includes(speciesParam as AnimalSpecies)
        ? (speciesParam as AnimalSpecies)
        : undefined;

    const animals = await listAvailableAnimals({ species, shelterId });

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

    const enriched = await Promise.all(
      animals.map(async (a) => {
        const shelter = await getShelterInfo(a.shelterId);
        return {
          ...a,
          createdAt: a.createdAt.toISOString(),
          updatedAt: a.updatedAt.toISOString(),
          speciesLabel: getSpeciesLabel(a.species),
          speciesIcon: getSpeciesIcon(a.species),
          coverImage: a.imageUrls[0] ?? null,
          shelterName: shelter?.name ?? null,
          shelterProvince: shelter?.province ?? null,
        };
      })
    );

    return NextResponse.json({
      animals: enriched,
      total: enriched.length,
    });
  } catch (err) {
    console.error("[GET /api/adoption]", err);
    return NextResponse.json(
      { error: { message: "โหลดรายการสัตว์ไม่สำเร็จ" } },
      { status: 500 }
    );
  }
}
