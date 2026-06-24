import Link from "next/link";
import { PublicLayout } from "@/components/layout";

export const metadata = {
  title: "ตั้งค่า Firebase | Animal Rescue System",
};

export default function FirebaseSetupPage() {
  return (
    <PublicLayout>
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Link href="/" className="text-sm text-emerald-600 hover:underline">
          ← กลับหน้าแรก
        </Link>

        <h1 className="mt-6 text-3xl font-bold">ตั้งค่า Firebase + Gmail Login</h1>
        <p className="mt-2 text-muted-foreground">
          ทำตามขั้นตอนนี้เพื่อเปิดใช้เข้าสู่ระบบด้วย Gmail
        </p>

        <div className="prose prose-sm mt-8 max-w-none space-y-8 text-gray-800">
          <section className="rounded-xl border bg-white p-6">
            <h2 className="text-lg font-bold">1. สร้าง Firebase Project</h2>
            <p className="mt-2 text-sm text-gray-600">
              เปิด{" "}
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 underline"
              >
                Firebase Console
              </a>{" "}
              → Add project
            </p>
          </section>

          <section className="rounded-xl border bg-white p-6">
            <h2 className="text-lg font-bold">2. เพิ่ม Web App</h2>
            <p className="mt-2 text-sm text-gray-600">
              Project Overview → กดไอคอน Web → Register app → คัดลอก firebaseConfig
            </p>
          </section>

          <section className="rounded-xl border bg-white p-6">
            <h2 className="text-lg font-bold">3. เปิด Google Sign-In</h2>
            <p className="mt-2 text-sm text-gray-600">
              Authentication → Sign-in method → Google → Enable → Save
            </p>
          </section>

          <section className="rounded-xl border bg-white p-6">
            <h2 className="text-lg font-bold">4. สร้างไฟล์ .env.local</h2>
            <p className="mt-2 text-sm text-gray-600">
              ที่โฟลเดอร์โปรเจกต์ สร้างไฟล์ <code className="rounded bg-gray-100 px-1">.env.local</code>
            </p>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-900 p-4 text-xs text-gray-100">
{`NEXT_PUBLIC_FIREBASE_API_KEY=ใส่ค่าจาก Firebase
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc

NEXT_PUBLIC_APP_URL=http://localhost:3000`}
            </pre>
          </section>

          <section className="rounded-xl border bg-white p-6">
            <h2 className="text-lg font-bold">5. รีสตาร์ท Server</h2>
            <pre className="mt-3 rounded-lg bg-gray-900 p-4 text-xs text-gray-100">
              npm run dev
            </pre>
            <p className="mt-2 text-sm text-gray-600">
              เปิด http://localhost:3000 แล้วลอง Gmail login อีกครั้ง
            </p>
          </section>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
            <p className="font-medium text-emerald-900">
              ยังไม่พร้อมตั้ง Firebase?
            </p>
            <p className="mt-1 text-sm text-emerald-800">
              ใช้ <strong>โหมดไม่ระบุตัวตน</strong> ได้ทันที — รายงานเคสและติดตามด้วยเลขเคสได้ครบ
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
