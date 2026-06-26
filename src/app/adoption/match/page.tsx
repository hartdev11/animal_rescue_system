import { PublicLayout } from "@/components/layout";
import { AdoptionMatch } from "@/components/adoption/adoption-match";

export const metadata = {
  title: "หาสัตว์ที่เหมาะกับคุณ | Animal Rescue System",
  description:
    "ทำแบบทดสอบหรือพิมพ์ลักษณะที่ต้องการ ระบบจะแนะนำสัตว์เลี้ยงที่นิสัยใกล้เคียงกับคุณ",
};

export default function AdoptionMatchPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-linear-to-b from-emerald-50/40 via-white to-violet-50/30">
        <div className="container mx-auto px-3 py-8 sm:px-4 sm:py-12">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            🔮 หาสัตว์ที่เหมาะกับคุณ
          </h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            ไม่รู้จะเลี้ยงตัวไหน? ทำ Quiz หรือเลือกแท็ก — ระบบเทียบจากข้อมูลที่คลินิกกรอกเท่านั้น
          </p>
          <div className="mt-6 sm:mt-8">
            <AdoptionMatch />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
