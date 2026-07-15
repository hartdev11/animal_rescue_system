"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageGallery } from "@/components/ui/image-gallery";
import { getCaseImageUrls } from "@/lib/case-images";
import { Loader2, MapPin, Phone, User, Warehouse, Home, Heart, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CaseTimeline } from "@/components/tracking/case-timeline";
import { CaseStatusBadge } from "@/components/tracking/case-status-badge";
import { getClinicSession } from "@/components/clinic/clinic-login-form";
import { ANIMAL_CONDITIONS, PLACEMENT_STATUS_LABELS, TREATMENT_REPORT_OPTIONS } from "@/lib/constants";
import type {
  CaseStatus,
  CaseTimelineEvent,
  PlacementStatus,
  RescueCase,
  TreatmentReportType,
} from "@/types";

interface CaseDetail extends Omit<RescueCase, "createdAt" | "updatedAt"> {
  createdAt: string;
  updatedAt: string;
  statusLabel: string;
  placementLabel: string | null;
}

interface TimelineRow extends Omit<CaseTimelineEvent, "createdAt"> {
  createdAt: string;
}

interface ClinicCaseDetailProps {
  caseNumber: string;
}

export function ClinicCaseDetail({ caseNumber }: ClinicCaseDetailProps) {
  const router = useRouter();
  const session = getClinicSession();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelineRow[]>([]);
  const [nextStatus, setNextStatus] = useState<{
    value: CaseStatus;
    label: string;
  } | null>(null);
  const [recoveryOutcomes, setRecoveryOutcomes] = useState<
    ("awaitingShelter" | "reporterAdopt")[]
  >([]);
  const [placementActions, setPlacementActions] = useState<
    ("markInShelter" | "markHomed")[]
  >([]);
  const [outcomeNote, setOutcomeNote] = useState("");
  const [placementNote, setPlacementNote] = useState("");
  const [note, setNote] = useState("");
  const [reportType, setReportType] = useState<TreatmentReportType>("STABLE");
  const [reportNote, setReportNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCaseData = useCallback(async () => {
    const res = await fetch(`/api/clinic/cases/${encodeURIComponent(caseNumber)}`);
    if (!res.ok) return null;
    return res.json() as Promise<{
      case: CaseDetail;
      timeline: TimelineRow[];
      nextStatus: { value: CaseStatus; label: string } | null;
      recoveryOutcomes: ("awaitingShelter" | "reporterAdopt")[];
      placementActions: ("markInShelter" | "markHomed")[];
    }>;
  }, [caseNumber]);

  const applyCaseData = useCallback(
    (data: {
      case: CaseDetail;
      timeline: TimelineRow[];
      nextStatus: { value: CaseStatus; label: string } | null;
      recoveryOutcomes: ("awaitingShelter" | "reporterAdopt")[];
      placementActions: ("markInShelter" | "markHomed")[];
    }) => {
      setCaseData(data.case);
      setTimeline(data.timeline ?? []);
      setNextStatus(data.nextStatus ?? null);
      setRecoveryOutcomes(data.recoveryOutcomes ?? []);
      setPlacementActions(data.placementActions ?? []);
    },
    []
  );

  const loadCase = useCallback(async () => {
    setLoading(true);
    const data = await fetchCaseData();
    if (!data) {
      setCaseData(null);
    } else {
      applyCaseData(data);
    }
    setLoading(false);
  }, [fetchCaseData, applyCaseData]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const data = await fetchCaseData();
      if (cancelled) return;
      if (!data) {
        setCaseData(null);
      } else {
        applyCaseData(data);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchCaseData, applyCaseData]);

  const handleAccept = async () => {
    if (!session) return;
    setActionLoading(true);
    setError(null);
    const res = await fetch(`/api/clinic/cases/${encodeURIComponent(caseNumber)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept", clinicId: session.clinicId }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.message ?? "รับเคสไม่สำเร็จ");
    } else {
      await loadCase();
    }
    setActionLoading(false);
  };

  const handleUpdateStatus = async () => {
    if (!nextStatus) return;
    setActionLoading(true);
    setError(null);
    const res = await fetch(`/api/clinic/cases/${encodeURIComponent(caseNumber)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateStatus",
        status: nextStatus.value,
        note: note.trim() || undefined,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.message ?? "อัปเดตไม่สำเร็จ");
    } else {
      setNote("");
      await loadCase();
    }
    setActionLoading(false);
  };

  const handleTreatmentReport = async () => {
    setActionLoading(true);
    setError(null);
    const res = await fetch(`/api/clinic/cases/${encodeURIComponent(caseNumber)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "treatmentReport",
        reportType,
        note: reportNote.trim() || undefined,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.message ?? "รายงานอาการไม่สำเร็จ");
    } else {
      setReportNote("");
      await loadCase();
    }
    setActionLoading(false);
  };

  const handleRecoveryOutcome = async (
    outcome: "awaitingShelter" | "reporterAdopt"
  ) => {
    setActionLoading(true);
    setError(null);
    const res = await fetch(`/api/clinic/cases/${encodeURIComponent(caseNumber)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "recoveryOutcome",
        outcome,
        note: outcomeNote.trim() || undefined,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.message ?? "บันทึกผลลัพธ์ไม่สำเร็จ");
    } else {
      setOutcomeNote("");
      await loadCase();
    }
    setActionLoading(false);
  };

  const handlePlacementAction = async (
    placementAction: "markInShelter" | "markHomed"
  ) => {
    setActionLoading(true);
    setError(null);
    const res = await fetch(`/api/clinic/cases/${encodeURIComponent(caseNumber)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updatePlacement",
        placementAction,
        note: placementNote.trim() || undefined,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.message ?? "อัปเดตสถานะที่พักไม่สำเร็จ");
    } else {
      setPlacementNote("");
      await loadCase();
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
        ไม่พบเคสนี้
        <Button variant="link" onClick={() => router.push("/clinic/cases")}>
          กลับรายการเคส
        </Button>
      </div>
    );
  }

  const condition = ANIMAL_CONDITIONS.find((c) => c.value === caseData.condition);
  const imageUrls = getCaseImageUrls(caseData);
  const canReportTreatment =
    caseData.status === "UNDER_TREATMENT" || caseData.status === "RECOVERY";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold sm:text-2xl">รายละเอียดเคส</h1>
          <p className="break-all font-mono text-sm text-emerald-700 sm:text-base">
            {caseData.caseNumber}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CaseStatusBadge status={caseData.status} className="text-sm px-3 py-1" />
          {caseData.placementStatus && (
            <Badge className="bg-violet-100 text-violet-800">
              {caseData.placementLabel ??
                PLACEMENT_STATUS_LABELS[caseData.placementStatus as PlacementStatus].th}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <ImageGallery images={imageUrls} alt="รูปสัตว์" />
          <div className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-emerald-600" />
              <span className="font-medium">
                {caseData.reporterName || "—"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-emerald-600" />
              <span className="font-medium">{caseData.phoneNumber}</span>
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm">
              <p className="text-muted-foreground">แผนการดูแลหลังฟื้นตัว</p>
              <p className="font-medium text-blue-900">
                {caseData.wantsToAdopt
                  ? "ผู้แจ้งต้องการรับเลี้ยงต่อเอง"
                  : "ให้ศูนย์พักพิงสัตว์ดูแลต่อ"}
              </p>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span className="font-mono">
                {caseData.latitude.toFixed(6)}, {caseData.longitude.toFixed(6)}
                <br />
                จังหวัด{caseData.province}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">อาการ</p>
              <p className="font-medium">{condition?.labelTh}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">รายละเอียด</p>
              <p>{caseData.description}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <CaseTimeline
            events={timeline.map((e) => ({
              ...e,
              createdAt: new Date(e.createdAt),
            }))}
            title="Timeline"
            highlightLatest
          />

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-4">
            <h2 className="font-semibold text-emerald-900">ดำเนินการ</h2>

            {caseData.status === "NEW" && (
              <Button
                className="w-full"
                onClick={handleAccept}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "รับเคส"
                )}
              </Button>
            )}

            {caseData.status !== "NEW" && nextStatus && (
              <>
                <p className="text-sm text-emerald-800">
                  อัปเดตเป็น: <strong>{nextStatus.label}</strong>
                </p>
                <div className="space-y-2">
                  <Label htmlFor="note">บันทึก (ไม่บังคับ)</Label>
                  <Textarea
                    id="note"
                    rows={2}
                    placeholder="เช่น กำลังเดินทางไปช่วยเหลือ..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleUpdateStatus}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    `อัปเดตเป็น ${nextStatus.label}`
                  )}
                </Button>
              </>
            )}

            {recoveryOutcomes.length > 0 && (
              <div className="space-y-3 rounded-lg border border-emerald-300 bg-white p-3">
                <h3 className="text-sm font-semibold text-emerald-900">
                  ผลลัพธ์หลังฟื้นตัว — เลือกสถานะถัดไป
                </h3>
                <p className="text-xs text-muted-foreground">
                  กรณีสัตว์เสียชีวิต ให้เลือกใน「รายงานอาการ」ด้านล่าง
                </p>
                <Textarea
                  rows={2}
                  placeholder="บันทึกเพิ่มเติม (ไม่บังคับ)"
                  value={outcomeNote}
                  onChange={(e) => setOutcomeNote(e.target.value)}
                />
                {recoveryOutcomes.includes("awaitingShelter") && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start border-amber-300 bg-amber-50 hover:bg-amber-100"
                    onClick={() => handleRecoveryOutcome("awaitingShelter")}
                    disabled={actionLoading}
                  >
                    <Warehouse className="mr-2 h-4 w-4 text-amber-700" />
                    รอศูนย์พักพิง / ยังไม่ได้บ้าน
                  </Button>
                )}
                {recoveryOutcomes.includes("reporterAdopt") && (
                  <Button
                    type="button"
                    className="w-full justify-start bg-pink-600 hover:bg-pink-700"
                    onClick={() => handleRecoveryOutcome("reporterAdopt")}
                    disabled={actionLoading}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    ส่งมอบให้ผู้แจ้งรับเลี้ยงต่อ
                  </Button>
                )}
              </div>
            )}

            {placementActions.length > 0 && (
              <div className="space-y-3 rounded-lg border border-violet-200 bg-violet-50/80 p-3">
                <h3 className="text-sm font-semibold text-violet-900">
                  จัดการที่พักสัตว์
                </h3>
                <p className="text-xs text-violet-800">
                  หรือจัดการทั้งหมดได้ที่{" "}
                  <a href="/clinic/animals" className="font-medium underline">
                    หน้าหาบ้านให้สัตว์ (คลินิก)
                  </a>
                </p>
                <Textarea
                  rows={2}
                  placeholder="เช่น ส่งไปที่ศูนย์ xxx..."
                  value={placementNote}
                  onChange={(e) => setPlacementNote(e.target.value)}
                />
                {placementActions.includes("markInShelter") && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-violet-300 bg-white"
                    onClick={() => handlePlacementAction("markInShelter")}
                    disabled={actionLoading}
                  >
                    <Warehouse className="mr-2 h-4 w-4" />
                    บันทึก: ส่งเข้าศูนย์พักพิงแล้ว
                  </Button>
                )}
                {placementActions.includes("markHomed") && (
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => handlePlacementAction("markHomed")}
                    disabled={actionLoading}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    ได้เจ้าของแล้ว
                  </Button>
                )}
              </div>
            )}

            {canReportTreatment && (
              <div className="space-y-3 rounded-lg border border-violet-200 bg-violet-50/80 p-3">
                <h3 className="text-sm font-semibold text-violet-900">
                  รายงานอาการระหว่างรักษา
                </h3>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Skull className="h-3 w-3" />
                  หากสัตว์เสียชีวิต ให้เลือก「เสียชีวิต」 — ระบบจะปิดเคสอัตโนมัติ
                </p>
                <div className="space-y-2">
                  <Label htmlFor="reportType">สภาพอาการล่าสุด</Label>
                  <select
                    id="reportType"
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                    value={reportType}
                    onChange={(e) =>
                      setReportType(e.target.value as TreatmentReportType)
                    }
                  >
                    {TREATMENT_REPORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.labelTh}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportNote">รายละเอียดเพิ่มเติม (ไม่บังคับ)</Label>
                  <Textarea
                    id="reportNote"
                    rows={2}
                    placeholder="เช่น บาดแผลดีขึ้น กินอาหารได้ / ต้องผ่าตัดด่วน..."
                    value={reportNote}
                    onChange={(e) => setReportNote(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-violet-300 bg-white hover:bg-violet-100"
                  onClick={handleTreatmentReport}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "บันทึกรายงานอาการ"
                  )}
                </Button>
              </div>
            )}

            {caseData.status === "CLOSED" && (
              <p className="text-sm text-emerald-800">เคสนี้ปิดแล้ว</p>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
