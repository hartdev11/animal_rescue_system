"use client";

import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import type { SelectedRole } from "@/components/landing/role-selection";
import type { UserAuthMode } from "@/components/landing/user-auth-badge";
import { UserAuthBadge } from "@/components/landing/user-auth-badge";
import { ArrowLeftRight } from "lucide-react";

interface HeaderProps {
  role?: SelectedRole | null;
  authMode?: UserAuthMode | null;
  onChangeRole?: () => void;
  onOpenAuthModal?: () => void;
}

export function Header({
  role,
  authMode,
  onChangeRole,
  onOpenAuthModal,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-emerald-700">
          <span className="text-2xl">🐾</span>
          <span className="hidden sm:inline">{APP_NAME}</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          {role === "user" && authMode && (
            <div className="hidden md:block">
              <UserAuthBadge mode={authMode} />
            </div>
          )}

          {role === "user" && (
            <>
              <Link
                href="/adoption"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                รับเลี้ยงสัตว์
              </Link>
              <Link
                href="/report"
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
              >
                รายงานเคส
              </Link>
              {onOpenAuthModal && (
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="hidden text-sm text-blue-600 hover:underline lg:inline"
                >
                  เปลี่ยนวิธีเข้าใช้
                </button>
              )}
            </>
          )}

          {role === "clinic" && (
            <Link
              href="/clinic/login"
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700"
            >
              เข้าสู่ระบบ
            </Link>
          )}

          {onChangeRole && (
            <button
              type="button"
              onClick={onChangeRole}
              className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              title="เปลี่ยนบทบาท"
            >
              <ArrowLeftRight className="h-4 w-4" />
              <span className="hidden sm:inline">เปลี่ยนบทบาท</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
