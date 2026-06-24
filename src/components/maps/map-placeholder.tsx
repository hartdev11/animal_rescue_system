export function MapPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 ${className ?? "h-64"}`}
    >
      <p className="text-sm text-gray-500">Google Maps — จะเชื่อมต่อหลังตั้งค่า API Key</p>
    </div>
  );
}
