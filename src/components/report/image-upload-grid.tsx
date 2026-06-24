"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_CASE_IMAGES } from "@/lib/case-images";
import { cn } from "@/lib/utils";

export interface ImagePreviewItem {
  id: string;
  file: File;
  preview: string;
}

interface ImageUploadGridProps {
  images: ImagePreviewItem[];
  onChange: (images: ImagePreviewItem[]) => void;
  error?: string | null;
  maxImages?: number;
}

const MAX_SIZE = 5 * 1024 * 1024;

export function ImageUploadGrid({
  images,
  onChange,
  error,
  maxImages = MAX_CASE_IMAGES,
}: ImageUploadGridProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;

    const next = [...images];
    let err: string | null = null;

    for (const file of Array.from(files)) {
      if (next.length >= maxImages) {
        err = `อัปโหลดได้สูงสุด ${maxImages} รูป`;
        break;
      }
      if (!file.type.startsWith("image/")) {
        err = "กรุณาเลือกไฟล์รูปภาพเท่านั้น";
        continue;
      }
      if (file.size > MAX_SIZE) {
        err = "ขนาดรูปภาพต้องไม่เกิน 5 MB ต่อรูป";
        continue;
      }
      next.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
      });
    }

    onChange(next);
    setLocalError(err);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeImage = (id: string) => {
    const item = images.find((img) => img.id === id);
    if (item) URL.revokeObjectURL(item.preview);
    onChange(images.filter((img) => img.id !== id));
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      {images.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-8 transition hover:border-red-400 hover:bg-red-50"
        >
          <Camera className="h-10 w-10 text-gray-400" />
          <div className="text-center">
            <p className="font-medium text-gray-700">ถ่ายรูปหรือเลือกจากคลัง</p>
            <p className="mt-1 text-xs text-muted-foreground">
              อัปโหลดได้สูงสุด {maxImages} รูป • กดเพื่อขออนุญาตใช้กล้อง
            </p>
          </div>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {images.map((img, index) => (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-xl border bg-gray-50"
            >
              <Image
                src={img.preview}
                alt={`รูปที่ ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute left-1.5 top-1.5 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">
                {index + 1}
              </div>
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white opacity-90 hover:opacity-100"
                aria-label="ลบรูป"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {canAddMore && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700"
              )}
            >
              <Plus className="h-6 w-6" />
              <span className="text-[10px] font-medium">เพิ่มรูป</span>
            </button>
          )}
        </div>
      )}

      {images.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {images.length} / {maxImages} รูป
          </span>
          {canAddMore && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => inputRef.current?.click()}
            >
              <Plus className="h-3.5 w-3.5" />
              เพิ่มรูป
            </Button>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!error && localError && (
        <p className="text-sm text-red-600">{localError}</p>
      )}
    </div>
  );
}
