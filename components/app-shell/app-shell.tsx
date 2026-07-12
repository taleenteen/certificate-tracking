import { Suspense, type ReactNode } from "react";
import { AppNavbar } from "./app-navbar";

export function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div data-app-shell className="flex min-h-[100dvh] flex-col bg-[#d8dde0]">
      <Suspense fallback={<NavbarFallback />}>
        <AppNavbar />
      </Suspense>
      <div className="mx-auto flex w-full max-w-6xl flex-1 min-h-0 px-0 md:px-6 md:py-6">
        <div className="flex-1 min-h-0 overflow-hidden bg-[#f4f5f7] md:rounded-[32px] md:shadow-[0_30px_80px_rgba(17,78,75,0.12)]">
          {children}
        </div>
      </div>
    </div>
  );
}

function NavbarFallback() {
  return (
    <header className="sticky top-0 z-30 border-white/10 bg-[#114e4b] text-white backdrop-blur">
      <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div>
          <p className="text-xl font-semibold leading-tight">
            ยินดีต้อนรับ, คุณสมชาย
          </p>
          <p className="mt-1 text-sm text-white/70">เจ้าหน้าที่</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-white/10" />
          <div className="h-10 w-10 rounded-full bg-white/10" />
        </div>
      </div>
    </header>
  );
}
