import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layout";
import { AdoptionDetailView } from "@/components/adoption/adoption-detail-view";
import { getAnimalDetailWithShelter } from "@/services/adoption-service";
import { getSpeciesIcon, getSpeciesLabel } from "@/lib/constants";

export const metadata: Metadata = {
  title: "รายละเอียดสัตว์ | หาบ้านให้สัตว์",
};

interface AdoptionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdoptionDetailPage({ params }: AdoptionDetailPageProps) {
  const { id } = await params;
  const result = await getAnimalDetailWithShelter(id);

  if (!result || result.adoptionStatus !== "AVAILABLE") {
    notFound();
  }

  const { shelter, ...animal } = result;

  return (
    <PublicLayout>
      <div className="container mx-auto max-w-5xl px-3 py-8 sm:px-4 sm:py-12">
        <AdoptionDetailView
          animal={{
            ...animal,
            speciesLabel: getSpeciesLabel(animal.species),
            speciesIcon: getSpeciesIcon(animal.species),
          }}
          shelter={{
            ...shelter,
            mapsUrl: `https://www.google.com/maps/search/?api=1&query=${shelter.latitude},${shelter.longitude}`,
          }}
        />
      </div>
    </PublicLayout>
  );
}
