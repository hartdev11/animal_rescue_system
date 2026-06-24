import { NextResponse } from "next/server";
import { listCases } from "@/lib/server/case-store";
import type { CaseStatus } from "@/types";

function normalizeProvince(province: string) {
  return province.trim().normalize("NFC");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const showAll = searchParams.get("all") === "true";
  const provinceParam = searchParams.get("province");
  const province = provinceParam ? normalizeProvince(provinceParam) : undefined;
  const status = searchParams.get("status") as CaseStatus | null;

  const cases = await listCases({
    province: showAll ? undefined : province,
    status: status ?? undefined,
  });

  return NextResponse.json({
    cases: cases.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      acceptedAt: c.acceptedAt?.toISOString(),
      closedAt: c.closedAt?.toISOString(),
    })),
    total: cases.length,
  });
}
