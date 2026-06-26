import { ClinicAnimalForm } from "@/components/clinic/clinic-animal-form";

export const metadata = {
  title: "ลงทะเบียนรับเลี้ยง | Clinic Portal",
};

interface NewAnimalPageProps {
  searchParams: Promise<{ caseNumber?: string }>;
}

export default async function NewAnimalPage({ searchParams }: NewAnimalPageProps) {
  const { caseNumber } = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-bold">ลงทะเบียนสัตว์รอรับเลี้ยง</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        กรอกข้อมูลครบถ้วนเพื่อแสดงในหน้า「หาบ้านให้สัตว์」
      </p>
      <div className="mt-8">
        <ClinicAnimalForm mode="create" initialCaseNumber={caseNumber} />
      </div>
    </div>
  );
}
