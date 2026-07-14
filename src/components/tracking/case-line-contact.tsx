"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildClinicLineAppUrl,
  buildClinicLineMessage,
  buildClinicLineWebUrl,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";

interface CaseLineContactProps {
  caseNumber: string;
  clinicName: string;
  lineId: string;
  speciesLabel?: string | null;
  reportedAt?: string | null;
}

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function openLineChat(appUrl: string, webUrl: string) {
  const mobile = isMobileDevice();

  if (!mobile) {
    window.location.href = webUrl;
    return;
  }

  let fellBack = false;
  const fallbackTimer = window.setTimeout(() => {
    fellBack = true;
    window.location.href = webUrl;
  }, 1200);

  const onVisibility = () => {
    if (document.hidden) {
      window.clearTimeout(fallbackTimer);
      document.removeEventListener("visibilitychange", onVisibility);
    }
  };
  document.addEventListener("visibilitychange", onVisibility);

  window.location.href = appUrl;

  window.setTimeout(() => {
    if (!fellBack && document.hidden) {
      window.clearTimeout(fallbackTimer);
      document.removeEventListener("visibilitychange", onVisibility);
    }
  }, 800);
}

export function CaseLineContact({
  caseNumber,
  clinicName,
  lineId,
  speciesLabel,
  reportedAt,
}: CaseLineContactProps) {
  const [copied, setCopied] = useState(false);
  const [opening, setOpening] = useState(false);
  const message = buildClinicLineMessage({
    caseNumber,
    speciesLabel,
    reportedAt,
  });
  const appUrl = buildClinicLineAppUrl(lineId);
  const webUrl = buildClinicLineWebUrl(lineId);
  const reportedLabel = reportedAt
    ? formatDate(new Date(reportedAt))
    : null;

  const copyMessage = async () => {
    try {
      // สำคัญ: คัดลอกข้อความล้วนๆ — ไม่มี text= และไม่ใช้ลิงก์ ?text=
      const clean = message.replace(/^text=/i, "").trim();
      await navigator.clipboard.writeText(clean);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
      return true;
    } catch {
      return false;
    }
  };

  const handleOpenAndSend = async () => {
    setOpening(true);
    await copyMessage();
    openLineChat(appUrl, webUrl);
    window.setTimeout(() => setOpening(false), 1500);
  };

  return (
    <div className="rounded-xl border border-[#06C755]/30 bg-[#06C755]/5 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#06C755] text-white">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900">ติดต่อคลินิกทาง LINE</p>
          <p className="mt-1 text-sm text-muted-foreground">
            ระบบเตรียมข้อความให้แล้ว — กดปุ่มด้านล่าง แล้วใน LINE กดวาง + ส่ง อย่างเดียว
          </p>
          <p className="mt-2 text-sm font-medium text-gray-800">{clinicName}</p>
          <p className="text-xs text-muted-foreground">LINE: {lineId}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2 rounded-lg border bg-white/90 px-3 py-3 text-sm">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <p>
            <span className="text-muted-foreground">เลขเคส </span>
            <span className="font-mono font-semibold text-emerald-800">{caseNumber}</span>
          </p>
          {speciesLabel && (
            <p>
              <span className="text-muted-foreground">สัตว์ </span>
              <span className="font-medium">{speciesLabel}</span>
            </p>
          )}
          {reportedLabel && (
            <p>
              <span className="text-muted-foreground">แจ้งเมื่อ </span>
              <span className="font-medium">{reportedLabel}</span>
            </p>
          )}
        </div>
        <div className="border-t pt-2">
          <p className="text-xs text-muted-foreground">ข้อความที่จะส่ง</p>
          <pre className="mt-1 whitespace-pre-wrap font-sans text-sm text-gray-800">
            {message}
          </pre>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          onClick={handleOpenAndSend}
          disabled={opening}
          className="bg-[#06C755] text-white hover:bg-[#05b34c] sm:flex-1"
        >
          <Send className="h-4 w-4" />
          {opening ? "กำลังเปิด LINE..." : "คัดลอกข้อความ + เปิด LINE"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => void copyMessage()}
          className="sm:flex-1"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-600" />
              คัดลอกแล้ว — ไปวางใน LINE
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              คัดลอกข้อความอย่างเดียว
            </>
          )}
        </Button>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        ในแอป LINE: กดค้างช่องพิมพ์ → วาง → กดส่ง (ข้อความมีเลขเคส ชนิดสัตว์ และเวลาแจ้งแล้ว)
      </p>
    </div>
  );
}
