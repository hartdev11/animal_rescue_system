"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { UserAuthMode } from "./user-auth-badge";
import { UserAuthBadge } from "./user-auth-badge";

interface UserLandingProps {
  authMode: UserAuthMode | null;
  onOpenAuthModal: () => void;
}

export function UserLanding({ authMode, onOpenAuthModal }: UserLandingProps) {
  const router = useRouter();

  const handleTrackCase = () => {
    const caseNumber = window.prompt(
      "กรอกเลขเคสเพื่อติดตาม (เช่น CASE-2026-000001)"
    );
    if (caseNumber?.trim()) {
      router.push(`/case/${encodeURIComponent(caseNumber.trim())}`);
    }
  };

  return (
    <section className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center bg-linear-to-b from-red-50/80 via-white to-emerald-50/50 px-4 py-8">
      {authMode && (
        <div className="mb-6">
          <UserAuthBadge mode={authMode} />
        </div>
      )}

      <p className="text-5xl sm:text-6xl">🐾</p>
      <h1 className="mt-4 text-center text-2xl font-bold text-gray-900 sm:text-3xl">
        พบสัตว์บาดเจ็บ?
      </h1>
      <p className="mt-2 max-w-sm text-center text-sm text-gray-600 sm:text-base">
        กดปุ่มด้านล่างเพื่อแจ้งเคส — ระบบส่งไปคลินิกในจังหวัดให้อัตโนมัติ
      </p>

      <Link
        href="/report"
        className="mt-8 flex w-full max-w-md items-center justify-center gap-3 rounded-2xl bg-red-600 px-6 py-6 text-xl font-bold text-white shadow-xl transition hover:bg-red-700 active:scale-[0.98] sm:py-8 sm:text-2xl"
      >
        <span className="text-3xl sm:text-4xl">🚨</span>
        รายงานสัตว์บาดเจ็บ
      </Link>

      <div className="mt-8 flex w-full max-w-md flex-col gap-2 sm:flex-row sm:gap-3">
        <Link
          href="/adoption"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50"
        >
          🐾 หาบ้านให้สัตว์
        </Link>
        <button
          type="button"
          onClick={handleTrackCase}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          📍 ติดตามเคส
        </button>
      </div>

      {!authMode && (
        <button
          type="button"
          onClick={onOpenAuthModal}
          className="mt-6 text-sm text-blue-600 hover:underline"
        >
          เลือกวิธีเข้าใช้งาน (Gmail / ไม่ระบุตัวตน)
        </button>
      )}
    </section>
  );
}
