export const metadata = {
  title: "สัตว์รอรับเลี้ยง | Clinic Portal",
};

export default function ClinicAnimalsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">สัตว์รอรับเลี้ยง</h1>
          <p className="text-muted-foreground">จัดการสัตว์ที่ฟื้นตัวแล้ว</p>
        </div>
        <a
          href="/clinic/animals/new"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          + เพิ่มสัตว์
        </a>
      </div>
      <div className="mt-8 rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        รายการสัตว์สำหรับรับเลี้ยงจะแสดงที่นี่
      </div>
    </div>
  );
}
