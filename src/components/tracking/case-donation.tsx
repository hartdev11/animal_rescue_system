"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Loader2, Upload } from "lucide-react";
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

function promptPayQrUrl(amount: number) {
  const id = PROMPTPAY_ID.replace(/\D/g, "");
  const baht = Math.max(1, Math.round(amount * 100) / 100);
  return `https://promptpay.io/${id}/${baht.toFixed(2)}.png`;
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
  const [error, setError] = useState<string | null>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);

  const qrUrl = useMemo(() => promptPayQrUrl(amount), [amount]);

  if (closed) return null;

  const percent = goal > 0 ? Math.min(100, Math.round((total / goal) * 100)) : 0;

  const onPickSlip = (file: File | null) => {
    setSlipFile(file);
    setError(null);
    if (slipPreview) URL.revokeObjectURL(slipPreview);
    setSlipPreview(file ? URL.createObjectURL(file) : null);
  };

  const submit = async () => {
    if (!slipFile) {
      setError("กรุณาอัปโหลดสลิปหลังโอนเงินแล้ว — คลินิกจะเป็นผู้ตรวจยืนยัน");
      return;
    }
    if (amount < 1) {
      setError("จำนวนเงินไม่ถูกต้อง");
      return;
    }

    setLoading(true);
    setMsg(null);
    setError(null);
    try {
      const form = new FormData();
      form.append("amount", String(amount));
      if (donorName.trim()) form.append("donorName", donorName.trim());
      form.append("slip", slipFile);

      const res = await fetch(
        `/api/cases/${encodeURIComponent(caseNumber)}/donate`,
        { method: "POST", body: form }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "ยืนยันไม่สำเร็จ");

      if (data.status === "VERIFIED") {
        onDonated(data.donationTotal);
        setMsg(data.message ?? "ขอบคุณที่บริจาค!");
      } else {
        setMsg(
          data.message ??
            "ส่งสลิปแล้ว รอคลินิกตรวจยืนยัน — ยอดจะขึ้นเมื่อคลินิกกดยืนยันเท่านั้น"
        );
      }
      setOpen(false);
      onPickSlip(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-6">
      <h2 className="text-lg font-bold text-amber-900">ช่วยบริจาคค่ารักษา</h2>
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

      <p className="mt-3 text-xs text-amber-800">
        โอนแล้วอัปโหลดสลิป — ยอดจะขึ้นเมื่อคลินิกกดยืนยันเท่านั้น (กดยืนยันเองไม่ได้)
      </p>

      {msg && <p className="mt-3 text-sm font-medium text-emerald-700">{msg}</p>}

      {!open ? (
        <Button
          type="button"
          className="mt-4 w-full bg-amber-600 hover:bg-amber-700"
          onClick={() => setOpen(true)}
        >
          บริจาคด้วยพร้อมเพย์
        </Button>
      ) : (
        <div className="mt-4 space-y-3 rounded-lg border border-amber-300 bg-white p-4">
          <p className="text-sm font-medium">1) เลือกจำนวน (บาท)</p>
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

          <div className="rounded-lg bg-amber-50 p-3 text-center text-sm text-amber-900">
            <p className="font-medium">2) สแกน QR พร้อมเพย์แล้วโอน</p>
            <p className="mt-1 font-mono text-base">{PROMPTPAY_ID}</p>
            <p className="text-xs text-amber-700">
              จำนวน {amount.toLocaleString()} บาท
            </p>
            {amount >= 1 && (
              <div className="relative mx-auto mt-3 h-44 w-44 overflow-hidden rounded-lg border bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrUrl}
                  alt="PromptPay QR"
                  className="h-full w-full object-contain p-2"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">3) อัปโหลดสลิปหลังโอน</p>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-amber-400 bg-amber-50/50 px-4 py-6 text-sm text-amber-900 hover:bg-amber-50">
              <Upload className="h-5 w-5" />
              <span>{slipFile ? slipFile.name : "เลือกรูปสลิปการโอน"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPickSlip(e.target.files?.[0] ?? null)}
              />
            </label>
            {slipPreview && (
              <div className="relative mx-auto h-40 w-28 overflow-hidden rounded border">
                <Image
                  src={slipPreview}
                  alt="สลิป"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
          </div>

          <Input
            placeholder="ชื่อผู้บริจาค (ไม่บังคับ)"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
          />

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setOpen(false);
                onPickSlip(null);
                setError(null);
              }}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              className="flex-1 bg-amber-600 hover:bg-amber-700"
              disabled={loading || amount < 1 || !slipFile}
              onClick={() => void submit()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังส่งสลิป...
                </>
              ) : (
                "ส่งสลิปให้คลินิกตรวจ"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
