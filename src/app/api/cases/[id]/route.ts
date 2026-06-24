import { NextResponse } from "next/server";
import { getCaseByNumber, getCaseTimeline } from "@/lib/server/case-store";
import { getCaseStatusLabel } from "@/lib/constants";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const rescueCase = await getCaseByNumber(id);

  if (!rescueCase) {
    return NextResponse.json(
      { error: { message: "ไม่พบเคสนี้" } },
      { status: 404 }
    );
  }

  const timeline = await getCaseTimeline(id);

  return NextResponse.json({
    ...rescueCase,
    createdAt: rescueCase.createdAt.toISOString(),
    updatedAt: rescueCase.updatedAt.toISOString(),
    statusLabel: getCaseStatusLabel(rescueCase.status, rescueCase.wantsToAdopt),
    timeline: timeline.map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
    })),
  });
}
