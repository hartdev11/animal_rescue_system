import { NextResponse } from "next/server";
import { listShelters } from "@/lib/server/shelter-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get("province") ?? undefined;

    const shelters = await listShelters(province);

    return NextResponse.json({
      shelters: shelters.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[GET /api/shelters]", err);
    return NextResponse.json(
      { error: { message: "โหลดศูนย์พักพิงไม่สำเร็จ" } },
      { status: 500 }
    );
  }
}
