"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Radio } from "lucide-react";
import { ImageGallery } from "@/components/ui/image-gallery";
import { CaseTimeline } from "@/components/tracking/case-timeline";
import { CaseDonation } from "@/components/tracking/case-donation";
import { CaseLineContact } from "@/components/tracking/case-line-contact";
import { CaseStatusBadge } from "@/components/tracking/case-status-badge";
import { CASE_STATUS_STYLES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { CaseStatus, CaseTimelineEvent } from "@/types";

const POLL_INTERVAL_MS = 15_000;
const POLL_INTERVAL_CLOSED_MS = 60_000;

interface SerializedTimelineEvent {
  id: string;
  caseId: string;
  status: CaseStatus;
  title: string;
  description?: string;
  createdAt: string;
  createdBy?: string;
}

interface TrackingCase {
  status: CaseStatus;
  statusLabel: string;
  updatedAt: string;
  createdAt: string;
  description: string;
  province: string;
  donationGoal: number;
  donationTotal: number;
}

interface CaseTrackingLiveProps {
  caseNumber: string;
  initialCase: TrackingCase;
  initialTimeline: SerializedTimelineEvent[];
  conditionLabel: string | null;
  speciesLabel?: string | null;
  imageUrls: string[];
  clinicName?: string | null;
  clinicLineId?: string | null;
}

function toTimelineEvents(rows: SerializedTimelineEvent[]): CaseTimelineEvent[] {
  return rows.map((e) => ({
    ...e,
    createdAt: new Date(e.createdAt),
  }));
}

export function CaseTrackingLive({
  caseNumber,
  initialCase,
  initialTimeline,
  conditionLabel,
  speciesLabel,
  imageUrls,
  clinicName,
  clinicLineId,
}: CaseTrackingLiveProps) {
  const [caseData, setCaseData] = useState(initialCase);
  const [timeline, setTimeline] = useState(() => toTimelineEvents(initialTimeline));
  const [statusPulse, setStatusPulse] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const prevStatusRef = useRef(initialCase.status);
  const prevTimelineLenRef = useRef(initialTimeline.length);

  const fetchCaseUpdates = useCallback(async () => {
    const res = await fetch(`/api/cases/${encodeURIComponent(caseNumber)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json() as Promise<{
      status: CaseStatus;
      statusLabel: string;
      updatedAt: string;
      createdAt: string;
      description: string;
      province: string;
      donationGoal?: number;
      donationTotal?: number;
      timeline?: SerializedTimelineEvent[];
    }>;
  }, [caseNumber]);

  const applyUpdates = useCallback(
    (data: {
      status: CaseStatus;
      statusLabel: string;
      updatedAt: string;
      createdAt: string;
      description: string;
      province: string;
      donationGoal?: number;
      donationTotal?: number;
      timeline?: SerializedTimelineEvent[];
    }) => {
      const nextTimeline = toTimelineEvents(data.timeline ?? []);
      const nextCase: TrackingCase = {
        status: data.status,
        statusLabel: data.statusLabel,
        updatedAt: data.updatedAt,
        createdAt: data.createdAt,
        description: data.description,
        province: data.province,
        donationGoal: data.donationGoal ?? 5000,
        donationTotal: data.donationTotal ?? 0,
      };

      const statusChanged = prevStatusRef.current !== nextCase.status;
      const timelineGrew = nextTimeline.length > prevTimelineLenRef.current;

      if (statusChanged || timelineGrew) {
        setStatusPulse(true);
        window.setTimeout(() => setStatusPulse(false), 1200);
      }

      prevStatusRef.current = nextCase.status;
      prevTimelineLenRef.current = nextTimeline.length;
      setCaseData(nextCase);
      setTimeline(nextTimeline);
      setLastSyncedAt(new Date());
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    let intervalId = 0;

    const poll = async () => {
      // ไม่โหลดซ้ำเมื่อแท็บถูกซ่อน — ลด log / โหลดเซิร์ฟเวอร์
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const data = await fetchCaseUpdates();
        if (cancelled || !data) return;
        applyUpdates(data);
      } catch {
        // รอรอบถัดไป
      }
    };

    const startInterval = () => {
      window.clearInterval(intervalId);
      const ms =
        caseData.status === "CLOSED" ? POLL_INTERVAL_CLOSED_MS : POLL_INTERVAL_MS;
      intervalId = window.setInterval(() => {
        void poll();
      }, ms);
    };

    // มีข้อมูลจาก SSR แล้ว — ไม่ต้องดึงทันที รอช่วงถัดไป
    startInterval();

    const onVisibility = () => {
      if (document.hidden) {
        window.clearInterval(intervalId);
      } else {
        void poll();
        startInterval();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchCaseUpdates, applyUpdates, caseData.status]);

  const statusStyles = CASE_STATUS_STYLES[caseData.status];

  return (
    <div className="mt-6 space-y-5 sm:mt-8 sm:space-y-6">
      <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-end sm:gap-2">
        <div className="flex items-center gap-1.5">
          <Radio className="h-3.5 w-3.5 shrink-0 animate-pulse text-emerald-500" />
          <span>อัปเดตอัตโนมัติทุก 15 วินาที</span>
        </div>
        {lastSyncedAt && (
          <span className="text-muted-foreground/70 sm:before:mr-2 sm:before:content-['•']">
            ล่าสุด {formatDate(lastSyncedAt)}
          </span>
        )}
      </div>

      <div
        className={`rounded-xl border p-4 transition-all duration-500 sm:p-6 ${statusStyles.card} ${
          statusPulse ? "ring-2 ring-emerald-400 ring-offset-2" : ""
        }`}
      >
        <p className="text-sm text-muted-foreground">สถานะปัจจุบัน</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
          <p className={`text-xl font-semibold sm:text-2xl ${statusStyles.title}`}>
            {caseData.statusLabel}
          </p>
          <CaseStatusBadge status={caseData.status} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          รายงานเมื่อ {formatDate(new Date(caseData.createdAt))}
        </p>
      </div>

      <CaseTimeline events={timeline} highlightLatest />

      {clinicName && clinicLineId && (
        <CaseLineContact
          caseNumber={caseNumber}
          clinicName={clinicName}
          lineId={clinicLineId}
          speciesLabel={speciesLabel}
          reportedAt={caseData.createdAt}
        />
      )}

      {imageUrls.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            รูปภาพ ({imageUrls.length})
          </p>
          <ImageGallery images={imageUrls} alt="รูปสัตว์" />
        </div>
      )}

      <div className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2 sm:gap-4 sm:p-6">
        {speciesLabel && (
          <div>
            <p className="text-sm text-muted-foreground">ประเภทสัตว์</p>
            <p className="font-medium">{speciesLabel}</p>
          </div>
        )}
        <div>
          <p className="text-sm text-muted-foreground">อาการ</p>
          <p className="font-medium">{conditionLabel}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">จังหวัด</p>
          <p className="font-medium">{caseData.province}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">แจ้งเมื่อ</p>
          <p className="font-medium">{formatDate(new Date(caseData.createdAt))}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-sm text-muted-foreground">รายละเอียด</p>
          <p className="font-medium">{caseData.description}</p>
        </div>
      </div>

      {/* บริจาคอยู่ท้ายสุด — ไม่บังคับ ดูสถานะได้โดยไม่ต้องบริจาค */}
      <CaseDonation
        caseNumber={caseNumber}
        goal={caseData.donationGoal}
        total={caseData.donationTotal}
        closed={caseData.status === "CLOSED"}
        onDonated={(newTotal) =>
          setCaseData((prev) => ({ ...prev, donationTotal: newTotal }))
        }
      />
    </div>
  );
}
