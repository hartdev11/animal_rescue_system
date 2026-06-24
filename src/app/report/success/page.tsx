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
      <div className="container mx-auto max-w-lg px-4 py-16 text-center">
        <div className="text-6xl">✅</div>
        <h1 className="mt-4 text-3xl font-bold">รายงานสำเร็จ</h1>
        {caseNumber && (
          <>
            <p className="mt-4 text-muted-foreground">เลขเคสของคุณ</p>
            <p className="mt-2 text-2xl font-mono font-bold text-emerald-700">
              {caseNumber}
            </p>
            <Link
              href={`/case/${caseNumber}`}
              className="mt-6 inline-block rounded-lg bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-700"
            >
              ติดตามสถานะเคส
            </Link>
          </>
        )}
      </div>
    </PublicLayout>
  );
}
