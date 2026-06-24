"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import {
  getClinicSession,
  clearClinicSession,
  type ClinicSession,
} from "@/components/clinic/clinic-login-form";

const navItems = [
  { href: "/clinic/cases", label: "เคสทั้งหมด" },
];

export default function ClinicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<ClinicSession | null>(null);
  const [ready, setReady] = useState(false);

  const isLoginPage = pathname === "/clinic/login";

  useEffect(() => {
    const s = getClinicSession();
    setSession(s);
    setReady(true);

    if (!isLoginPage && !s) {
      router.replace("/clinic/login");
    }
  }, [isLoginPage, router, pathname]);

  const handleLogout = () => {
    clearClinicSession();
    router.push("/clinic/login");
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 border-r bg-gray-50 md:block">
        <div className="flex h-16 items-center border-b px-6 font-bold text-emerald-700">
          🏥 {APP_NAME}
        </div>
        <p className="border-b px-6 py-3 text-xs text-muted-foreground">
          {session.clinicName}
        </p>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-lg px-4 py-2 text-sm transition",
                pathname.startsWith(item.href)
                  ? "bg-emerald-100 font-medium text-emerald-800"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b px-6">
          <h2 className="font-semibold md:hidden">{session.clinicName}</h2>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-red-600 hover:underline"
          >
            ออกจากระบบ
          </button>
        </header>
        <main className="flex-1 bg-white p-6">{children}</main>
      </div>
    </div>
  );
}
