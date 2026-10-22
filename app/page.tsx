"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getResumeSessionPath } from "@/lib/auth-routing";
import { getDgaEntryQueryValue } from "@/lib/dga-native";
import { useAuthStore } from "@/stores/auth";

/**
 * App entry. Login first; only officers pick a mode after login.
 * Existing sessions skip select and land on the main surface.
 */
export default function IndexPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const activePortalMode = useAuthStore((s) => s.activePortalMode);

  useEffect(() => {
    // Compatibility for legacy Tang Rat registrations that still use the site
    // root but append the handoff values to the landing URL.
    if (
      getDgaEntryQueryValue(["mToken", "mtoken", "token"]) ||
      getDgaEntryQueryValue(["appId", "app_id", "client_id"])
    ) {
      // DECISION: use a document navigation so a native WebView starts the
      // dedicated mToken route without waiting for the root route cache.
      window.location.replace(`/auth/dga${window.location.search}`);
      return;
    }

    if (!hydrated) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    router.replace(
      getResumeSessionPath(user.roles ?? [], activePortalMode),
    );
  }, [activePortalMode, hydrated, router, user]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#114e4b]">
      <p className="animate-pulse text-sm text-white/60">กำลังโหลด...</p>
    </main>
  );
}
