import type { ReactNode } from "react";
import { BackOfficeAuthGuard } from "@/components/auth/BackOfficeAuthGuard";
import { AppShell } from "@/components/app-shell/app-shell";

export default function AppPortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <BackOfficeAuthGuard>
      <AppShell>{children}</AppShell>
    </BackOfficeAuthGuard>
  );
}
