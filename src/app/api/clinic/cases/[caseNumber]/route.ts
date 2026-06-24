import { NextResponse } from "next/server";
import {
  getCaseByNumber,
  getCaseTimeline,
  acceptCase,
  updateCaseStatus,
  addTreatmentReport,
  getNextStatus,
} from "@/lib/server/case-store";
import { CASE_STATUS_LABELS, DEMO_CLINIC_ID, getCaseStatusLabel } from "@/lib/constants";
import type { CaseStatus, TreatmentReportType } from "@/types";

interface RouteParams {
  params: Promise<{ caseNumber: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { caseNumber } = await params;
  const rescueCase = await getCaseByNumber(caseNumber);

  if (!rescueCase) {
    return NextResponse.json(
      { error: { message: "ไม่พบเคสนี้" } },
      { status: 404 }
    );
  }

  const timeline = await getCaseTimeline(caseNumber);
  const next = getNextStatus(rescueCase.status, rescueCase.wantsToAdopt);

  return NextResponse.json({
    case: {
      ...rescueCase,
      createdAt: rescueCase.createdAt.toISOString(),
      updatedAt: rescueCase.updatedAt.toISOString(),
      acceptedAt: rescueCase.acceptedAt?.toISOString(),
      closedAt: rescueCase.closedAt?.toISOString(),
      statusLabel: getCaseStatusLabel(rescueCase.status, rescueCase.wantsToAdopt),
    },
    timeline: timeline.map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
    })),
    nextStatus: next
      ? {
          value: next,
          label: getCaseStatusLabel(next, rescueCase.wantsToAdopt),
        }
      : null,
  });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { caseNumber } = await params;

  try {
    const body = await request.json();
    const clinicId = body.clinicId ?? DEMO_CLINIC_ID;

    if (body.action === "accept") {
      const updated = await acceptCase(caseNumber, clinicId);
      if (!updated) {
        return NextResponse.json(
          { error: { message: "ไม่สามารถรับเคสได้ (เคสไม่ใช่สถานะใหม่)" } },
          { status: 400 }
        );
      }
      return NextResponse.json({
        case: {
          ...updated,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
          statusLabel: getCaseStatusLabel(updated.status, updated.wantsToAdopt),
        },
      });
    }

    if (body.action === "updateStatus") {
      const updated = await updateCaseStatus(
        caseNumber,
        body.status as CaseStatus,
        body.note
      );

      if (!updated) {
        return NextResponse.json(
          { error: { message: "ไม่สามารถอัปเดตสถานะได้" } },
          { status: 400 }
        );
      }

      return NextResponse.json({
        case: {
          ...updated,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
          statusLabel: getCaseStatusLabel(updated.status, updated.wantsToAdopt),
        },
      });
    }

    if (body.action === "treatmentReport") {
      const updated = await addTreatmentReport(
        caseNumber,
        body.reportType as TreatmentReportType,
        body.note
      );

      if (!updated) {
        return NextResponse.json(
          { error: { message: "ไม่สามารถรายงานอาการได้ (ต้องอยู่ในช่วงกำลังรักษาหรือฟื้นตัว)" } },
          { status: 400 }
        );
      }

      return NextResponse.json({
        case: {
          ...updated,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
          closedAt: updated.closedAt?.toISOString(),
          statusLabel: getCaseStatusLabel(updated.status, updated.wantsToAdopt),
        },
      });
    }

    return NextResponse.json(
      { error: { message: "action ไม่ถูกต้อง" } },
      { status: 400 }
    );
  } catch (err) {
    console.error("[PATCH /api/clinic/cases]", err);
    return NextResponse.json(
      { error: { message: "เกิดข้อผิดพลาด" } },
      { status: 500 }
    );
  }
}
