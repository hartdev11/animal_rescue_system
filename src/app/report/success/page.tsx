import Link from "next/link";
import { PublicLayout } from "@/components/layout";

export const metadata = {
  title: "รายงานสำเร็จ | Animal Rescue System",
};

interface SuccessPageProps {
  searchParams: Promise<{ caseNumber?: string }>;
}

export default async function ReportSuccessPage({ searchParams }: SuccessPageProps) {
  const { caseNumber } = await searchParams;

  return (
    <PublicLayout>
      <div className="container mx-auto max-w-lg px-4 py-10 text-center sm:py-16">
        <div className="text-5xl sm:text-6xl">✅</div>
        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">รายงานสำเร็จ</h1>
        {caseNumber && (
          <>
            <p className="mt-4 text-sm text-muted-foreground sm:text-base">เลขเคสของคุณ</p>
            <p className="mt-2 break-all text-xl font-mono font-bold text-emerald-700 sm:text-2xl">
              {caseNumber}
            </p>
            <Link
              href={`/case/${caseNumber}`}
              className="mt-6 inline-block w-full rounded-lg bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-700 sm:w-auto"
            >
              ติดตามสถานะเคส
            </Link>
          </>
        )}
      </div>
    </PublicLayout>
  );
}
