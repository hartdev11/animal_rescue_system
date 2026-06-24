import Link from "next/link";
import { PublicLayout } from "@/components/layout";
import { ReportCaseForm } from "@/components/report/report-case-form";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "รายงานสัตว์บาดเจ็บ | Animal Rescue System",
};

export default function ReportPage() {
  return (
    <PublicLayout>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าแรก
        </Link>

        <h1 className="text-3xl font-bold">🚨 รายงานสัตว์บาดเจ็บ</h1>
        <p className="mt-2 text-muted-foreground">
          กรอกข้อมูลเพื่อแจ้งเหตุฉุกเฉิน — ไม่ต้องสมัครสมาชิก
        </p>

        <div className="mt-8">
          <ReportCaseForm />
        </div>
      </div>
    </PublicLayout>
  );
}
