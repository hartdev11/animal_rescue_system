"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Loader2, PawPrint, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getClinicSession } from "@/components/clinic/clinic-login-form";

type AnimalRow = {
  id: string;
  name: string;
  caseNumber: string;
  speciesLabel: string;
  speciesIcon: string;
  adoptionStatus: string;
  profileComplete: boolean;
  coverImage: string | null;
  imageUrls: string[];
};

export function ClinicPendingAnimals() {
  const session = getClinicSession();
  const clinicId = session?.clinicId;
  const province = session?.province;
  const [animals, setAnimals] = useState<AnimalRow[]>([]);
  const [loading, setLoading] = useState(Boolean(clinicId));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!clinicId || !province) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        clinicId,
        province,
        sync: "true",
        all: "true",
      });
      const res = await fetch(`/api/clinic/animals?${params}`);
      if (!res.ok) throw new Error("โหลดไม่สำเร็จ");
      const data = (await res.json()) as { animals: AnimalRow[] };
      setAnimals(data.animals);
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [clinicId, province]);

  useEffect(() => {
    void load();
  }, [load]);

  const pending = useMemo(
    () =>
      animals.filter(
        (a) => a.adoptionStatus === "PENDING" || !a.profileComplete
      ),
    [animals]
  );

  if (!session) return null;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <p className="font-medium">เมื่อเคสฟื้นตัวและส่งศูนย์พักพิงแล้ว</p>
        <p className="mt-1 text-blue-800/90">
          ระบบดึง<strong> รูปจากเคส </strong>มาให้ทันที — กด「กรอกรายละเอียด」เพื่อใส่ชื่อ
          พันธุ์ นิสัย แล้วเผยแพร่ในหน้า「หาบ้านให้สัตว์」
        </p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          สัตว์รอกรอกรายละเอียด ({pending.length})
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

      {loading && pending.length === 0 ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : pending.length === 0 ? (
        <div className="rounded-xl border border-dashed py-14 text-center text-muted-foreground">
          <PawPrint className="mx-auto mb-2 h-10 w-10 text-gray-300" />
          <p>ไม่มีสัตว์รอกรอกรายละเอียด</p>
          <p className="mt-1 text-sm">
            เมื่อบันทึกผล「รอศูนย์พักพิง」จากหน้ารายละเอียดเคส รายการจะโผล่ที่นี่พร้อมรูปอัตโนมัติ
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pending.map((animal) => {
            const cover =
              animal.coverImage ?? animal.imageUrls[0] ?? null;

            return (
              <div
                key={animal.id}
                className="overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                <div className="relative aspect-4/3 bg-gray-100">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={animal.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl">
                      {animal.speciesIcon}
                    </div>
                  )}
                  <Badge className="absolute left-2 top-2 bg-amber-500 text-white hover:bg-amber-500">
                    รอกรอกรายละเอียด
                  </Badge>
                </div>
                <div className="space-y-3 p-4">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">
                      {animal.caseNumber}
                    </p>
                    <p className="font-semibold">{animal.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {animal.speciesLabel} • รูปจากเคสพร้อมแล้ว
                    </p>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/clinic/animals/${animal.id}`}>
                      กรอกรายละเอียด
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
