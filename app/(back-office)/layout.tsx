import type { ReactNode } from "react";
import { BackOfficeShell } from "@/components/back-office/back-office-shell";

export default function BackOfficeLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <BackOfficeShell>{children}</BackOfficeShell>;
}
