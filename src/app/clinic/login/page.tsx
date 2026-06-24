import { ClinicLoginForm } from "@/components/clinic/clinic-login-form";

export const metadata = {
  title: "เข้าสู่ระบบคลินิก | Clinic Portal",
};

export default function ClinicLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <ClinicLoginForm />
    </div>
  );
}
