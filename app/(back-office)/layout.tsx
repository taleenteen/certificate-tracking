import type { ReactNode } from "react";
import { BackOfficeAuthGuard } from "@/components/auth/BackOfficeAuthGuard";

export default function BackOfficeLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <BackOfficeAuthGuard>
      <div className="min-h-screen bg-slate-100">{children}</div>
    </BackOfficeAuthGuard>
  );
}
