"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ClinicPendingAnimals } from "@/components/clinic/clinic-pending-animals";
import { ClinicRegisteredAnimals } from "@/components/clinic/clinic-registered-animals";
import { ClinicShelterList } from "@/components/clinic/clinic-shelter-list";

const TABS = [
  { id: "pending", label: "รอกรอกรายละเอียด" },
  { id: "listed", label: "เผยแพร่แล้ว" },
  { id: "shelter", label: "จัดการเคสศูนย์" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ClinicAnimalsHub() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab: TabId =
    tabParam === "listed" || tabParam === "shelter" ? tabParam : "pending";
  const [tab, setTab] = useState<TabId>(initialTab);

  useEffect(() => {
    if (tabParam === "listed" || tabParam === "shelter") {
      setTab(tabParam);
    } else if (tabParam === "pending") {
      setTab("pending");
    }
  }, [tabParam]);

  return (
      <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">หาบ้านให้สัตว์ (คลินิก)</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          เคสที่รักษาเสร็จและส่งศูนย์พักพิง → รูปดึงมาอัตโนมัติ → กรอกรายละเอียด →
          แสดงในหน้าสาธารณะ
        </p>
      </div>

      <div className="-mx-1 flex gap-1 overflow-x-auto border-b px-1 pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "shrink-0 rounded-t-lg px-3 py-2 text-sm font-medium transition sm:px-4",
              tab === t.id
                ? "border-b-2 border-emerald-600 text-emerald-700"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "pending" && <ClinicPendingAnimals />}
      {tab === "listed" && <ClinicRegisteredAnimals />}
      {tab === "shelter" && <ClinicShelterList />}
    </div>
  );
}
