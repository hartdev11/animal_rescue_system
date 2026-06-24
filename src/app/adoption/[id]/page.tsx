import type { Metadata } from "next";
import { PublicLayout } from "@/components/layout";
import { getAnimalById } from "@/services/adoption-service";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "รายละเอียดสัตว์ | Animal Rescue System",
};

interface AdoptionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdoptionDetailPage({ params }: AdoptionDetailPageProps) {
  const { id } = await params;
  const animal = await getAnimalById(id);

  if (!animal) {
    notFound();
  }

  return (
    <PublicLayout>
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold">{animal.name}</h1>
        <div className="mt-8 rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          รายละเอียดสัตว์และรูปภาพจะแสดงที่นี่
        </div>
      </div>
    </PublicLayout>
  );
}
