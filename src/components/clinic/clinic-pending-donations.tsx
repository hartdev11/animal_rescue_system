"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getClinicSession } from "@/components/clinic/clinic-login-form";
import { formatDate } from "@/lib/utils";

type PendingDonation = {
  id: string;
  caseNumber: string;
  amount: number;
  donorName: string;
  slipUrl: string | null;
  createdAt: string;
};

export function ClinicPendingDonations() {
  const [rows, setRows] = useState<PendingDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const session = getClinicSession();
    const q = session?.province
      ? `?province=${encodeURIComponent(session.province)}`
      : "";
    const res = await fetch(`/api/clinic/donations${q}`, { cache: "no-store" });
    if (!res.ok) throw new Error("โหลดไม่สำเร็จ");
    const data = (await res.json()) as { donations: PendingDonation[] };
    setRows(data.donations);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        await load();
      } catch {
        if (!cancelled) setError("โหลดรายการรอตรวจสลิปไม่สำเร็จ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const approve = async (id: string) => {
    setActingId(id);
    setError(null);
    try {
      const res = await fetch("/api/clinic/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donationId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "อนุมัติไม่สำเร็จ");
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
      </div>
    );
  }

  if (rows.length === 0 && !error) {
    return (
      <p className="text-sm text-muted-foreground">
        ไม่มีสลิปรอตรวจ — เมื่อมีผู้บริจาคส่งสลิป จะขึ้นที่นี่ให้คลินิกกดยืนยัน
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {rows.map((d) => (
        <div
          key={d.id}
          className="flex flex-col gap-3 rounded-xl border bg-white p-3 sm:flex-row sm:items-center"
        >
          {d.slipUrl && (
            <a
              href={d.slipUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative h-24 w-20 shrink-0 overflow-hidden rounded border"
            >
              <Image
                src={d.slipUrl}
                alt="สลิป"
                fill
                className="object-cover"
                unoptimized
              />
            </a>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium">
              {d.amount.toLocaleString()} บาท — {d.donorName}
            </p>
            <p className="text-sm text-muted-foreground">
              เคส{" "}
              <Link
                href={`/clinic/cases/${encodeURIComponent(d.caseNumber)}`}
                className="font-mono text-emerald-700 hover:underline"
              >
                {d.caseNumber}
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              ส่งเมื่อ {formatDate(new Date(d.createdAt))}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            className="bg-amber-600 hover:bg-amber-700"
            disabled={actingId === d.id}
            onClick={() => void approve(d.id)}
          >
            {actingId === d.id ? "กำลังบันทึก..." : "ยืนยันยอดนี้"}
          </Button>
        </div>
      ))}
    </div>
  );
}
