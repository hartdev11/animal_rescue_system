import { PublicLayout } from "@/components/layout";
import { AdoptionList } from "@/components/adoption/adoption-list";
import Link from "next/link";

export const metadata = {
  title: "หาบ้านให้สัตว์ | Animal Rescue System",
  description: "ดูสัตว์ที่ฟื้นตัวแล้วในศูนย์พักพิงและติดต่อรับเลี้ยง",
};

export default function AdoptionPage() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-3 py-8 sm:px-4 sm:py-12">
        <h1 className="text-2xl font-bold sm:text-3xl">🐾 หาบ้านให้สัตว์</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          สัตว์ที่ฟื้นตัวแล้วและพร้อมหาบ้านใหม่ — เลือกศูนย์พักพิงและชนิดสัตว์ที่สนใจ
        </p>

        <Link
          href="/adoption/match"
          className="mt-4 flex items-center gap-3 rounded-xl border border-violet-200 bg-linear-to-r from-violet-50 to-indigo-50 p-4 transition hover:border-violet-300 hover:shadow-sm"
        >
          <span className="text-2xl">🔮</span>
          <div>
            <p className="font-semibold text-violet-900">ยังไม่รู้จะเลี้ยงตัวไหน?</p>
            <p className="text-sm text-violet-700">
              ทำแบบทดสอบหรือพิมพ์ลักษณะที่อยากได้ → ระบบแนะนำสัตว์ที่เหมาะกับคุณ
            </p>
          </div>
          <span className="ml-auto hidden text-sm font-medium text-violet-600 sm:inline">
            เริ่มเลย →
          </span>
        </Link>

        <div className="mt-6 sm:mt-8">
          <AdoptionList />
        </div>
      </div>
    </PublicLayout>
  );
}
