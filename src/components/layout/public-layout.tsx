import { Header } from "./header";
import { Footer } from "./footer";
import type { SelectedRole } from "@/components/landing/role-selection";
import type { UserAuthMode } from "@/components/landing/user-auth-badge";

interface PublicLayoutProps {
  children: React.ReactNode;
  role?: SelectedRole | null;
  authMode?: UserAuthMode | null;
  onChangeRole?: () => void;
  onOpenAuthModal?: () => void;
}

export function PublicLayout({
  children,
  role,
  authMode,
  onChangeRole,
  onOpenAuthModal,
}: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        role={role}
        authMode={authMode}
        onChangeRole={onChangeRole}
        onOpenAuthModal={onOpenAuthModal}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
