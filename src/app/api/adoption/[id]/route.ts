import { NextResponse } from "next/server";
import { getAnimalWithShelter } from "@/lib/server/animal-store";
import { getSpeciesIcon, getSpeciesLabel } from "@/lib/constants";

interface RouteParams {
  params: Promise<{ id: string }>;
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
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${shelter.latitude},${shelter.longitude}`,
      },
    });
  } catch (err) {
    console.error("[GET /api/adoption/[id]]", err);
    return NextResponse.json(
      { error: { message: "โหลดรายละเอียดไม่สำเร็จ" } },
      { status: 500 }
    );
  }
}
