import { NextResponse } from "next/server";
import {
  approveDonation,
  listPendingDonations,
} from "@/lib/server/case-store";

function normalizeProvince(province: string) {
  return province.trim().normalize("NFC");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceParam = searchParams.get("province");
    const province = provinceParam ? normalizeProvince(provinceParam) : undefined;
    const pending = await listPendingDonations(province);

    return NextResponse.json({
      donations: pending.map((d) => ({
        ...d,
        createdAt: d.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[GET /api/clinic/donations]", err);
    return NextResponse.json(
      { error: { message: "โหลดรายการบริจาคไม่สำเร็จ" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { donationId?: string };
    if (!body.donationId) {
      return NextResponse.json(
        { error: { message: "ไม่พบรหัสรายการ" } },
        { status: 400 }
      );
    }
    const result = await approveDonation(body.donationId);
    return NextResponse.json({
      ...result,
      message: "ยืนยันยอดบริจาคแล้ว",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "อนุมัติบริจาคไม่สำเร็จ";
    return NextResponse.json({ error: { message } }, { status: 400 });
  }
}
