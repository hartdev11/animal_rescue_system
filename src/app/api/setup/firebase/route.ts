import { NextResponse } from "next/server";
import { getDb, isFirebaseAdminConfigured } from "@/lib/server/firebase-admin";

export async function GET() {
  const configured = isFirebaseAdminConfigured();
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "";

  let firestoreReady = false;
  if (configured) {
    try {
      await getDb().collection("cases").limit(1).get();
      firestoreReady = true;
    } catch {
      firestoreReady = false;
    }
  }

  return NextResponse.json({
    configured,
    firestoreReady,
    backend: "firebase",
    collections: ["cases", "caseTimeline", "clinics", "counters"],
    message: !configured
      ? "ยังไม่ได้ตั้งค่า Firebase Admin (.env.local)"
      : firestoreReady
        ? "เชื่อมต่อ Firestore ได้"
        : "เชื่อมต่อ Firestore ไม่ได้",
    console: {
      firestore: `https://console.firebase.google.com/project/${projectId}/firestore`,
    },
  });
}
