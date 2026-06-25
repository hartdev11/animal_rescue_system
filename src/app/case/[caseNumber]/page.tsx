import Link from "next/link";
import { getCaseImageUrls } from "@/lib/case-images";
import { PublicLayout } from "@/components/layout";
import { CaseTrackingLive } from "@/components/tracking/case-tracking-live";
import { getCaseByNumber, getCaseTimeline } from "@/lib/server/case-store";
import { CASE_STATUS_LABELS, ANIMAL_CONDITIONS, getCaseStatusLabel } from "@/lib/constants";

export const metadata = {
  title: "ติดตามเคส | Animal Rescue System",
};

interface CaseTrackingPageProps {
  params: Promise<{ caseNumber: string }>;
}

export default async function CaseTrackingPage({ params }: CaseTrackingPageProps) {
  const { caseNumber } = await params;
  const rescueCase = await getCaseByNumber(caseNumber);
  const timeline = rescueCase ? await getCaseTimeline(caseNumber) : [];

  const conditionLabel = rescueCase
    ? ANIMAL_CONDITIONS.find((c) => c.value === rescueCase.condition)?.labelTh ?? null
    : null;
  const imageUrls = rescueCase ? getCaseImageUrls(rescueCase) : [];

  return (
    <PublicLayout>
      <div className="container mx-auto max-w-3xl px-3 py-6 sm:px-4 sm:py-12">
        <h1 className="text-2xl font-bold sm:text-3xl">ติดตามเคส</h1>
        <p className="mt-1 break-all font-mono text-sm text-emerald-700 sm:text-base">
          {caseNumber}
        </p>

        {rescueCase ? (
          <CaseTrackingLive
            caseNumber={caseNumber}
            initialCase={{
              status: rescueCase.status,
              statusLabel: getCaseStatusLabel(rescueCase.status, rescueCase.wantsToAdopt),
              updatedAt: rescueCase.updatedAt.toISOString(),
              createdAt: rescueCase.createdAt.toISOString(),
              description: rescueCase.description,
              province: rescueCase.province,
            }}
            initialTimeline={timeline.map((e) => ({
              ...e,
              createdAt: e.createdAt.toISOString(),
            }))}
            conditionLabel={conditionLabel}
            imageUrls={imageUrls}
          />
        ) : (
          <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
            ไม่พบเคสนี้ในระบบ — ตรวจสอบเลขเคสอีกครั้ง
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/report" className="text-emerald-600 hover:underline">
            รายงานเคสใหม่
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
