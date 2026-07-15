"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardList, LayoutDashboard, LogOut, PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import {
  clearClinicSession,
  getClinicSessionServerSnapshot,
  getClinicSessionSnapshot,
  subscribeClinicSession,
  type ClinicSession,
} from "@/components/clinic/clinic-login-form";

const navItems = [
  {
    href: "/clinic/dashboard",
    label: "แดชบอร์ด",
    short: "หน้าหลัก",
    exact: true,
    icon: LayoutDashboard,
  },
  {
    href: "/clinic/cases",
    label: "เคสทั้งหมด",
    short: "เคส",
    exact: false,
    icon: ClipboardList,
  },
  {
    href: "/clinic/animals",
    label: "หาบ้านให้สัตว์",
    short: "หาบ้าน",
    exact: true,
    icon: PawPrint,
  },
] as const;

function parseSession(snapshot: string): ClinicSession | null {
  if (!snapshot) return null;
  try {
    return JSON.parse(snapshot) as ClinicSession;
  } catch {
    return null;
  }
}

function isActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

export default function ClinicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/clinic/login";

  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const sessionSnapshot = useSyncExternalStore(
    subscribeClinicSession,
    getClinicSessionSnapshot,
    getClinicSessionServerSnapshot
  );
  const session = useMemo(
    () => parseSession(sessionSnapshot),
    [sessionSnapshot]
  );

  useEffect(() => {
    if (!isClient || isLoginPage) return;
    if (!session) {
      router.replace("/clinic/login");
    }
  }, [isClient, isLoginPage, session, router]);

  const handleLogout = () => {
    clearClinicSession();
    router.push("/clinic/login");
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex min-h-dvh">
      {/* Sidebar — เดสก์ท็อป */}
      <aside className="hidden w-64 shrink-0 border-r bg-gray-50 md:block">
        <div className="flex h-14 items-center border-b px-5 font-bold text-emerald-700 lg:h-16 lg:px-6">
          🏥 {APP_NAME}
        </div>
        <p className="border-b px-5 py-3 text-xs text-muted-foreground lg:px-6">
          {session.clinicName}
        </p>
        <nav className="space-y-1 p-3 lg:p-4">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition",
                  active
                    ? "bg-emerald-100 font-medium text-emerald-800"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b bg-white/95 px-3 backdrop-blur sm:px-4 md:h-16 md:px-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold sm:text-base">
              {session.clinicName}
            </p>
            <p className="truncate text-xs text-muted-foreground md:hidden">
              จังหวัด{session.province}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">ออกจากระบบ</span>
          </button>
        </header>

        {/* pb เผื่อ bottom nav บนมือถือ */}
        <main className="flex-1 bg-white px-3 py-4 pb-24 sm:px-4 sm:py-5 md:p-6 md:pb-6">
          {children}
        </main>
      </div>

      {/* Bottom nav — มือถือ */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="grid grid-cols-3">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-1 py-2.5 text-[11px]",
                  active ? "text-emerald-700" : "text-gray-500"
                )}
              >
                <Icon
                  className={cn("h-5 w-5", active && "text-emerald-600")}
                />
                <span className={cn(active && "font-semibold")}>
                  {item.short}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
