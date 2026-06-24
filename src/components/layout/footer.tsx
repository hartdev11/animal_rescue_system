import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{APP_NAME}</p>
          <p>ช่วยเหลือสัตว์จรจัดที่บาดเจ็บ — รายงานฉุกเฉินได้ทันที</p>
          <p className="text-xs">© {new Date().getFullYear()} Animal Rescue System. Graduation Project.</p>
        </div>
      </div>
    </footer>
  );
}
