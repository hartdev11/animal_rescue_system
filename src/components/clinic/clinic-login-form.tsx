"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { DEMO_CLINICS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const CLINIC_SESSION_KEY = "ars-clinic-session";

export interface ClinicSession {
  clinicId: string;
  clinicName: string;
  province: string;
}

const sessionListeners = new Set<() => void>();

function emitClinicSessionChange() {
  sessionListeners.forEach((listener) => listener());
}

export function subscribeClinicSession(listener: () => void) {
  sessionListeners.add(listener);
  return () => {
    sessionListeners.delete(listener);
  };
}

export function getClinicSession(): ClinicSession | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(CLINIC_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ClinicSession;
  } catch {
    return null;
  }
}

/** สำหรับ useSyncExternalStore — คืนสตริงคงที่เมื่อค่าเดิม */
export function getClinicSessionSnapshot(): string {
  const session = getClinicSession();
  return session ? JSON.stringify(session) : "";
}

export function getClinicSessionServerSnapshot(): string {
  return "";
}

export function setClinicSession(session: ClinicSession) {
  sessionStorage.setItem(CLINIC_SESSION_KEY, JSON.stringify(session));
  emitClinicSessionChange();
}

export function clearClinicSession() {
  sessionStorage.removeItem(CLINIC_SESSION_KEY);
  emitClinicSessionChange();
}

export function ClinicLoginForm() {
  const router = useRouter();
  const [clinicId, setClinicId] = useState<string>(DEMO_CLINICS[0].id);

  const handleLogin = () => {
    const clinic = DEMO_CLINICS.find((c) => c.id === clinicId) ?? DEMO_CLINICS[0];
    setClinicSession({
      clinicId: clinic.id,
      clinicName: clinic.clinicName,
      province: clinic.province,
    });
    router.push("/clinic/dashboard");
  };

  return (
    <div className="w-full max-w-md rounded-2xl border bg-white p-5 shadow-lg sm:p-8">
      <div className="text-center">
        <div className="text-5xl">🏥</div>
        <h1 className="mt-4 text-xl font-bold sm:text-2xl">พอร์ทัลคลินิก</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          เข้าสู่ระบบเพื่อรับเคสและอัปเดตสถานะ
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="clinic">เลือกคลินิก (Demo)</Label>
          <select
            id="clinic"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={clinicId}
            onChange={(e) => setClinicId(e.target.value)}
          >
            {DEMO_CLINICS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.clinicName} — {c.province}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            จะเห็นเฉพาะเคสในจังหวัดที่รับผิดชอบ
          </p>
        </div>

        <Button className="w-full" onClick={handleLogin}>
          เข้าสู่ระบบ
        </Button>
      </div>

      <p className="mt-6 text-center text-sm">
        <Link href="/" className="text-emerald-600 hover:underline">
          กลับหน้าแรก
        </Link>
      </p>
    </div>
  );
}
