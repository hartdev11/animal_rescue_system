"use client";

import { useCallback, useState } from "react";

/** ขอตำแหน่งจริงจากเบราว์เซอร์ (Geolocation API) */
export function useGeolocation() {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("เบราว์เซอร์ไม่รองรับ GPS — ใช้ระบุตำแหน่งด้วยตนเองแทน");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLoading(false);
      },
      (err) => {
        const msg =
          err.code === 1
            ? "กรุณากดอนุญาตการเข้าถึงตำแหน่ง"
            : err.code === 2
              ? "หาตำแหน่งไม่ได้ — เปิด Location ในเครื่องหรือระบุเอง"
              : err.code === 3
                ? "หมดเวลา — ลองอีกครั้ง"
                : "หาตำแหน่งไม่ได้";
        setError(msg);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  const setManualLocation = useCallback((lat: number, lng: number) => {
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
    setLatitude(lat);
    setLongitude(lng);
    setError(null);
    return true;
  }, []);

  const clearLocation = useCallback(() => {
    setLatitude(null);
    setLongitude(null);
    setError(null);
  }, []);

  return {
    latitude,
    longitude,
    error,
    loading,
    hasLocation: latitude !== null && longitude !== null,
    requestLocation,
    setManualLocation,
    clearLocation,
  };
}
