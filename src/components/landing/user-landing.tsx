"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PlatformStatistics } from "@/types";
import type { UserAuthMode } from "./user-auth-badge";
import { UserAuthBadge } from "./user-auth-badge";
import {
  HowItWorks,
  StatisticsSection,
} from "./landing-sections";

interface UserLandingProps {
  stats: PlatformStatistics;
  authMode: UserAuthMode | null;
  onOpenAuthModal: () => void;
}

export function UserLanding({ stats, authMode, onOpenAuthModal }: UserLandingProps) {
  const router = useRouter();

  const handleTrackCase = () => {
    const caseNumber = window.prompt(
      "กรุณากรอกเลขเคสเพื่อติดตาม (เช่น CASE-2026-000001)"
    );
    if (caseNumber?.trim()) {
      router.push(`/case/${encodeURIComponent(caseNumber.trim())}`);
    }
  };

  const featureCards = [
    {
      icon: "📸",
      title: "รายงานเคสฉุกเฉิน",
      desc: "ถ่ายรูป ระบุตำแหน่ง GPS และอาการของสัตว์",
      href: "/report",
      hoverClass: "hover:border-red-300 hover:bg-red-50 hover:shadow-md",
    },
    {
      icon: "📍",
      title: "ติดตามความคืบหน้า",
      desc: "ใช้เลขเคสติดตามสถานะการช่วยเหลือและการรักษา",
      onClick: handleTrackCase,
      hoverClass: "hover:border-blue-300 hover:bg-blue-50 hover:shadow-md",
    },
    {
      icon: "🏠",
      title: "หาบ้านให้สัตว์",
      desc: "ดูสัตว์ที่ฟื้นตัวแล้วและพร้อมรับเลี้ยง",
      href: "/adoption",
      hoverClass: "hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-md",
    },
  ] as const;

  return (
    <>
      <section className="bg-linear-to-br from-blue-50 to-emerald-50 py-16">
        <div className="container mx-auto px-4 text-center">
          {authMode && (
            <div className="mb-4 flex justify-center">
              <UserAuthBadge mode={authMode} />
            </div>
          )}
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            ยินดีต้อนรับ<span className="text-blue-600"> ผู้ใช้งาน</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            รายงานสัตว์จรจัดที่บาดเจ็บได้ทันที ระบบจะส่งเคสไปยังคลินิกในจังหวัดโดยอัตโนมัติ
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/report"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-red-700"
            >
              🚨 รายงานสัตว์บาดเจ็บ
            </Link>
            <Link
              href="/adoption"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-300 bg-white px-8 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              🐾 ดูสัตว์รอรับเลี้ยง
            </Link>
          </div>
          {!authMode && (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="mt-4 text-sm text-blue-600 hover:underline"
            >
              เลือกวิธีเข้าใช้งาน (Gmail / ไม่ระบุตัวตน)
            </button>
          )}
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <h2 className="text-center text-2xl font-bold">สิ่งที่คุณทำได้</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {featureCards.map((item) => {
            const cardClass =
              `block w-full rounded-xl border bg-white p-6 text-center shadow-sm transition cursor-pointer ${item.hoverClass}`;

            const content = (
              <>
                <div className="text-4xl">{item.icon}</div>
                <h3 className="mt-3 font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
              </>
            );

            if ("href" in item && item.href) {
              return (
                <Link key={item.title} href={item.href} className={cardClass}>
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.title}
                type="button"
                onClick={"onClick" in item ? item.onClick : undefined}
                className={cardClass}
              >
                {content}
              </button>
            );
          })}
        </div>
      </section>

      <HowItWorks />
      <StatisticsSection stats={stats} />

      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">พบสัตว์บาดเจ็บ?</h2>
          <p className="mt-2 text-gray-600">
            รายงานได้ทันที{authMode === "anonymous" ? " ไม่ต้องสมัครสมาชิก" : ""}
          </p>
          <Link
            href="/report"
            className="mt-6 inline-block rounded-lg bg-red-600 px-8 py-3 font-semibold text-white hover:bg-red-700"
          >
            รายงานตอนนี้
          </Link>
        </div>
      </section>
    </>
  );
}
