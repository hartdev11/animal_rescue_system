"use client";

import { useCallback, useState } from "react";

export type GeolocationPermissionState =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "manual"
  | "unsupported"
  | "insecure";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  permissionState: GeolocationPermissionState;
  isSecureContext: boolean;
}

const INSECURE_ERROR =
  "GPS ต้องใช้ HTTPS หรือ localhost — กรุณาเปิด http://localhost:3000 แทน IP address";

function isSecureContext(): boolean {
  if (typeof window === "undefined") return true;
  return (
    window.isSecureContext ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

function getInitialState(): GeolocationState {
  const secure = isSecureContext();
  if (!secure) {
    return {
      latitude: null,
      longitude: null,
      error: INSECURE_ERROR,
      permissionState: "insecure",
      isSecureContext: false,
    };
  }
  return {
    latitude: null,
    longitude: null,
    error: null,
    permissionState: "idle",
    isSecureContext: true,
  };
}

function getErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return "คุณไม่อนุญาตให้เข้าถึงตำแหน่ง — คลิกไอคอน 🔒 ข้าง URL แล้วเลือก「อนุญาตตำแหน่ง」";
    case 2:
      return "ไม่สามารถระบุตำแหน่งได้ — เปิด Location ใน Windows (Settings > Privacy > Location) หรือใช้「ระบุตำแหน่งด้วยตนเอง」ด้านล่าง";
    case 3:
      return "หมดเวลาในการขอตำแหน่ง — ลองอีกครั้งหรือใช้「ระบุตำแหน่งด้วยตนเอง」";
    default:
      return "ไม่สามารถระบุตำแหน่งได้ — ลองใช้「ระบุตำแหน่งด้วยตนเอง」";
  }
}

function getPosition(options: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>(getInitialState);

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        permissionState: "unsupported",
        error: "เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง — ใช้「ระบุตำแหน่งด้วยตนเอง」แทน",
      }));
      return;
    }

    if (!isSecureContext()) {
      setState((prev) => ({
        ...prev,
        permissionState: "insecure",
        isSecureContext: false,
        error:
          "GPS ไม่ทำงานบน http://IP-address — เปิด http://localhost:3000 หรือใช้「ระบุตำแหน่งด้วยตนเอง」",
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      permissionState: "requesting",
      error: null,
    }));

    const attempts: PositionOptions[] = [
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
      { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 },
    ];

    for (const options of attempts) {
      try {
        const position = await getPosition(options);
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          permissionState: "granted",
          isSecureContext: true,
        });
        return;
      } catch (err) {
        const geoError = err as GeolocationPositionError;
        if (options === attempts[attempts.length - 1]) {
          setState({
            latitude: null,
            longitude: null,
            error: getErrorMessage(geoError.code),
            permissionState: geoError.code === 1 ? "denied" : "idle",
            isSecureContext: true,
          });
        }
      }
    }
  }, []);

  const setManualLocation = useCallback((latitude: number, longitude: number) => {
    if (
      Number.isNaN(latitude) ||
      Number.isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return false;
    }

    setState((prev) => ({
      latitude,
      longitude,
      error: null,
      permissionState: "manual",
      isSecureContext: prev.isSecureContext,
    }));
    return true;
  }, []);

  const clearLocation = useCallback(() => {
    setState((prev) => ({
      latitude: null,
      longitude: null,
      error: null,
      permissionState: "idle",
      isSecureContext: prev.isSecureContext,
    }));
  }, []);

  const hasLocation = state.latitude !== null && state.longitude !== null;

  return {
    ...state,
    hasLocation,
    requestLocation,
    setManualLocation,
    clearLocation,
    loading: state.permissionState === "requesting",
  };
}
