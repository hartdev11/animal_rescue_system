"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { animalSchema, type AnimalFormData } from "@/lib/validations/schemas";
import { ANIMAL_SPECIES, ENERGY_LEVELS, TEMPERAMENT_TRAITS } from "@/lib/constants";
import { getClinicSession } from "@/components/clinic/clinic-login-form";
import {
  ImageUploadGrid,
  type ImagePreviewItem,
} from "@/components/report/image-upload-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MAX_ANIMAL_IMAGES } from "@/lib/animal-images";
import { cn } from "@/lib/utils";
import type { AnimalSpecies, TemperamentTrait } from "@/types";

interface ShelterOption {
  id: string;
  name: string;
  province: string;
}

interface ClinicAnimalFormProps {
  mode: "create" | "edit";
  animalId?: string;
  initialCaseNumber?: string;
  initialProvince?: string;
}

interface AnimalApiData {
  animal: AnimalFormData & {
    id: string;
    caseNumber: string;
    species: AnimalSpecies;
    imageUrls: string[];
    adoptionStatus: string;
  };
  shelter: ShelterOption;
}

export function ClinicAnimalForm({
  mode,
  animalId,
  initialCaseNumber,
  initialProvince,
}: ClinicAnimalFormProps) {
  const router = useRouter();
  const session = getClinicSession();
  const [shelters, setShelters] = useState<ShelterOption[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<ImagePreviewItem[]>([]);
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AnimalFormData>({
    resolver: zodResolver(animalSchema),
    defaultValues: {
      caseNumber: initialCaseNumber ?? "",
      shelterId: "",
      species: "DOG",
      breed: "",
      name: "",
      gender: "UNKNOWN",
      estimatedAge: "",
      description: "",
      personality: "",
      temperamentTraits: [],
      suitableForCondo: false,
      suitableForKids: false,
      suitableForElderly: false,
      hasDisability: false,
      disabilityNotes: "",
      vaccinationStatus: false,
      sterilizationStatus: false,
    },
  });

  const hasDisability = watch("hasDisability");
  const selectedTraits = watch("temperamentTraits") ?? [];

  const loadShelters = useCallback(async (province?: string) => {
    const params = province ? `?province=${encodeURIComponent(province)}` : "";
    const res = await fetch(`/api/shelters${params}`);
    if (!res.ok) throw new Error("โหลดศูนย์พักพิงไม่สำเร็จ");
    const data = (await res.json()) as { shelters: ShelterOption[] };
    setShelters(data.shelters);
    return data.shelters;
  }, []);

  useEffect(() => {
    if (!initialCaseNumber) return;

    void (async () => {
      try {
        const res = await fetch(
          `/api/clinic/cases/${encodeURIComponent(initialCaseNumber)}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as { case: { province: string } };
        await loadShelters(data.case.province);
      } catch {
        // keep default shelter list
      }
    })();
  }, [initialCaseNumber, loadShelters]);

  useEffect(() => {
    if (initialCaseNumber) return;
    void loadShelters(initialProvince ?? session?.province).catch(() => {
      setError("โหลดรายการศูนย์พักพิงไม่สำเร็จ");
    });
  }, [loadShelters, initialProvince, session?.province, initialCaseNumber]);

  useEffect(() => {
    if (mode !== "edit" || !animalId) return;

    void (async () => {
      try {
        const res = await fetch(`/api/clinic/animals/${animalId}`);
        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
        const data = (await res.json()) as AnimalApiData;

        reset({
          caseNumber: data.animal.caseNumber,
          shelterId: data.animal.shelterId,
          species: data.animal.species,
          breed: data.animal.breed ?? "",
          name: data.animal.name,
          gender: data.animal.gender,
          estimatedAge: data.animal.estimatedAge,
          weight: data.animal.weight,
          description: data.animal.description,
          personality: data.animal.personality ?? "",
          temperamentTraits: data.animal.temperamentTraits ?? [],
          energyLevel: data.animal.energyLevel,
          suitableForCondo: data.animal.suitableForCondo ?? false,
          suitableForKids: data.animal.suitableForKids ?? false,
          suitableForElderly: data.animal.suitableForElderly ?? false,
          hasDisability: data.animal.hasDisability ?? false,
          disabilityNotes: data.animal.disabilityNotes ?? "",
          vaccinationStatus: data.animal.vaccinationStatus,
          sterilizationStatus: data.animal.sterilizationStatus,
        });
        setExistingImages(data.animal.imageUrls ?? []);
      } catch {
        setError("โหลดข้อมูลสัตว์ไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, animalId, reset]);

  const onSubmit = async (values: AnimalFormData) => {
    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("caseNumber", values.caseNumber);
      formData.set("shelterId", values.shelterId);
      formData.set("species", values.species);
      if (values.breed) formData.set("breed", values.breed);
      formData.set("name", values.name);
      formData.set("gender", values.gender);
      formData.set("estimatedAge", values.estimatedAge);
      if (values.weight) formData.set("weight", String(values.weight));
      formData.set("description", values.description);
      if (values.personality) formData.set("personality", values.personality);
      if (values.energyLevel) formData.set("energyLevel", values.energyLevel);
      for (const trait of values.temperamentTraits ?? []) {
        formData.append("temperamentTraits", trait);
      }
      formData.set("suitableForCondo", values.suitableForCondo ? "true" : "false");
      formData.set("suitableForKids", values.suitableForKids ? "true" : "false");
      formData.set("suitableForElderly", values.suitableForElderly ? "true" : "false");
      formData.set("hasDisability", values.hasDisability ? "true" : "false");
      if (values.disabilityNotes) formData.set("disabilityNotes", values.disabilityNotes);
      formData.set("vaccinationStatus", values.vaccinationStatus ? "true" : "false");
      formData.set("sterilizationStatus", values.sterilizationStatus ? "true" : "false");
      if (mode === "edit") formData.set("publish", "true");
      if (session?.clinicId) formData.set("clinicId", session.clinicId);

      for (const img of newImages) {
        formData.append("images", img.file);
      }

      const url =
        mode === "create"
          ? "/api/clinic/animals"
          : `/api/clinic/animals/${animalId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message ?? "บันทึกไม่สำเร็จ");
        return;
      }

      router.push("/clinic/animals?tab=listed");
      router.refresh();
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  const markAdopted = async () => {
    if (!animalId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/clinic/animals/${animalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adoptionStatus: "ADOPTED" }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message ?? "อัปเดตไม่สำเร็จ");
        return;
      }
      router.push("/clinic/animals");
      router.refresh();
    } catch {
      setError("เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {mode === "edit" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">รูปจากเคสถูกดึงมาแล้ว</p>
          <p className="mt-1">
            กรอกชื่อ พันธุ์ อายุ และคำอธิบายให้ครบ แล้วกดบันทึก — ระบบจะเผยแพร่ในหน้า「หาบ้านให้สัตว์」ให้อัตโนมัติ
          </p>
        </div>
      )}
      {mode === "create" && (
        <div className="space-y-2">
          <Label htmlFor="caseNumber">เลขเคส *</Label>
          <Input id="caseNumber" {...register("caseNumber")} readOnly={!!initialCaseNumber} />
          {errors.caseNumber && (
            <p className="text-sm text-red-600">{errors.caseNumber.message}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="shelterId">ศูนย์พักพิง *</Label>
        <select
          id="shelterId"
          {...register("shelterId")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">เลือกศูนย์พักพิง</option>
          {shelters.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.province})
            </option>
          ))}
        </select>
        {errors.shelterId && (
          <p className="text-sm text-red-600">{errors.shelterId.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="species">ชนิดสัตว์ *</Label>
          <select
            id="species"
            {...register("species")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {ANIMAL_SPECIES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.icon} {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="breed">พันธุ์</Label>
          <Input id="breed" placeholder="เช่น ไทยหลังอาน" {...register("breed")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">ชื่อสัตว์ *</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">เพศ *</Label>
          <select
            id="gender"
            {...register("gender")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="MALE">ผู้</option>
            <option value="FEMALE">เมีย</option>
            <option value="UNKNOWN">ไม่ทราบ</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="estimatedAge">อายุโดยประมาณ *</Label>
          <Input id="estimatedAge" placeholder="เช่น 2 ปี" {...register("estimatedAge")} />
          {errors.estimatedAge && (
            <p className="text-sm text-red-600">{errors.estimatedAge.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">น้ำหนัก (กก.)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            {...register("weight", {
              setValueAs: (v) =>
                v === "" || v === null || v === undefined ? undefined : Number(v),
            })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">คำอธิบาย *</Label>
        <Textarea id="description" rows={4} {...register("description")} />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4 space-y-4">
        <div>
          <p className="font-medium text-violet-900">ข้อมูลจับคู่ (คลินิกกรอก)</p>
          <p className="text-xs text-violet-700">
            ใช้สำหรับระบบหาสัตว์ที่เหมาะกับผู้ใช้ — ไม่มีการเดาจากข้อความอิสระ
          </p>
        </div>

        <div className="space-y-2">
          <Label>แท็กนิสัย * (เลือกอย่างน้อย 1)</Label>
          <div className="flex flex-wrap gap-2">
            {TEMPERAMENT_TRAITS.map((trait) => {
              const active = selectedTraits.includes(trait.value);
              return (
                <button
                  key={trait.value}
                  type="button"
                  onClick={() => {
                    const next = active
                      ? selectedTraits.filter((t) => t !== trait.value)
                      : [...selectedTraits, trait.value];
                    setValue("temperamentTraits", next as TemperamentTrait[], {
                      shouldValidate: true,
                    });
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition",
                    active
                      ? "border-violet-600 bg-violet-600 text-white"
                      : "border-gray-200 bg-white hover:border-violet-300"
                  )}
                >
                  {trait.label}
                </button>
              );
            })}
          </div>
          {errors.temperamentTraits && (
            <p className="text-sm text-red-600">{errors.temperamentTraits.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="energyLevel">ระดับพลังงาน *</Label>
          <select
            id="energyLevel"
            {...register("energyLevel")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">— เลือก —</option>
            {ENERGY_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          {errors.energyLevel && (
            <p className="text-sm text-red-600">{errors.energyLevel.message}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("suitableForCondo")} />
            เหมาะกับคอนโด/พื้นที่จำกัด
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("suitableForKids")} />
            อยู่กับเด็กได้
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("suitableForElderly")} />
            เหมาะกับผู้สูงอายุ
          </label>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" {...register("hasDisability")} />
            มีความพิการ / ความต้องการดูแลพิเศษ
          </label>
          {hasDisability && (
            <Textarea
              rows={3}
              placeholder="ระบุรายละเอียดความพิการหรือการดูแลพิเศษที่คลินิกประเมิน เช่น ขาข้างหลังอ่อนแรง ต้องช่วยเดิน"
              {...register("disabilityNotes")}
            />
          )}
          {errors.disabilityNotes && (
            <p className="text-sm text-red-600">{errors.disabilityNotes.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="personality">นิสัย / บุคลิก (ข้อความเพิ่มเติม)</Label>
        <Textarea
          id="personality"
          rows={3}
          placeholder="เช่น ขี้อ้อน ไม่กัดคน ชอบเด็ก"
          {...register("personality")}
        />
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("vaccinationStatus")} />
          ฉีดวัคซีนแล้ว
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("sterilizationStatus")} />
          ทำหมันแล้ว
        </label>
      </div>

      {existingImages.length > 0 && (
        <div className="space-y-2">
          <Label>รูปภาพปัจจุบัน</Label>
          <div className="flex flex-wrap gap-2">
            {existingImages.map((src, i) => (
              <div
                key={`${src.slice(0, 24)}-${i}`}
                className="relative h-20 w-20 overflow-hidden rounded-lg border"
              >
                <Image src={src} alt="" fill className="object-cover" unoptimized />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>รูปภาพเพิ่มเติม</Label>
        <ImageUploadGrid
          images={newImages}
          onChange={setNewImages}
          maxImages={MAX_ANIMAL_IMAGES}
        />
        <p className="text-xs text-muted-foreground">
          รูปจากเคสเดิมจะถูกนำมาแสดงอัตโนมัติ — อัปโหลดเพิ่มได้สูงสุด {MAX_ANIMAL_IMAGES} รูป
        </p>
      </div>

      <div className="flex flex-wrap gap-3 border-t pt-6">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "edit" ? "บันทึกและเผยแพร่" : "ลงทะเบียนรับเลี้ยง"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/clinic/animals">ยกเลิก</Link>
        </Button>
        {mode === "edit" && (
          <Button
            type="button"
            variant="secondary"
            disabled={submitting}
            onClick={markAdopted}
          >
            ทำเครื่องหมายว่าได้เจ้าของแล้ว
          </Button>
        )}
      </div>
    </form>
  );
}
