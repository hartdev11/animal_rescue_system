import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ animals: [], message: "Adoption listing — not implemented" });
}
