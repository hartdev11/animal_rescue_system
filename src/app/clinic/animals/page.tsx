import { Suspense } from "react";
import { ClinicAnimalsHub } from "@/components/clinic/clinic-animals-hub";

export const metadata = {
  title: "หาบ้านให้สัตว์ | Clinic Portal",
};

export default function ClinicAnimalsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        </div>
      }
    >
      <ClinicAnimalsHub />
    </Suspense>
  );
}
