"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Building2, Loader2, MapPin, PawPrint } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ANIMAL_SPECIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AnimalSpecies } from "@/types";

type AnimalRow = {
  id: string;
  name: string;
  species: AnimalSpecies;
  speciesLabel: string;
  speciesIcon: string;
  breed?: string;
  estimatedAge: string;
  gender: string;
  description: string;
  coverImage: string | null;
  imageUrls: string[];
  shelterId: string;
  shelterName: string | null;
  shelterProvince: string | null;
};

type ShelterRow = {
  id: string;
  name: string;
  province: string;
  address: string;
};

type SpeciesFilter = "ALL" | AnimalSpecies;
type ShelterFilter = "ALL" | string;

export function AdoptionList() {
  const [animals, setAnimals] = useState<AnimalRow[]>([]);
  const [shelters, setShelters] = useState<ShelterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilter>("ALL");
  const [shelterFilter, setShelterFilter] = useState<ShelterFilter>("ALL");

  const loadData = useCallback(async () => {
    const [animalsRes, sheltersRes] = await Promise.all([
      fetch("/api/adoption"),
      fetch("/api/shelters"),
    ]);

    if (!animalsRes.ok || !sheltersRes.ok) {
      throw new Error("โหลดไม่สำเร็จ");
    }

    const animalsData = (await animalsRes.json()) as { animals: AnimalRow[] };
    const sheltersData = (await sheltersRes.json()) as { shelters: ShelterRow[] };

    return {
      animals: animalsData.animals,
      shelters: sheltersData.shelters,
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await loadData();
        if (!cancelled) {
          setAnimals(data.animals);
          setShelters(data.shelters);
        }
      } catch {
        if (!cancelled) setError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadData]);

  const filtered = useMemo(() => {
    let list = animals;

    if (shelterFilter !== "ALL") {
      list = list.filter((a) => a.shelterId === shelterFilter);
    }

    if (speciesFilter !== "ALL") {
      list = list.filter((a) => a.species === speciesFilter);
    }

    return list;
  }, [animals, shelterFilter, speciesFilter]);

  const speciesCounts = useMemo(() => {
    const base =
      shelterFilter === "ALL"
        ? animals
        : animals.filter((a) => a.shelterId === shelterFilter);

    const map: Record<string, number> = { ALL: base.length };
    for (const s of ANIMAL_SPECIES) {
      map[s.value] = base.filter((a) => a.species === s.value).length;
    }
    return map;
  }, [animals, shelterFilter]);

  const shelterCounts = useMemo(() => {
    const map: Record<string, number> = { ALL: animals.length };
    for (const shelter of shelters) {
      map[shelter.id] = animals.filter((a) => a.shelterId === shelter.id).length;
    }
    return map;
  }, [animals, shelters]);

  const selectedShelter = shelters.find((s) => s.id === shelterFilter);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <Label htmlFor="shelter-filter" className="flex items-center gap-2 text-sm font-medium">
          <Building2 className="h-4 w-4 text-emerald-600" />
          เลือกศูนย์พักพิง
        </Label>
        <select
          id="shelter-filter"
          value={shelterFilter}
          onChange={(e) => setShelterFilter(e.target.value)}
          className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 sm:max-w-md"
        >
          <option value="ALL">
            ทุกศูนย์พักพิง ({shelterCounts.ALL ?? 0} ตัว)
          </option>
          {shelters.map((shelter) => (
            <option key={shelter.id} value={shelter.id}>
              {shelter.name} — {shelter.province} ({shelterCounts[shelter.id] ?? 0} ตัว)
            </option>
          ))}
        </select>
        {selectedShelter && (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {selectedShelter.address}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={speciesFilter === "ALL"}
          onClick={() => setSpeciesFilter("ALL")}
          label="ทั้งหมด"
          count={speciesCounts.ALL ?? 0}
          icon="🐾"
        />
        {ANIMAL_SPECIES.map((s) => (
          <FilterChip
            key={s.value}
            active={speciesFilter === s.value}
            onClick={() => setSpeciesFilter(s.value)}
            label={s.label}
            count={speciesCounts[s.value] ?? 0}
            icon={s.icon}
          />
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed py-14 text-center text-muted-foreground">
          <PawPrint className="mx-auto mb-2 h-10 w-10 text-gray-300" />
          <p>ยังไม่มีสัตว์รอรับเลี้ยงในศูนย์ที่เลือก</p>
          <p className="mt-1 text-sm">
            ลองเลือกศูนย์พักพิงอื่น หรือเปลี่ยนหมวดชนิดสัตว์
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3">
          {filtered.map((animal) => (
            <Link
              key={animal.id}
              href={`/adoption/${animal.id}`}
              className="group overflow-hidden rounded-lg border bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md sm:rounded-xl"
            >
              <div className="relative aspect-4/3 bg-gray-100">
                {animal.coverImage ? (
                  <Image
                    src={animal.coverImage}
                    alt={animal.name}
                    fill
                    className="object-cover transition group-hover:scale-[1.02]"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl sm:text-4xl">
                    {animal.speciesIcon}
                  </div>
                )}
                <span className="absolute left-1 top-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-medium shadow sm:left-2 sm:top-2 sm:px-2.5 sm:text-xs">
                  {animal.speciesIcon} {animal.speciesLabel}
                </span>
              </div>
              <div className="p-2 sm:p-4">
                <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 sm:text-lg">
                  {animal.name}
                </h2>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground sm:text-sm">
                  {[animal.breed, animal.estimatedAge].filter(Boolean).join(" • ")}
                </p>
                {animal.shelterName && (
                  <p className="mt-1 hidden items-center gap-1 text-xs text-emerald-700 sm:flex">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="line-clamp-1">
                      {animal.shelterName}
                      {animal.shelterProvince ? ` (${animal.shelterProvince})` : ""}
                    </span>
                  </p>
                )}
                <p className="mt-1 line-clamp-2 text-[11px] text-gray-600 sm:mt-2 sm:text-sm">
                  {animal.description}
                </p>
                <p className="mt-1.5 text-[11px] font-medium text-emerald-700 group-hover:underline sm:mt-3 sm:text-sm">
                  ดูรายละเอียด →
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  icon: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition",
        active
          ? "border-emerald-600 bg-emerald-600 text-white"
          : "border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50"
      )}
    >
      <span>{icon}</span>
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-1.5 text-xs",
          active ? "bg-emerald-500" : "bg-gray-100"
        )}
      >
        {count}
      </span>
    </button>
  );
}
