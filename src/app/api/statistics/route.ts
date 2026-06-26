import { NextResponse } from "next/server";
import { getAdoptionStatistics } from "@/lib/server/animal-store";

export async function GET() {
  try {
    const stats = await getAdoptionStatistics();
    return NextResponse.json(stats);
  } catch (err) {
    console.error("[GET /api/statistics]", err);
    return NextResponse.json({
      totalCases: 0,
      animalsRescued: 0,
      animalsRecovered: 0,
      animalsAdopted: 0,
    });
  }
}
