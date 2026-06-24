import type { Metadata } from "next";
import { ClinicCaseDetail } from "@/components/clinic/clinic-case-detail";

export const metadata: Metadata = {
  title: "รายละเอียดเคส | Clinic Portal",
};

interface ClinicCaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClinicCaseDetailPage({
  params,
}: ClinicCaseDetailPageProps) {
  const { id } = await params;
  return <ClinicCaseDetail caseNumber={id} />;
}
