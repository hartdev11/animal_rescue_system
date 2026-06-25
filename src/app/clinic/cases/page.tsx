import { Suspense } from "react";
import { ClinicCasesList } from "@/components/clinic/clinic-cases-list";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "เคสทั้งหมด | Clinic Portal",
};

export default function ClinicCasesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <ClinicCasesList />
    </Suspense>
  );
}
