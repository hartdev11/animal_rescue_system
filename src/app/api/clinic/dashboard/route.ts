import { NextResponse } from "next/server";
import { getClinicDashboard } from "@/lib/server/case-store";

function normalizeProvince(province: string) {
  return province.trim().normalize("NFC");
}

function serializeCase(c: Awaited<ReturnType<typeof getClinicDashboard>>["recentCases"][0]) {
  return {
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    acceptedAt: c.acceptedAt?.toISOString(),
    closedAt: c.closedAt?.toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get("all") === "true";
    const provinceParam = searchParams.get("province");
    const province = provinceParam ? normalizeProvince(provinceParam) : undefined;

    const data = await getClinicDashboard(showAll ? undefined : province);

    return NextResponse.json({
      ...data,
      recentCases: data.recentCases.map(serializeCase),
      urgentCases: data.urgentCases.map(serializeCase),
    });
  } catch (err) {
    console.error("[GET /api/clinic/dashboard]", err);
    return NextResponse.json(
      { error: { message: "โหลดแดชบอร์ดไม่สำเร็จ" } },
      { status: 500 }
    );
  }
}
