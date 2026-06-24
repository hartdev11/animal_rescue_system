"use client";

import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  isFirebaseConfigured,
  getFirebaseAuth,
  type FirebaseUser,
} from "@/lib/firebase/auth";

export function useAuth() {
  const firebaseReady = isFirebaseConfigured();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(firebaseReady);

  useEffect(() => {
    if (!firebaseReady) return;

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [firebaseReady]);

  return { user, loading, isAuthenticated: !!user };
}
