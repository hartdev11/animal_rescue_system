import Link from "next/link";
import { PublicLayout } from "@/components/layout";

export const metadata = {
  title: "รับเลี้ยงสัตว์ | Animal Rescue System",
};

export default function AdoptionPage() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-3 py-8 sm:px-4 sm:py-12">
        <h1 className="text-2xl font-bold sm:text-3xl">🐾 สัตว์รอรับเลี้ยง</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          สัตว์ที่ฟื้นตัวแล้วและพร้อมหาบ้านใหม่
        </p>
        <div className="mt-6 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground sm:mt-8 sm:p-12 sm:text-base">
          รายการสัตว์รอรับเลี้ยงจะแสดงที่นี่
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/" className="text-emerald-600 hover:underline">
            กลับหน้าแรก
          </Link>
        </p>
      </div>
    </PublicLayout>
  );
}
