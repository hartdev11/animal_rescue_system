import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="mt-4 text-xl">ไม่พบหน้าที่ต้องการ</p>
      <Link href="/" className="mt-6 text-emerald-600 hover:underline">
        กลับหน้าแรก
      </Link>
    </div>
  );
}
