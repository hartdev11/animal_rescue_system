import type { Metadata } from "next";
import { ClinicAnimalForm } from "@/components/clinic/clinic-animal-form";

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
      <h1 className="text-2xl font-bold">กรอกรายละเอียดสัตว์</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        รูปจากเคสถูกดึงมาแล้ว — กรอกข้อมูลให้ครบเพื่อเผยแพร่ในหน้า「หาบ้านให้สัตว์」
      </p>
      <div className="mt-8">
        <ClinicAnimalForm mode="edit" animalId={id} />
      </div>
    </div>
  );
}
