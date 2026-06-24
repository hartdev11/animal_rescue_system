import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "แก้ไขสัตว์ | Clinic Portal",
};

interface EditAnimalPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAnimalPage({ params }: EditAnimalPageProps) {
  const { id } = await params;

  return (
    <div>
      <h1 className="text-2xl font-bold">แก้ไขข้อมูลสัตว์</h1>
      <p className="font-mono text-muted-foreground">{id}</p>
      <div className="mt-8 max-w-2xl rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        ฟอร์มแก้ไขสัตว์จะ implement ในขั้นตอนถัดไป
      </div>
    </div>
  );
}
