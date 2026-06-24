import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Animal Rescue System | ระบบช่วยเหลือสัตว์จรจัด",
  description:
    "แพลตฟอร์มรายงานสัตว์จรจัดที่บาดเจ็บและเชื่อมต่อกับคลินิกสัตวแพทย์",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
