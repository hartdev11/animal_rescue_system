import type { Metadata } from "next";
import { getPlatformStatistics } from "@/services/adoption-service";
import { HomePageClient } from "@/components/landing/home-page-client";

export const metadata: Metadata = {
  title: "Animal Rescue System | ระบบช่วยเหลือสัตว์จรจัด",
  description:
    "แพลตฟอร์มรายงานสัตว์จรจัดที่บาดเจ็บและเชื่อมต่อกับคลินิกสัตวแพทย์",
};

export default async function HomePage() {
  const stats = await getPlatformStatistics();

  return <HomePageClient stats={stats} />;
}
