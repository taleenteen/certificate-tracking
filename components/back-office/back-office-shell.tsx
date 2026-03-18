import type { ReactNode } from "react";
import { BackOfficeNavbar } from "./back-office-navbar";

export function BackOfficeShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#d8dde0]">
      <BackOfficeNavbar />
      <div className="mx-auto w-full max-w-6xl px-0 md:px-6 md:py-6">
        <div className="min-h-[calc(100vh-57px)] overflow-hidden bg-[#f4f5f7] md:rounded-[32px] md:shadow-[0_30px_80px_rgba(17,78,75,0.12)]">
          {children}
        </div>
      </div>
    </div>
  );
}
