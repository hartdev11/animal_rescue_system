import { NextResponse } from "next/server";
import { addVerifiedDonation, getCaseByNumber } from "@/lib/server/case-store";
import { uploadDonationSlip } from "@/lib/server/firebase-admin";
import { PROMPTPAY_ID } from "@/lib/constants";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function promptPayQrUrl(amount: number) {
  const id = PROMPTPAY_ID.replace(/\D/g, "");
  const baht = Math.max(1, Math.round(amount * 100) / 100);
  return `https://promptpay.io/${id}/${baht.toFixed(2)}.png`;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id: caseNumber } = await params;
  const rescueCase = await getCaseByNumber(caseNumber);
  if (!rescueCase) {
    return NextResponse.json({ error: { message: "ไม่พบเคสนี้" } }, { status: 404 });
  }

  return NextResponse.json({
    promptPayId: PROMPTPAY_ID,
    donationTotal: rescueCase.donationTotal ?? 0,
    donationGoal: rescueCase.donationGoal ?? 5000,
  });
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id: caseNumber } = await params;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: { message: "ข้อมูลไม่ถูกต้อง — ต้องอัปโหลดสลิป" } },
      { status: 400 }
    );
  }

  const amount = Number(formData.get("amount"));
  const donorNameRaw = formData.get("donorName");
  const donorName =
    typeof donorNameRaw === "string" ? donorNameRaw.trim() : undefined;
  const slip = formData.get("slip");

  if (!Number.isFinite(amount) || amount < 1) {
    return NextResponse.json(
      { error: { message: "จำนวนเงินไม่ถูกต้อง" } },
      { status: 400 }
    );
  }

  if (!(slip instanceof File) || slip.size === 0) {
    return NextResponse.json(
      { error: { message: "กรุณาอัปโหลดสลิปการโอนเงิน" } },
      { status: 400 }
    );
  }

  if (slip.size > 4 * 1024 * 1024) {
    return NextResponse.json(
      { error: { message: "ไฟล์สลิปต้องไม่เกิน 4 MB" } },
      { status: 400 }
    );
  }

  try {
    const rescueCase = await getCaseByNumber(caseNumber);
    if (!rescueCase) {
      return NextResponse.json(
        { error: { message: "ไม่พบเคสนี้" } },
        { status: 404 }
      );
    }

    const buffer = Buffer.from(await slip.arrayBuffer());
    const mimeType = slip.type || "image/jpeg";
    const slipUrl = await uploadDonationSlip(rescueCase.id, {
      buffer,
      mimeType,
    });

    // ยอดจะขึ้นเมื่อคลินิกกดยืนยันเท่านั้น
    const result = await addVerifiedDonation({
      caseNumber,
      amount,
      donorName,
      slipUrl,
      transRef: "",
      status: "PENDING",
      verifyMethod: "clinic",
    });

    return NextResponse.json({
      ...result,
      message:
        "ส่งสลิปแล้ว — รอคลินิกตรวจยืนยัน ยอดบริจาคจะขึ้นหลังคลินิกกดยืนยันเท่านั้น",
      qrUrl: promptPayQrUrl(amount),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "บันทึกบริจาคไม่สำเร็จ";
    const status = message.includes("ไม่พบ") ? 404 : 400;
    return NextResponse.json({ error: { message } }, { status });
  }
}
