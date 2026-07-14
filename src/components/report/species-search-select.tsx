"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ANIMAL_SPECIES,
  getSpeciesIcon,
  getSpeciesLabel,
  matchSpeciesQuery,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AnimalSpecies } from "@/types";

interface SpeciesSearchSelectProps {
  value: AnimalSpecies | "";
  onChange: (value: AnimalSpecies) => void;
  error?: string;
  id?: string;
  required?: boolean;
}

export function SpeciesSearchSelect({
  value,
  onChange,
  error,
  id = "species",
  required,
}: SpeciesSearchSelectProps) {
  const [query, setQuery] = useState("");
  const options = useMemo(() => matchSpeciesQuery(query), [query]);

  return (
    <div className="space-y-2">
      <Label htmlFor={`${id}-search`}>
        ประเภทสัตว์ {required ? <span className="text-red-500">*</span> : null}
      </Label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={`${id}-search`}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="พิมพ์ค้นหา เช่น หมา แมว กระต่าย..."
          className="pl-9"
          autoComplete="off"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.length === 0 ? (
          <p className="col-span-full text-sm text-muted-foreground">
            ไม่พบชนิดสัตว์ที่ค้นหา — ลองพิมพ์ 「หมา」「แมว」หรือเลือก「อื่นๆ」
          </p>
        ) : (
          options.map((s) => {
            const active = value === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => onChange(s.value)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition",
                  active
                    ? "border-emerald-500 bg-emerald-50 font-medium text-emerald-900 ring-1 ring-emerald-500"
                    : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40"
                )}
              >
                <span className="text-lg">{s.icon}</span>
                <span>{s.label}</span>
              </button>
            );
          })
        )}
      </div>
      {value ? (
        <p className="text-xs text-muted-foreground">
          เลือกแล้ว: {getSpeciesIcon(value)} {getSpeciesLabel(value)}
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
