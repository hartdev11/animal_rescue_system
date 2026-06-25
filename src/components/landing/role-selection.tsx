"use client";

import { User, Building2 } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export type SelectedRole = "user" | "clinic";

interface RoleSelectionProps {
  onSelect: (role: SelectedRole) => void;
}

export function RoleSelection({ onSelect }: RoleSelectionProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-emerald-50 via-white to-teal-50 px-4 py-8">
      <div className="mb-8 text-center sm:mb-10">
        <div className="text-4xl sm:text-5xl">🐾</div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
          {APP_NAME}
        </h1>
        <p className="mt-3 text-base text-gray-600 sm:text-lg">
          เลือกบทบาทของคุณเพื่อเริ่มใช้งาน
        </p>
      </div>

      <div className="grid w-full max-w-2xl gap-4 sm:gap-6 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect("user")}
          className="group rounded-2xl border-2 border-blue-200 bg-white p-6 text-left shadow-lg transition hover:border-blue-400 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:p-8"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
            <User className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-gray-900 group-hover:text-blue-600">
            User
          </h2>
          <p className="mt-1 text-sm font-medium text-blue-600">
            ประชาชน / ผู้แจ้งเคส
          </p>
          <p className="mt-3 text-sm text-gray-600">
            รายงานสัตว์จรจัดที่บาดเจ็บ ติดตามเคส และดูสัตว์รอรับเลี้ยง
          </p>
        </button>

        <button
          type="button"
          onClick={() => onSelect("clinic")}
          className="group rounded-2xl border-2 border-emerald-200 bg-white p-6 text-left shadow-lg transition hover:border-emerald-400 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 sm:p-8"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
            <Building2 className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-gray-900 group-hover:text-emerald-600">
            Clinic
          </h2>
          <p className="mt-1 text-sm font-medium text-emerald-600">
            คลินิกสัตวแพทย์
          </p>
          <p className="mt-3 text-sm text-gray-600">
            รับเคสช่วยเหลือ อัปเดตสถานะการรักษา และจัดการสัตว์รอรับเลี้ยง
          </p>
        </button>
      </div>
    </div>
  );
}
