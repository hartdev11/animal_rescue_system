"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  alt?: string;
  className?: string;
  /** compact = thumbnails only in a row; default = hero + thumbnails */
  variant?: "default" | "compact";
}

export function ImageGallery({
  images,
  alt = "รูปภาพ",
  className,
  variant = "default",
}: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div
        className={cn(
          "flex aspect-video items-center justify-center rounded-xl border border-dashed bg-gray-50 text-sm text-muted-foreground",
          className
        )}
      >
        ไม่มีรูปภาพ
      </div>
    );
  }

  const goPrev = () =>
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const goNext = () =>
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  if (variant === "compact") {
    return (
      <div className={cn("flex gap-2 overflow-x-auto pb-1", className)}>
        {images.map((src, i) => (
          <button
            key={`${src.slice(0, 32)}-${i}`}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={cn(
              "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition",
              i === activeIndex ? "border-emerald-500" : "border-gray-200"
            )}
          >
            <Image src={src} alt="" fill className="object-cover" unoptimized />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative aspect-video overflow-hidden rounded-xl border bg-gray-100">
        <Image
          src={images[activeIndex]}
          alt={`${alt} ${activeIndex + 1}`}
          fill
          className="object-contain"
          unoptimized
          priority
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70"
              aria-label="รูปก่อนหน้า"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70"
              aria-label="รูปถัดไป"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white backdrop-blur">
              <Images className="h-3.5 w-3.5" />
              {activeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((src, i) => (
            <button
              key={`${src.slice(0, 32)}-${i}`}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border-2 transition hover:opacity-90",
                i === activeIndex
                  ? "border-emerald-500 ring-2 ring-emerald-200"
                  : "border-gray-200 opacity-80"
              )}
            >
              <Image src={src} alt="" fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
