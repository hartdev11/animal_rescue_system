import { getClinicDashboardStats } from "@/services/clinic-service";
import { CASE_STATUS_LABELS } from "@/lib/constants";
import type { CaseStatus } from "@/types";

export const metadata = {
  title: "แดชบอร์ด | Clinic Portal",
};

const statKeys: { key: keyof Awaited<ReturnType<typeof getClinicDashboardStats>>; status?: CaseStatus }[] = [
  { key: "newCases", status: "NEW" },
  { key: "acceptedCases", status: "ACCEPTED" },
  { key: "onTheWay", status: "ON_THE_WAY" },
  { key: "underTreatment", status: "UNDER_TREATMENT" },
  { key: "recovery", status: "RECOVERY" },
  { key: "readyForAdoption", status: "READY_FOR_ADOPTION" },
  { key: "closedCases", status: "CLOSED" },
];

export default async function ClinicDashboardPage() {
  const stats = await getClinicDashboardStats("demo-clinic");

  return (
    <div>
      <h1 className="text-2xl font-bold">แดชบอร์ด</h1>
      <p className="text-muted-foreground">ภาพรวมเคสช่วยเหลือสัตว์</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statKeys.map(({ key, status }) => (
          <div key={key} className="rounded-xl border p-6">
            <p className="text-sm text-muted-foreground">
              {status ? CASE_STATUS_LABELS[status].th : key}
            </p>
            <p className="mt-2 text-3xl font-bold">{stats[key]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
