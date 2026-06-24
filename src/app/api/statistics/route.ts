import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    totalCases: 0,
    animalsRescued: 0,
    animalsRecovered: 0,
    animalsAdopted: 0,
  });
}
