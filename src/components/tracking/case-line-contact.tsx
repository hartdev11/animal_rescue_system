"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildClinicLineAppUrl,
  buildClinicLineMessage,
  buildClinicLineWebUrl,
} from "@/lib/constants";

interface CaseLineContactProps {
  caseNumber: string;
  clinicName: string;
  lineId: string;
}

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

/**
 * พยายามเปิดแอป LINE ด้วยบัญชีที่ล็อกอินอยู่ในเครื่อง
 * ถ้าเปิดแอปไม่ได้ภายในเวลาสั้นๆ จะไปที่ line.me แทน
 */
function openLineChat(appUrl: string, webUrl: string) {
  const mobile = isMobileDevice();

  if (!mobile) {
    // เดสก์ท็อป: universal link มักเปิด LINE Desktop ถ้ามี
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
      // แอป LINE น่าจะเปิดแล้ว — ยกเลิก fallback
      window.clearTimeout(fallbackTimer);
      document.removeEventListener("visibilitychange", onVisibility);
    }
  };
  document.addEventListener("visibilitychange", onVisibility);

  // ลองเปิดแอป LINE โดยตรง
  window.location.href = appUrl;

  // กันกรณีบางเบราว์เซอร์ไม่ยิง visibilitychange แต่แอปเปิดแล้ว
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
}: CaseLineContactProps) {
  const [copied, setCopied] = useState(false);
  const [opening, setOpening] = useState(false);
  const message = buildClinicLineMessage(caseNumber);
  const appUrl = buildClinicLineAppUrl(lineId, caseNumber);
  const webUrl = buildClinicLineWebUrl(lineId, caseNumber);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleOpenLine = () => {
    setOpening(true);
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
            กดแล้วจะเปิดแอป LINE ของคุณ (บัญชีที่ล็อกอินอยู่) เพื่อแชทกับคลินิก
            — ระบบใส่เลขเคสให้แล้ว
          </p>
          <p className="mt-2 text-sm font-medium text-gray-800">{clinicName}</p>
          <p className="text-xs text-muted-foreground">LINE: {lineId}</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border bg-white/80 px-3 py-2.5">
        <p className="text-xs text-muted-foreground">ข้อความที่จะส่ง</p>
        <p className="mt-0.5 text-sm font-medium text-gray-800">{message}</p>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          onClick={handleOpenLine}
          disabled={opening}
          className="bg-[#06C755] text-white hover:bg-[#05b34c] sm:flex-1"
        >
          <MessageCircle className="h-4 w-4" />
          {opening ? "กำลังเปิด LINE..." : "เปิดแอป LINE"}
        </Button>
        <Button type="button" variant="outline" onClick={handleCopy} className="sm:flex-1">
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-600" />
              คัดลอกแล้ว
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              คัดลอกข้อความ
            </>
          )}
        </Button>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        ถ้ามีแอป LINE ในเครื่อง จะเด้งเข้าแอปอัตโนมัติด้วยบัญชีของคุณ
        ถ้าไม่มีจะเปิดหน้า LINE บนเบราว์เซอร์แทน — ถ้าข้อความไม่ขึ้นอัตโนมัติ
        กด「คัดลอกข้อความ」แล้ววางในแชทได้
      </p>
    </div>
  );
}
