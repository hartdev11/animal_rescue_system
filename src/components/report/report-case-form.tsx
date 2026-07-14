"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MapPin,
  Loader2,
  CheckCircle2,
  Send,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ImageUploadGrid,
  type ImagePreviewItem,
} from "@/components/report/image-upload-grid";
import { ANIMAL_CONDITIONS, THAI_PROVINCES } from "@/lib/constants";
import { reportCaseSchema, type ReportCaseFormData } from "@/lib/validations/schemas";
import { useGeolocation } from "@/hooks/use-geolocation";
import { parseCoordinates } from "@/lib/utils";
import type { AnimalCondition } from "@/types";

export function ReportCaseForm() {
  const router = useRouter();
  const [images, setImages] = useState<ImagePreviewItem[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    latitude,
    longitude,
    error: locationError,
    requestLocation,
    setManualLocation,
    clearLocation,
    hasLocation,
    loading: locationLoading,
  } = useGeolocation();

  const [useManualMode, setUseManualMode] = useState(false);
  const [manualCoords, setManualCoords] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportCaseFormData>({
    resolver: zodResolver(reportCaseSchema),
    defaultValues: {
      reporterName: "",
      phoneNumber: "",
      wantsToAdopt: false,
      condition: "EMERGENCY" as AnimalCondition,
      description: "",
      province: "",
      latitude: 0,
      longitude: 0,
    },
  });

  const onSubmit = async (data: ReportCaseFormData) => {
    setSubmitError(null);
    setImageError(null);

    if (images.length === 0) {
      setImageError("กรุณาถ่ายหรืออัปโหลดรูปสัตว์อย่างน้อย 1 รูป");
      return;
    }

    if (!hasLocation || latitude === null || longitude === null) {
      setSubmitError("กรุณาระบุตำแหน่งก่อนส่งรายงาน (GPS หรือระบุด้วยตนเอง)");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      for (const img of images) {
        formData.append("images", img.file);
      }
      formData.append("reporterName", data.reporterName);
      formData.append("phoneNumber", data.phoneNumber);
      formData.append("wantsToAdopt", data.wantsToAdopt ? "true" : "false");
      formData.append("condition", data.condition);
      formData.append("description", data.description);
      formData.append("province", data.province);
      formData.append("latitude", String(latitude));
      formData.append("longitude", String(longitude));

      const response = await fetch("/api/cases", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message ?? "ส่งรายงานไม่สำเร็จ");
      }

      router.push(`/report/success?caseNumber=${encodeURIComponent(result.caseNumber)}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyManualLocation = () => {
    setManualError(null);
    const parsed = parseCoordinates(manualCoords);

    if (!parsed) {
      setManualError(
        'กรุณากรอกพิกัดในรูปแบบ "14.554004, 100.967483" (คัดลอกจาก Google Maps ได้เลย)'
      );
      return;
    }

    const ok = setManualLocation(parsed.latitude, parsed.longitude);
    if (!ok) {
      setManualError("พิกัดไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
    }
  };

  const openGoogleMaps = () => {
    window.open("https://www.google.com/maps", "_blank", "noopener,noreferrer");
  };

  const handleLocationRequest = () => {
    setUseManualMode(false);
    setManualError(null);
    requestLocation();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Photo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            รูปสัตว์ <span className="text-red-500">*</span>
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              (สูงสุด 5 รูป)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploadGrid
            images={images}
            onChange={(next) => {
              setImages(next);
              setImageError(null);
            }}
            error={imageError}
          />
        </CardContent>
      </Card>

      {/* Reporter name */}
      <div className="space-y-2">
        <Label htmlFor="reporterName">
          ชื่อผู้แจ้ง <span className="text-red-500">*</span>
        </Label>
        <Input
          id="reporterName"
          type="text"
          placeholder="ชื่อเล่นหรือชื่อจริง"
          autoComplete="name"
          {...register("reporterName")}
        />
        <p className="text-xs text-muted-foreground">
          ใช้ระบุตัวตนผู้แจ้งเคส — คลินิกอาจติดต่อเพื่อขอรายละเอียดเพิ่มเติม
        </p>
        {errors.reporterName && (
          <p className="text-sm text-red-600">{errors.reporterName.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">
          เบอร์โทรศัพท์ <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder="0812345678"
          {...register("phoneNumber")}
        />
        <p className="text-xs text-muted-foreground">
          คลินิกอาจติดต่อเพื่อขอรายละเอียดเพิ่มเติม
        </p>
        {errors.phoneNumber && (
          <p className="text-sm text-red-600">{errors.phoneNumber.message}</p>
        )}
      </div>

      {/* Adoption preference */}
      <Card className="border-blue-100 bg-blue-50/50">
        <CardContent className="pt-6">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              {...register("wantsToAdopt")}
            />
            <span className="space-y-1">
              <span className="flex items-center gap-2 font-medium text-gray-900">
                <User className="h-4 w-4 text-emerald-600" />
                ต้องการรับเลี้ยงสัตว์ตัวนี้เองหลังจากฟื้นตัวดีแล้ว
              </span>
              <span className="block text-sm text-muted-foreground">
                หากไม่เลือก ศูนย์พักพิงสัตว์จะเป็นผู้ดูแลต่อหลังการรักษา
              </span>
            </span>
          </label>
        </CardContent>
      </Card>

      {/* Condition */}
      <div className="space-y-2">
        <Label htmlFor="condition">
          อาการ / สถานการณ์ <span className="text-red-500">*</span>
        </Label>
        <select
          id="condition"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...register("condition")}
        >
          {ANIMAL_CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.labelTh}
            </option>
          ))}
        </select>
        {errors.condition && (
          <p className="text-sm text-red-600">{errors.condition.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          รายละเอียด <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          rows={4}
          placeholder="อธิบายอาการ สถานที่ และสิ่งที่พบเห็น..."
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Location */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-5 w-5 text-red-500" />
            ตำแหน่ง GPS <span className="text-red-500">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasLocation && latitude !== null && longitude !== null ? (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div className="flex-1">
                <p className="font-medium text-emerald-800">ได้รับตำแหน่งแล้ว</p>
                <p className="mt-1 font-mono text-sm text-emerald-700">
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs text-emerald-700 underline"
                >
                  ดูบน Google Maps
                </a>
                <button
                  type="button"
                  onClick={() => {
                    clearLocation();
                    setUseManualMode(false);
                    setManualCoords("");
                  }}
                  className="mt-2 block text-xs text-emerald-600 hover:underline"
                >
                  ล้างตำแหน่ง
                </button>
              </div>
            </div>
          ) : (
            locationError && (
              <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {locationError}
              </p>
            )
          )}

          <Button
            type="button"
            variant="outline"
            onClick={handleLocationRequest}
            disabled={locationLoading}
            className="w-full"
          >
            {locationLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังขอตำแหน่ง...
              </>
            ) : hasLocation ? (
              <>
                <MapPin className="h-4 w-4" />
                อัปเดตตำแหน่งอีกครั้ง
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                ขออนุญาตใช้ตำแหน่ง (GPS)
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">หรือ</span>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-sm"
            onClick={() => {
              setUseManualMode((v) => !v);
              setManualError(null);
            }}
          >
            {useManualMode ? "ซ่อนการระบุตำแหน่งด้วยตนเอง" : "📍 ระบุตำแหน่งด้วยตนเอง (ถ้า GPS ไม่ทำงาน)"}
          </Button>

          {useManualMode && (
            <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                เปิด Google Maps → กดค้างที่ตำแหน่งสัตว์ → คัดลอกพิกัดมาวางด้านล่าง
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openGoogleMaps}
              >
                เปิด Google Maps
              </Button>
              <div className="space-y-1">
                <Label htmlFor="manualCoords" className="text-xs">
                  พิกัด (วางจาก Google Maps)
                </Label>
                <Input
                  id="manualCoords"
                  type="text"
                  placeholder="14.554004, 100.967483"
                  value={manualCoords}
                  onChange={(e) => setManualCoords(e.target.value)}
                />
                <p className="text-xs text-blue-700">
                  ตัวอย่าง: 14.554004, 100.967483
                </p>
              </div>
              {manualError && (
                <p className="text-sm text-red-600">{manualError}</p>
              )}
              <Button
                type="button"
                className="w-full"
                onClick={handleApplyManualLocation}
              >
                ยืนยันตำแหน่งนี้
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Province */}
      <div className="space-y-2">
        <Label htmlFor="province">
          จังหวัด <span className="text-red-500">*</span>
        </Label>
        <select
          id="province"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...register("province")}
        >
          <option value="">-- เลือกจังหวัด --</option>
          {THAI_PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {errors.province && (
          <p className="text-sm text-red-600">{errors.province.message}</p>
        )}
      </div>

      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full bg-red-600 text-base hover:bg-red-700"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            กำลังส่งรายงาน...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            ส่งรายงานฉุกเฉิน
          </>
        )}
      </Button>
    </form>
  );
}
