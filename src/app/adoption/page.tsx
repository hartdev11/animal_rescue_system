import Link from "next/link";
import { PublicLayout } from "@/components/layout";

export const metadata = {
  title: "รับเลี้ยงสัตว์ | Animal Rescue System",
};

export default function AdoptionPage() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold">🐾 สัตว์รอรับเลี้ยง</h1>
        <p className="mt-2 text-muted-foreground">
          สัตว์ที่ฟื้นตัวแล้วและพร้อมหาบ้านใหม่
        </p>
        <div className="mt-8 rounded-lg border border-dashed p-12 text-center text-muted-foreground">
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
