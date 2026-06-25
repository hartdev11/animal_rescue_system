"use client";

import { useState } from "react";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import type { SelectedRole } from "@/components/landing/role-selection";
import type { UserAuthMode } from "@/components/landing/user-auth-badge";
import { UserAuthBadge } from "@/components/landing/user-auth-badge";
import { ArrowLeftRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80">
      <div className="container mx-auto flex h-14 items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-4">
        <Link
          href="/"
          onClick={closeMobile}
          className="flex min-w-0 shrink items-center gap-2 font-bold text-emerald-700"
        >
          <span className="text-xl sm:text-2xl">🐾</span>
          <span className="truncate text-sm sm:text-base">{APP_NAME}</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-3 md:flex">
          {role === "user" && authMode && <UserAuthBadge mode={authMode} />}

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
                  className="text-sm text-blue-600 hover:underline"
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
              เปลี่ยนบทบาท
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          {onChangeRole && (
            <button
              type="button"
              onClick={onChangeRole}
              className="rounded-md border p-2 text-gray-600"
              aria-label="เปลี่ยนบทบาท"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-md border p-2 text-gray-700"
            aria-label={mobileOpen ? "ปิดเมนู" : "เปิดเมนู"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      <div
        className={cn(
          "border-t bg-white md:hidden",
          mobileOpen ? "block" : "hidden"
        )}
      >
        <div className="container mx-auto space-y-1 px-3 py-3">
          {role === "user" && authMode && (
            <div className="pb-2">
              <UserAuthBadge mode={authMode} />
            </div>
          )}

          {role === "user" && (
            <>
              <Link
                href="/report"
                onClick={closeMobile}
                className="flex rounded-lg bg-red-600 px-4 py-3 text-center text-sm font-medium text-white"
              >
                🚨 รายงานเคสฉุกเฉิน
              </Link>
              <Link
                href="/adoption"
                onClick={closeMobile}
                className="block rounded-lg px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
              >
                รับเลี้ยงสัตว์
              </Link>
              {onOpenAuthModal && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenAuthModal();
                    closeMobile();
                  }}
                  className="block w-full rounded-lg px-4 py-3 text-left text-sm text-blue-600 hover:bg-gray-50"
                >
                  เปลี่ยนวิธีเข้าใช้
                </button>
              )}
            </>
          )}

          {role === "clinic" && (
            <Link
              href="/clinic/login"
              onClick={closeMobile}
              className="block rounded-lg bg-emerald-600 px-4 py-3 text-center text-sm font-medium text-white"
            >
              เข้าสู่ระบบคลินิก
            </Link>
          )}

          {!role && (
            <Link
              href="/"
              onClick={closeMobile}
              className="block rounded-lg px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
            >
              หน้าแรก
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
