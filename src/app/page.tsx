import type { Metadata } from "next";
import { HomePageClient } from "@/components/landing/home-page-client";

export const metadata: Metadata = {
  title: "Animal Rescue System | ระบบช่วยเหลือสัตว์จรจัด",
  description:
    "แพลตฟอร์มรายงานสัตว์จรจัดที่บาดเจ็บและเชื่อมต่อกับคลินิกสัตวแพทย์",
};

export default function HomePage() {
  return <HomePageClient />;
}
