import { NextResponse } from "next/server";
import { addDonation } from "@/lib/server/case-store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id: caseNumber } = await params;

  let body: { amount?: number; donorName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { message: "ข้อมูลไม่ถูกต้อง" } },
      { status: 400 }
    );
  }

  const amount = Number(body.amount);
  const donorName = typeof body.donorName === "string" ? body.donorName : undefined;

  try {
    const result = await addDonation(caseNumber, amount, donorName);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "บันทึกบริจาคไม่สำเร็จ";
    const status = message.includes("ไม่พบ") ? 404 : 400;
    return NextResponse.json({ error: { message } }, { status });
  }
}
