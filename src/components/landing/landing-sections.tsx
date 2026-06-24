import Link from "next/link";

export function HeroSection() {
  return (
    <section className="bg-linear-to-br from-emerald-50 to-teal-50 py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          ช่วยเหลือสัตว์จรจัดที่<span className="text-emerald-600">บาดเจ็บ</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          แพลตฟอร์มเชื่อมต่อประชาชนกับคลินิกสัตวแพทย์
          เพื่อช่วยเหลือสัตว์จรจัดในกรณีฉุกเฉินอย่างรวดเร็ว
        </p>
      </div>
    </section>
  );
}

export function ActionCards() {
  return (
    <section className="container mx-auto -mt-12 px-4 pb-16">
      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/report"
          className="group rounded-2xl border-2 border-red-200 bg-white p-8 shadow-lg transition hover:border-red-400 hover:shadow-xl"
        >
          <div className="text-5xl">🚨</div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 group-hover:text-red-600">
            รายงานสัตว์บาดเจ็บ
          </h2>
          <p className="mt-2 text-gray-600">
            รายงานสัตว์จรจัดที่บาดเจ็บและขอความช่วยเหลือ — ไม่ต้องสมัครสมาชิก
          </p>
        </Link>

        <Link
          href="/clinic/login"
          className="group rounded-2xl border-2 border-emerald-200 bg-white p-8 shadow-lg transition hover:border-emerald-400 hover:shadow-xl"
        >
          <div className="text-5xl">🏥</div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 group-hover:text-emerald-600">
            พอร์ทัลคลินิก
          </h2>
          <p className="mt-2 text-gray-600">
            เข้าสู่ระบบสำหรับคลินิกสัตวแพทย์เพื่อจัดการเคสช่วยเหลือ
          </p>
        </Link>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    { step: 1, title: "รายงาน", desc: "ถ่ายรูป ระบุตำแหน่ง GPS และอาการ" },
    { step: 2, title: "มอบหมาย", desc: "ระบบส่งเคสไปยังคลินิกในจังหวัด" },
    { step: 3, title: "ช่วยเหลือ", desc: "คลินิกรับเคสและออกไปช่วยเหลือ" },
    { step: 4, title: "ติดตาม", desc: "ติดตามความคืบหน้าผ่านเลขเคส" },
  ];

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-bold">วิธีการใช้งาน</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">
                {item.step}
              </div>
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StatisticsSection({
  stats,
}: {
  stats: { totalCases: number; animalsRescued: number; animalsRecovered: number; animalsAdopted: number };
}) {
  const items = [
    { label: "เคสทั้งหมด", value: stats.totalCases },
    { label: "ช่วยเหลือแล้ว", value: stats.animalsRescued },
    { label: "ฟื้นตัวแล้ว", value: stats.animalsRecovered },
    { label: "ได้บ้านแล้ว", value: stats.animalsAdopted },
  ];

  return (
    <section className="bg-emerald-700 py-16 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-bold">สถิติระบบ</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="rounded-xl bg-white/10 p-6 text-center backdrop-blur">
              <div className="text-4xl font-bold">{item.value.toLocaleString()}</div>
              <div className="mt-1 text-sm text-emerald-100">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold">พบสัตว์บาดเจ็บ?</h2>
        <p className="mt-2 text-gray-600">รายงานได้ทันที ไม่ต้องสมัครสมาชิก</p>
        <Link
          href="/report"
          className="mt-6 inline-block rounded-lg bg-red-600 px-8 py-3 font-semibold text-white hover:bg-red-700"
        >
          รายงานตอนนี้
        </Link>
      </div>
    </section>
  );
}
