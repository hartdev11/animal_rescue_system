"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROMPTPAY_ID } from "@/lib/constants";

const AMOUNTS = [100, 500, 1000];

interface CaseDonationProps {
  caseNumber: string;
  goal: number;
  total: number;
  closed?: boolean;
  onDonated: (newTotal: number) => void;
}

export function CaseDonation({
  caseNumber,
  goal,
  total,
  closed,
  onDonated,
}: CaseDonationProps) {
  const [amount, setAmount] = useState(100);
  const [donorName, setDonorName] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (closed) return null;

  const percent = goal > 0 ? Math.min(100, Math.round((total / goal) * 100)) : 0;

  const submit = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(
        `/api/cases/${encodeURIComponent(caseNumber)}/donate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            donorName: donorName.trim() || undefined,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "บันทึกไม่สำเร็จ");
      onDonated(data.donationTotal);
      setOpen(false);
      setMsg("ขอบคุณสำหรับการบริจาค!");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-6">
      <h2 className="text-lg font-bold text-amber-900">💰 ช่วยบริจาคค่ารักษา</h2>
      <p className="mt-1 text-sm text-amber-800">
        ได้รับแล้ว{" "}
        <strong>{total.toLocaleString()}</strong> / {goal.toLocaleString()} บาท (
        {percent}%)
      </p>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-amber-200">
        <div
          className="h-full rounded-full bg-amber-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      {msg && <p className="mt-3 text-sm font-medium text-emerald-700">{msg}</p>}

      {!open ? (
        <Button
          type="button"
          className="mt-4 w-full bg-amber-600 hover:bg-amber-700"
          onClick={() => setOpen(true)}
        >
          บริจาค
        </Button>
      ) : (
        <div className="mt-4 space-y-3 rounded-lg border border-amber-300 bg-white p-4">
          <p className="text-sm font-medium">เลือกจำนวน (บาท)</p>
          <div className="flex flex-wrap gap-2">
            {AMOUNTS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setAmount(n)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                  amount === n
                    ? "border-amber-600 bg-amber-100 text-amber-900"
                    : "border-gray-200 bg-white"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <Input
            type="number"
            min={1}
            placeholder="จำนวนอื่น"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
          />

          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-medium">โอนผ่านพร้อมเพย์</p>
            <p className="mt-1 font-mono text-base">{PROMPTPAY_ID}</p>
            <p className="mt-2 text-xs text-amber-700">
              โอน {amount.toLocaleString()} บาท แล้วกดยืนยันด้านล่าง
            </p>
          </div>

          <Input
            placeholder="ชื่อ (ไม่บังคับ)"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              className="flex-1 bg-amber-600 hover:bg-amber-700"
              disabled={loading || amount < 1}
              onClick={submit}
            >
              {loading ? "กำลังบันทึก..." : "ยืนยันว่าโอนแล้ว"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
