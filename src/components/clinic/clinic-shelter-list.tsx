"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Home, Loader2, PawPrint, RefreshCw, Warehouse } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getClinicSession } from "@/components/clinic/clinic-login-form";
import { ANIMAL_CONDITIONS, PLACEMENT_STATUS_LABELS } from "@/lib/constants";
import { getCaseImageUrls } from "@/lib/case-images";
import { formatDate } from "@/lib/utils";
import type { PlacementStatus, RescueCase } from "@/types";

type CaseRow = Omit<RescueCase, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
  statusLabel: string;
  placementLabel: string | null;
};

type ShelterFilter = "ALL" | PlacementStatus;

function buildShelterUrl(sessionProvince: string, showAllProvinces: boolean) {
  const params = new URLSearchParams();
  if (showAllProvinces) {
    params.set("all", "true");
  } else {
    params.set("province", sessionProvince);
  }
  return `/api/clinic/shelter?${params.toString()}`;
}

export function ClinicShelterList() {
  const session = getClinicSession();
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [counts, setCounts] = useState({ awaiting: 0, inShelter: 0, total: 0 });
  const [loading, setLoading] = useState(Boolean(session));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ShelterFilter>("ALL");
  const [showAllProvinces, setShowAllProvinces] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [noteByCase, setNoteByCase] = useState<Record<string, string>>({});

  const fetchShelter = useCallback(async () => {
    if (!session) return null;
    const res = await fetch(buildShelterUrl(session.province, showAllProvinces));
    if (!res.ok) throw new Error("โหลดไม่สำเร็จ");
    return res.json() as Promise<{
      cases: CaseRow[];
      awaiting: number;
      inShelter: number;
      total: number;
    }>;
  }, [session, showAllProvinces]);

  const loadShelter = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchShelter();
      if (data) {
        setCases(data.cases);
        setCounts({
          awaiting: data.awaiting,
          inShelter: data.inShelter,
          total: data.total,
        });
      }
    } catch {
      setLoadError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [session, fetchShelter]);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;

    void (async () => {
      try {
        const data = await fetchShelter();
        if (!cancelled && data) {
          setCases(data.cases);
          setCounts({
            awaiting: data.awaiting,
            inShelter: data.inShelter,
            total: data.total,
          });
          setLoadError(null);
        }
      } catch {
        if (!cancelled) setLoadError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session, fetchShelter]);

  const filtered = useMemo(() => {
    if (filter === "ALL") return cases;
    return cases.filter((c) => c.placementStatus === filter);
  }, [cases, filter]);

  const handlePlacement = async (
    caseNumber: string,
    placementAction: "markInShelter" | "markHomed"
  ) => {
    setActionLoading(caseNumber);
    setLoadError(null);
    const res = await fetch(`/api/clinic/cases/${encodeURIComponent(caseNumber)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updatePlacement",
        placementAction,
        note: noteByCase[caseNumber]?.trim() || undefined,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setLoadError(data.error?.message ?? "ดำเนินการไม่สำเร็จ");
    } else {
      setNoteByCase((prev) => ({ ...prev, [caseNumber]: "" }));
      await loadShelter();
    }
    setActionLoading(null);
  };

  if (!session) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">รอศูนย์พักพิง</h1>
          <p className="text-muted-foreground">
            สัตว์ที่ฟื้นตัวแล้วแต่ยังไม่มีเจ้าของหรือศูนย์พักพิง
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadShelter} disabled={loading}>
          <RefreshCw className={`mr-1.5 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          รีเฟรช
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">รอศูนย์พักพิง</p>
          <p className="text-2xl font-bold text-amber-900">{counts.awaiting}</p>
        </div>
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
          <p className="text-sm text-violet-800">อยู่ในศูนย์แล้ว</p>
          <p className="text-2xl font-bold text-violet-900">{counts.inShelter}</p>
        </div>
        <div className="rounded-xl border bg-gray-50 p-4">
          <p className="text-sm text-muted-foreground">รวมที่ต้องติดตาม</p>
          <p className="text-2xl font-bold">{counts.total}</p>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={showAllProvinces}
          onChange={(e) => setShowAllProvinces(e.target.checked)}
          className="rounded"
        />
        แสดงทุกจังหวัด (Demo)
      </label>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["ALL", "ทั้งหมด"],
            ["AWAITING_SHELTER", PLACEMENT_STATUS_LABELS.AWAITING_SHELTER.th],
            ["IN_SHELTER", PLACEMENT_STATUS_LABELS.IN_SHELTER.th],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              filter === key
                ? "bg-emerald-600 text-white"
                : "border bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loadError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {loadError}
        </div>
      )}

      {loading && cases.length === 0 ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed py-14 text-center text-muted-foreground">
          <PawPrint className="mx-auto mb-2 h-10 w-10 text-gray-300" />
          <p>ไม่มีสัตว์รอศูนย์พักพิง</p>
          <p className="mt-1 text-sm">
            บันทึกผลลัพธ์「รอศูนย์พักพิง」จากหน้ารายละเอียดเคสเมื่อสัตว์ฟื้นตัวแล้ว
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => {
            const condition = ANIMAL_CONDITIONS.find((x) => x.value === c.condition);
            const cover = getCaseImageUrls(c)[0];
            const isAwaiting = c.placementStatus === "AWAITING_SHELTER";
            const busy = actionLoading === c.caseNumber;

            return (
              <div
                key={c.caseNumber}
                className="rounded-xl border bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap gap-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border">
                    {cover ? (
                      <Image src={cover} alt="" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-400">
                        ไม่มีรูป
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/clinic/cases/${c.caseNumber}`}
                        className="font-mono font-semibold text-emerald-700 hover:underline"
                      >
                        {c.caseNumber}
                      </Link>
                      <Badge
                        className={
                          isAwaiting
                            ? "bg-amber-100 text-amber-800"
                            : "bg-violet-100 text-violet-800"
                        }
                      >
                        {c.placementLabel}
                      </Badge>
                      <Badge variant="secondary">{c.statusLabel}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {condition?.labelTh} • {c.province}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      อัปเดต {formatDate(new Date(c.updatedAt))}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 border-t pt-4">
                  <Textarea
                    rows={2}
                    placeholder="บันทึกเพิ่มเติม (ไม่บังคับ) เช่น ชื่อศูนย์พักพิง..."
                    value={noteByCase[c.caseNumber] ?? ""}
                    onChange={(e) =>
                      setNoteByCase((prev) => ({
                        ...prev,
                        [c.caseNumber]: e.target.value,
                      }))
                    }
                  />
                  <div className="flex flex-wrap gap-2">
                    {isAwaiting && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => handlePlacement(c.caseNumber, "markInShelter")}
                      >
                        {busy ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Warehouse className="mr-1.5 h-4 w-4" />
                            ส่งเข้าศูนย์พักพิงแล้ว
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => handlePlacement(c.caseNumber, "markHomed")}
                    >
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Home className="mr-1.5 h-4 w-4" />
                          ได้เจ้าของแล้ว
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
