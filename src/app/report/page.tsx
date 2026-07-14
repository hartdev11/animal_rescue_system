import Link from "next/link";
import { PublicLayout } from "@/components/layout";
import { ReportCaseForm } from "@/components/report/report-case-form";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "รายงานสัตว์บาดเจ็บ | Animal Rescue System",
};

const STEPS = [
  { n: 1, text: "ถ่ายรูปสัตว์และปักหมุดตำแหน่ง (GPS)" },
  { n: 2, text: "กรอกอาการ เบอร์โทร และจังหวัด" },
  { n: 3, text: "กดส่งรายงาน" },
  { n: 4, text: "เก็บเลขเคสไว้ติดตามความคืบหน้า" },
];

export default function ReportPage() {
  return (
    <PublicLayout>
      <div className="container mx-auto max-w-2xl px-3 py-6 sm:px-4 sm:py-8">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground sm:mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าแรก
        </Link>

        <h1 className="text-2xl font-bold sm:text-3xl">🚨 รายงานสัตว์บาดเจ็บ</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          ไม่ต้องสมัครสมาชิก — กรอกตามขั้นตอนด้านล่าง
        </p>

        <ol className="mt-6 space-y-2 rounded-xl border border-red-100 bg-red-50/50 p-4 sm:p-5">
          {STEPS.map((step) => (
            <li key={step.n} className="flex items-start gap-3 text-sm sm:text-base">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">
                {step.n}
              </span>
              <span className="pt-0.5 text-gray-800">{step.text}</span>
            </li>
          ))}
        </ol>

        <div className="mt-8">
          <ReportCaseForm />
        </div>
      </div>
    </PublicLayout>
  );
}
