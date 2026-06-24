"use client";

import { useEffect, useState } from "react";
import { Mail, UserX, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { UserAuthMode } from "./user-auth-badge";

export type { UserAuthMode };

interface UserAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (mode: UserAuthMode) => void;
}

export function UserAuthModal({ open, onOpenChange, onSelect }: UserAuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firebaseReady, setFirebaseReady] = useState<boolean | null>(null);

  useEffect(() => {
    if (!open) return;
    import("@/lib/firebase/config").then(({ isFirebaseConfigured }) => {
      setFirebaseReady(isFirebaseConfigured());
    });
  }, [open]);

  const handleAnonymous = () => {
    onSelect("anonymous");
    onOpenChange(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { isFirebaseConfigured, getFirebaseAuth } = await import(
        "@/lib/firebase/config"
      );
      const { signInWithPopup, GoogleAuthProvider } = await import("firebase/auth");

      if (!isFirebaseConfigured()) {
        setError(
          "ยังไม่ได้ตั้งค่า Firebase — สร้างไฟล์ .env.local ตาม docs/FIREBASE-SETUP.md แล้วรีสตาร์ท server"
        );
        setFirebaseReady(false);
        return;
      }

      const provider = new GoogleAuthProvider();
      await signInWithPopup(getFirebaseAuth(), provider);
      onSelect("google");
      onOpenChange(false);
    } catch (err) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code)
          : "";

      if (code === "auth/popup-closed-by-user") {
        setError("ยกเลิกการเข้าสู่ระบบ");
      } else if (code === "auth/unauthorized-domain") {
        setError(
          "โดเมนนี้ยังไม่ได้ลงทะเบียน — เพิ่ม localhost ใน Firebase → Authentication → Authorized domains"
        );
      } else {
        setError(
          "เข้าสู่ระบบ Gmail ไม่สำเร็จ — ตรวจสอบ Firebase และเปิด Google Sign-In ใน Console"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="relative" onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>เลือกวิธีเข้าใช้งาน</DialogTitle>
          <DialogDescription>
            เลือกวิธีที่สะดวกสำหรับคุณ — โหมดไม่ระบุตัวตนเหมาะสำหรับการแจ้งเคสฉุกเฉิน
          </DialogDescription>
        </DialogHeader>

        {firebaseReady === false && (
          <div className="mt-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Gmail ยังใช้ไม่ได้</p>
              <p className="mt-1 text-xs text-amber-800">
                ต้องตั้งค่า Firebase ก่อน — ดูขั้นตอนใน{" "}
                <Link
                  href="/docs/firebase-setup"
                  className="underline"
                  onClick={() => onOpenChange(false)}
                >
                  คู่มือตั้งค่า Firebase
                </Link>{" "}
                หรือใช้โหมดไม่ระบุตัวตนได้ทันที
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || firebaseReady === false}
            className="flex w-full items-center gap-4 rounded-xl border-2 border-gray-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <Mail className="h-6 w-6 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">เข้าสู่ระบบด้วย Gmail</p>
              <p className="text-sm text-gray-500">
                {firebaseReady === false
                  ? "ต้องตั้งค่า Firebase ก่อน (.env.local)"
                  : "บันทึกประวัติการแจ้งเคสและติดตามได้สะดวก"}
              </p>
            </div>
            {loading && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
          </button>

          <button
            type="button"
            onClick={handleAnonymous}
            disabled={loading}
            className="flex w-full items-center gap-4 rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-left transition hover:border-amber-400 hover:bg-amber-100 disabled:opacity-50"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <UserX className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">โหมดไม่ระบุตัวตน</p>
              <p className="text-sm text-gray-600">
                รายงานได้ทันที ไม่ต้อง Login — ใช้งานได้เลยโดยไม่ต้อง Firebase
              </p>
            </div>
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
        )}

        <p className="mt-4 text-center text-xs text-muted-foreground">
          สามารถเปลี่ยนวิธีเข้าใช้งานได้ภายหลังจากเมนูด้านบน
        </p>
      </DialogContent>
    </Dialog>
  );
}
