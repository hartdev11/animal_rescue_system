import Link from "next/link";

export function ClinicLanding() {
  return (
    <>
      <section className="bg-linear-to-br from-emerald-50 to-teal-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            ยินดีต้อนรับ<span className="text-emerald-600"> คลินิก</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            จัดการเคสช่วยเหลือสัตว์จรจัดที่บาดเจ็บในพื้นที่รับผิดชอบของคุณ
          </p>
          <Link
            href="/clinic/login"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            🏥 เข้าสู่ระบบคลินิก
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <h2 className="text-center text-2xl font-bold">เครื่องมือสำหรับคลินิก</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: "📥", title: "รับเคสใหม่", desc: "ดูและรับเคสจากผู้แจ้งในจังหวัด" },
            { icon: "🚑", title: "จัดการ Workflow", desc: "อัปเดตสถานะตั้งแต่รับเคสจนปิดเคส" },
            { icon: "📋", title: "บันทึกการรักษา", desc: "อัปโหลดรูปและบันทึกความคืบหน้า" },
            { icon: "🐾", title: "จัดการรับเลี้ยง", desc: "ลงทะเบียนสัตว์ที่ฟื้นตัวแล้ว" },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border bg-white p-6 text-center shadow-sm"
            >
              <div className="text-4xl">{item.icon}</div>
              <h3 className="mt-3 font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-emerald-700 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold">ขั้นตอนการทำงาน</h2>
          <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-4 text-left sm:gap-0">
            {[
              "รับแจ้งเตือนเคสใหม่ในจังหวัด",
              "ตรวจสอบรายละเอียดและรับเคส",
              "ออกไปช่วยเหลือและอัปเดตสถานะ",
              "บันทึกการรักษาจนสัตว์ฟื้นตัว",
            ].map((step, i) => (
              <div
                key={step}
                className="flex items-center gap-4 rounded-lg bg-white/10 p-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-emerald-700">
                  {i + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
          <Link
            href="/clinic/login"
            className="mt-8 inline-block rounded-lg bg-white px-8 py-3 font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            เข้าสู่ระบบเพื่อเริ่มจัดการเคส
          </Link>
        </div>
      </section>
    </>
  );
}
