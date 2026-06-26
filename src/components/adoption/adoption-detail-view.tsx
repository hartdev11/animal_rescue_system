"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Syringe,
  Scissors,
} from "lucide-react";
import { ImageGallery } from "@/components/ui/image-gallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getEnergyLevelLabel,
  getTemperamentTraitLabel,
} from "@/lib/constants";
import type { Animal, Shelter } from "@/types";

const GENDER_LABELS: Record<string, string> = {
  MALE: "ผู้",
  FEMALE: "เมีย",
  UNKNOWN: "ไม่ทราบ",
};

interface AdoptionDetailViewProps {
  animal: Animal & { speciesLabel: string; speciesIcon: string };
  shelter: Shelter & { mapsUrl: string };
}

export function AdoptionDetailView({ animal, shelter }: AdoptionDetailViewProps) {
  const images = animal.imageUrls.length > 0 ? animal.imageUrls : [];

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/adoption"
          className="text-sm text-emerald-600 hover:underline"
        >
          ← กลับรายการสัตว์
        </Link>
        <div className="mt-4 flex flex-wrap items-start gap-3">
          <h1 className="text-2xl font-bold sm:text-3xl">
            {animal.speciesIcon} {animal.name}
          </h1>
          <Badge className="bg-emerald-100 text-emerald-800">
            {animal.speciesLabel}
          </Badge>
          {animal.breed && <Badge variant="secondary">{animal.breed}</Badge>}
          {animal.hasDisability && (
            <Badge className="bg-amber-100 text-amber-900">มีความพิการ</Badge>
          )}
        </div>
        <p className="mt-1 text-muted-foreground">
          {GENDER_LABELS[animal.gender] ?? animal.gender} • อายุประมาณ{" "}
          {animal.estimatedAge}
          {animal.weight ? ` • น้ำหนัก ${animal.weight} กก.` : ""}
        </p>
      </div>

      <ImageGallery images={images} alt={animal.name} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">เกี่ยวกับ {animal.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed text-gray-700">
              <p>{animal.description}</p>

              {animal.hasDisability && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
                  <p className="font-medium text-amber-900">ความพิการ / การดูแลพิเศษ</p>
                  <p className="mt-1 text-amber-800">
                    {animal.disabilityNotes?.trim() ||
                      "คลินิกระบุว่ามีความพิการ — ติดต่อศูนย์เพื่อรายละเอียดเพิ่มเติม"}
                  </p>
                </div>
              )}

              {animal.temperamentTraits.length > 0 && (
                <div>
                  <p className="mb-2 font-medium text-gray-900">นิสัย (ข้อมูลจากคลินิก)</p>
                  <div className="flex flex-wrap gap-2">
                    {animal.temperamentTraits.map((trait) => (
                      <Badge key={trait} variant="outline" className="border-violet-300 text-violet-800">
                        {getTemperamentTraitLabel(trait)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {animal.energyLevel && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">ระดับพลังงาน:</span>{" "}
                  {getEnergyLevelLabel(animal.energyLevel)}
                </p>
              )}

              <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                {animal.suitableForCondo && <Badge variant="secondary">เหมาะกับคอนโด</Badge>}
                {animal.suitableForKids && <Badge variant="secondary">อยู่กับเด็กได้</Badge>}
                {animal.suitableForElderly && (
                  <Badge variant="secondary">เหมาะกับผู้สูงอายุ</Badge>
                )}
              </div>

              {animal.personality && (
                <div className="rounded-lg bg-amber-50 p-4">
                  <p className="font-medium text-amber-900">นิสัย / บุคลิก</p>
                  <p className="mt-1 text-amber-800">{animal.personality}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className={
                    animal.vaccinationStatus
                      ? "border-emerald-300 text-emerald-700"
                      : ""
                  }
                >
                  <Syringe className="mr-1 h-3.5 w-3.5" />
                  {animal.vaccinationStatus ? "ฉีดวัคซีนแล้ว" : "ยังไม่ฉีดวัคซีน"}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    animal.sterilizationStatus
                      ? "border-emerald-300 text-emerald-700"
                      : ""
                  }
                >
                  <Scissors className="mr-1 h-3.5 w-3.5" />
                  {animal.sterilizationStatus ? "ทำหมันแล้ว" : "ยังไม่ทำหมัน"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-emerald-600" />
                ศูนย์พักพิง
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-gray-900">{shelter.name}</p>
                <p className="mt-1 text-muted-foreground">{shelter.province}</p>
              </div>

              <div className="space-y-2">
                <p className="flex items-start gap-2 text-gray-700">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  {shelter.address}
                </p>
                {shelter.openHours && (
                  <p className="flex items-start gap-2 text-gray-700">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    {shelter.openHours}
                  </p>
                )}
              </div>

              {shelter.directions && (
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="flex items-center gap-1.5 font-medium text-blue-900">
                    <Navigation className="h-4 w-4" />
                    วิธีเดินทาง
                  </p>
                  <p className="mt-1 text-blue-800">{shelter.directions}</p>
                </div>
              )}

              <div className="space-y-2 border-t pt-4">
                <p className="font-medium text-gray-900">ติดต่อสอบถามรับเลี้ยง</p>
                <a
                  href={`tel:${shelter.phone.replace(/[^0-9+]/g, "")}`}
                  className="flex items-center gap-2 text-emerald-700 hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  {shelter.phone}
                </a>
                {shelter.lineId && (
                  <p className="flex items-center gap-2 text-gray-700">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    LINE: {shelter.lineId}
                  </p>
                )}
                {shelter.email && (
                  <a
                    href={`mailto:${shelter.email}`}
                    className="flex items-center gap-2 text-gray-700 hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {shelter.email}
                  </a>
                )}
              </div>

              <Button asChild className="w-full">
                <a href={shelter.mapsUrl} target="_blank" rel="noopener noreferrer">
                  <Navigation className="mr-2 h-4 w-4" />
                  เปิดแผนที่ Google Maps
                </a>
              </Button>
            </CardContent>
          </Card>

          <div className="relative aspect-video overflow-hidden rounded-xl border bg-gray-50">
            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
              <Image
                src={`https://maps.googleapis.com/maps/api/staticmap?center=${shelter.latitude},${shelter.longitude}&zoom=14&size=600x300&markers=color:green%7C${shelter.latitude},${shelter.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                alt={`แผนที่ ${shelter.name}`}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-4 text-center text-sm text-muted-foreground">
                <MapPin className="mb-2 h-8 w-8 text-emerald-500" />
                <p>
                  {shelter.latitude.toFixed(4)}, {shelter.longitude.toFixed(4)}
                </p>
                <a
                  href={shelter.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-emerald-600 hover:underline"
                >
                  ดูบน Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
