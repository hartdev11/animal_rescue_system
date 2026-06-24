"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getClinicSession,
  type ClinicSession,
} from "@/components/clinic/clinic-login-form";
import { ANIMAL_CONDITIONS, CASE_STATUS_LABELS } from "@/lib/constants";
import { getCaseImageUrls } from "@/lib/case-images";
import { formatDate } from "@/lib/utils";
import type { CaseStatus, RescueCase } from "@/types";

type CaseRow = Omit<RescueCase, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

function buildCasesUrl(
  session: ClinicSession,
  filter: CaseStatus | "ALL",
  showAllProvinces: boolean
) {
  const params = new URLSearchParams();
  if (!showAllProvinces) {
    params.set("province", session.province);
  } else {
    params.set("all", "true");
  }
  if (filter !== "ALL") params.set("status", filter);
  return `/api/clinic/cases?${params.toString()}`;
}

export function ClinicCasesList() {
  const session = getClinicSession();
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(Boolean(session));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CaseStatus | "ALL">("ALL");
  const [showAllProvinces, setShowAllProvinces] = useState(false);

  const fetchCases = useCallback(async () => {
    if (!session) return [];
    const res = await fetch(buildCasesUrl(session, filter, showAllProvinces));
    if (!res.ok) throw new Error("โหลดไม่สำเร็จ");
    const data = await res.json();
    return (data.cases ?? []) as CaseRow[];
  }, [session, filter, showAllProvinces]);

  const loadCases = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setLoadError(null);
    try {
      setCases(await fetchCases());
    } catch {
      setLoadError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [session, fetchCases]);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    void (async () => {
      try {
        const rows = await fetchCases();
        if (!cancelled) {
          setCases(rows);
          setLoadError(null);
        }
      } catch {
        if (!cancelled) {
          setLoadError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session, fetchCases]);

  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      void (async () => {
        try {
          const rows = await fetchCases();
          setCases(rows);
          setLoadError(null);
        } catch {
          setLoadError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
        }
      })();
    }, 5000);

    return () => clearInterval(interval);
  }, [session, fetchCases]);

  if (!session) return null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">เคสทั้งหมด</h1>
          <p className="text-muted-foreground">
            {session.clinicName}
            {showAllProvinces
              ? " — แสดงทุกจังหวัด"
              : ` — จังหวัด${session.province}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadCases} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            รีเฟรช
          </Button>
          <select
            className="rounded-md border px-3 py-2 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value as CaseStatus | "ALL")}
          >
            <option value="ALL">ทุกสถานะ</option>
            {Object.entries(CASE_STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label.th}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={showAllProvinces}
          onChange={(e) => setShowAllProvinces(e.target.checked)}
          className="rounded"
        />
        แสดงเคสทุกจังหวัด (Demo)
      </label>

      {loadError && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {loadError}
        </div>
      )}

      {loading && cases.length === 0 ? (
        <div className="mt-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : cases.length === 0 ? (
        <div className="mt-8 space-y-3 rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          <p>ยังไม่มีเคส{showAllProvinces ? "" : `ในจังหวัด${session.province}`}</p>
          <p className="text-sm">
            ตรวจสอบว่าผู้แจ้งเลือกจังหวัด <strong>{session.province}</strong> ในฟอร์มรายงาน
            <br />
            หรือติ๊ก「แสดงเคสทุกจังหวัด」ด้านบน
          </p>
          <p className="text-xs">ระบบรีเฟรชอัตโนมัติทุก 5 วินาที</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {cases.map((c) => {
            const condition = ANIMAL_CONDITIONS.find((x) => x.value === c.condition);
            const thumbnails = getCaseImageUrls(c);
            const cover = thumbnails[0];
            return (
              <Link
                key={c.caseNumber}
                href={`/clinic/cases/${c.caseNumber}`}
                className="flex gap-4 rounded-xl border bg-white p-4 transition hover:border-emerald-300 hover:shadow-md"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border">
                  {cover ? (
                    <Image
                      src={cover}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-400">
                      ไม่มีรูป
                    </div>
                  )}
                  {thumbnails.length > 1 && (
                    <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      +{thumbnails.length - 1}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-semibold text-emerald-700">
                      {c.caseNumber}
                    </span>
                    <Badge variant="secondary">
                      {CASE_STATUS_LABELS[c.status].th}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {condition?.labelTh} • {c.province}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(new Date(c.createdAt))}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
