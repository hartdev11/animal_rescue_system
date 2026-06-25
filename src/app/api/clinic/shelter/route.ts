import { NextResponse } from "next/server";
import { listShelterCases } from "@/lib/server/case-store";
import { getCaseStatusLabel, PLACEMENT_STATUS_LABELS } from "@/lib/constants";

function normalizeProvince(province: string) {
  return province.trim().normalize("NFC");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get("all") === "true";
    const provinceParam = searchParams.get("province");
    const province = provinceParam ? normalizeProvince(provinceParam) : undefined;

    const cases = await listShelterCases(showAll ? undefined : province);

    return NextResponse.json({
      cases: cases.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        statusLabel: getCaseStatusLabel(c.status, c.wantsToAdopt),
        placementLabel: c.placementStatus
          ? PLACEMENT_STATUS_LABELS[c.placementStatus].th
          : null,
      })),
      total: cases.length,
      awaiting: cases.filter((c) => c.placementStatus === "AWAITING_SHELTER").length,
      inShelter: cases.filter((c) => c.placementStatus === "IN_SHELTER").length,
    });
  } catch (err) {
    console.error("[GET /api/clinic/shelter]", err);
    return NextResponse.json(
      { error: { message: "โหลดรายการศูนย์พักพิงไม่สำเร็จ" } },
      { status: 500 }
    );
  }
}
