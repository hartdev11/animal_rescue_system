"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Loader2, PawPrint, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getClinicSession } from "@/components/clinic/clinic-login-form";

type AnimalRow = {
  id: string;
  name: string;
  speciesLabel: string;
  speciesIcon: string;
  breed?: string;
  estimatedAge: string;
  adoptionStatus: string;
  profileComplete?: boolean;
  coverImage: string | null;
  caseNumber: string;
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "แสดงในหน้าสาธารณะ",
  PENDING: "รอกรอกรายละเอียด",
  ADOPTED: "ได้เจ้าของแล้ว",
};

export function ClinicRegisteredAnimals() {
  const session = getClinicSession();
  const clinicId = session?.clinicId;
  const [animals, setAnimals] = useState<AnimalRow[]>([]);
  const [loading, setLoading] = useState(Boolean(clinicId));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!clinicId) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ clinicId });
      const res = await fetch(`/api/clinic/animals?${params}`);
      if (!res.ok) throw new Error("โหลดไม่สำเร็จ");
      const data = (await res.json()) as { animals: AnimalRow[] };
      setAnimals(data.animals);
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    void load();
  }, [load]);

  const published = useMemo(
    () =>
      animals.filter(
        (a) =>
          a.adoptionStatus === "AVAILABLE" && a.profileComplete !== false
      ),
    [animals]
  );

  if (!session) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          สัตว์ที่เผยแพร่ในหน้า「หาบ้านให้สัตว์」แล้ว ({published.length})
        </p>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`mr-1.5 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          รีเฟรช
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      {loading && published.length === 0 ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : published.length === 0 ? (
        <div className="rounded-xl border border-dashed py-14 text-center text-muted-foreground">
          <PawPrint className="mx-auto mb-2 h-10 w-10 text-gray-300" />
          <p>ยังไม่มีสัตว์ที่เผยแพร่</p>
          <p className="mt-1 text-sm">
            ไปที่แท็บ「รอกรอกรายละเอียด」กรอกข้อมูลให้ครบ แล้วกดบันทึก
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {published.map((animal) => (
            <div
              key={animal.id}
              className="flex gap-4 rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border bg-gray-50">
                {animal.coverImage ? (
                  <Image
                    src={animal.coverImage}
                    alt={animal.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl">
                    {animal.speciesIcon}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">
                    {animal.speciesIcon} {animal.name}
                  </p>
                  <Badge className="bg-emerald-100 text-emerald-800">
                    {STATUS_LABELS.AVAILABLE}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {animal.speciesLabel}
                  {animal.breed ? ` • ${animal.breed}` : ""} • {animal.estimatedAge}
                </p>
                <p className="font-mono text-xs text-gray-500">{animal.caseNumber}</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <Link
                    href={`/clinic/animals/${animal.id}`}
                    className="text-sm text-emerald-700 hover:underline"
                  >
                    แก้ไขข้อมูล →
                  </Link>
                  <Link
                    href={`/adoption/${animal.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    ดูหน้าสาธารณะ
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
