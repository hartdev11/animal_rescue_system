import { Mail, UserX } from "lucide-react";

export type UserAuthMode = "anonymous" | "google";

export function UserAuthBadge({ mode }: { mode: UserAuthMode }) {
  if (mode === "google") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
        <Mail className="h-3 w-3" />
        เข้าสู่ระบบด้วย Gmail
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
      <UserX className="h-3 w-3" />
      โหมดไม่ระบุตัวตน
    </span>
  );
}
