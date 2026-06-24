"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Radio } from "lucide-react";
import { ImageGallery } from "@/components/ui/image-gallery";
import { CaseTimeline } from "@/components/tracking/case-timeline";
import { CaseStatusBadge } from "@/components/tracking/case-status-badge";
import { CASE_STATUS_STYLES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { CaseStatus, CaseTimelineEvent } from "@/types";

const POLL_INTERVAL_MS = 3000;
const POLL_INTERVAL_CLOSED_MS = 15000;

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
}

interface CaseTrackingLiveProps {
  caseNumber: string;
  initialCase: TrackingCase;
  initialTimeline: SerializedTimelineEvent[];
  conditionLabel: string | null;
  imageUrls: string[];
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
  imageUrls,
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

    const poll = async () => {
      try {
        const data = await fetchCaseUpdates();
        if (cancelled || !data) return;
        applyUpdates(data);
      } catch {
        // รอรอบถัดไป
      }
    };

    void poll();

    const interval =
      caseData.status === "CLOSED" ? POLL_INTERVAL_CLOSED_MS : POLL_INTERVAL_MS;
    const id = window.setInterval(() => {
      void poll();
    }, interval);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [fetchCaseUpdates, applyUpdates, caseData.status]);

  const statusStyles = CASE_STATUS_STYLES[caseData.status];

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
        <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-500" />
        <span>อัปเดตอัตโนมัติ — ไม่ต้องรีเฟรช</span>
        {lastSyncedAt && (
          <span className="text-muted-foreground/70">
            • ล่าสุด {formatDate(lastSyncedAt)}
          </span>
        )}
      </div>

      <div
        className={`rounded-xl border p-6 transition-all duration-500 ${statusStyles.card} ${
          statusPulse ? "ring-2 ring-emerald-400 ring-offset-2" : ""
        }`}
      >
        <p className="text-sm text-muted-foreground">สถานะปัจจุบัน</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className={`text-2xl font-semibold ${statusStyles.title}`}>
            {caseData.statusLabel}
          </p>
          <CaseStatusBadge status={caseData.status} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          รายงานเมื่อ {formatDate(new Date(caseData.createdAt))}
        </p>
      </div>

      <CaseTimeline events={timeline} highlightLatest />

      {imageUrls.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            รูปภาพ ({imageUrls.length})
          </p>
          <ImageGallery images={imageUrls} alt="รูปสัตว์" />
        </div>
      )}

      <div className="grid gap-4 rounded-xl border p-6 sm:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">อาการ</p>
          <p className="font-medium">{conditionLabel}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">จังหวัด</p>
          <p className="font-medium">{caseData.province}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-sm text-muted-foreground">รายละเอียด</p>
          <p className="font-medium">{caseData.description}</p>
        </div>
      </div>
    </div>
  );
}
