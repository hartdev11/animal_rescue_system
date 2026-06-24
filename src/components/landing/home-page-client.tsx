"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { PublicLayout } from "@/components/layout";
import { RoleSelection, type SelectedRole } from "./role-selection";
import type { UserAuthMode } from "./user-auth-badge";
import { UserLanding } from "./user-landing";
import { ClinicLanding } from "./clinic-landing";
import type { PlatformStatistics } from "@/types";

const UserAuthModal = dynamic(
  () => import("./user-auth-modal").then((m) => m.UserAuthModal),
  { ssr: false }
);

const ROLE_KEY = "ars-selected-role";
const AUTH_KEY = "ars-user-auth-mode";

interface HomePageClientProps {
  stats: PlatformStatistics;
}

export function HomePageClient({ stats }: HomePageClientProps) {
  const [role, setRole] = useState<SelectedRole | null>(null);
  const [authMode, setAuthMode] = useState<UserAuthMode | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const savedRole = sessionStorage.getItem(ROLE_KEY) as SelectedRole | null;
      const savedAuth = sessionStorage.getItem(AUTH_KEY) as UserAuthMode | null;

      if (savedRole === "user" || savedRole === "clinic") {
        setRole(savedRole);
      }
      if (savedAuth === "anonymous" || savedAuth === "google") {
        setAuthMode(savedAuth);
      }
      setHydrated(true);
    });
  }, []);

  const handleSelectRole = (selected: SelectedRole) => {
    setRole(selected);
    sessionStorage.setItem(ROLE_KEY, selected);

    if (selected === "user") {
      const savedAuth = sessionStorage.getItem(AUTH_KEY);
      if (!savedAuth) {
        setShowAuthModal(true);
      }
    }
  };

  const handleAuthSelect = (mode: UserAuthMode) => {
    setAuthMode(mode);
    sessionStorage.setItem(AUTH_KEY, mode);
  };

  const handleChangeRole = () => {
    setRole(null);
    setAuthMode(null);
    setShowAuthModal(false);
    sessionStorage.removeItem(ROLE_KEY);
    sessionStorage.removeItem(AUTH_KEY);
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!role) {
    return <RoleSelection onSelect={handleSelectRole} />;
  }

  return (
    <PublicLayout
      role={role}
      authMode={role === "user" ? authMode : null}
      onChangeRole={handleChangeRole}
      onOpenAuthModal={() => setShowAuthModal(true)}
    >
      {role === "user" && (
        <UserLanding
          stats={stats}
          authMode={authMode}
          onOpenAuthModal={() => setShowAuthModal(true)}
        />
      )}
      {role === "clinic" && <ClinicLanding />}

      {role === "user" && (
        <UserAuthModal
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          onSelect={handleAuthSelect}
        />
      )}
    </PublicLayout>
  );
}
