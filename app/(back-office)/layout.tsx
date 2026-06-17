import type { ReactNode } from "react";
import { BackOfficeShell } from "@/components/back-office/back-office-shell";
import { BackOfficeAuthGuard } from "@/components/auth/BackOfficeAuthGuard";

export default function BackOfficeLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <BackOfficeAuthGuard>
      <BackOfficeShell>{children}</BackOfficeShell>
    </BackOfficeAuthGuard>
  );
}
