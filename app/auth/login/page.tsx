'use client';

import { LoginForm } from "@/components/auth/LoginForm";
import { getResumeSessionPath } from "@/lib/auth-routing";
import { useAuthStore } from "@/stores/auth";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import heroRight from "@/assets/hero/hero-right.png";

const FEATURES = [
  { icon: "📋", label: "ติดตามสถานะใบอนุญาตแบบเรียลไทม์" },
  { icon: "🔔", label: "แจ้งเตือนอัตโนมัติเมื่อใกล้หมดอายุ" },
  { icon: "🏢", label: "รองรับหลายหน่วยงานในระบบเดียว" },
];

export default function LoginPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  // Only resume an *existing* session once hydration settles. Do not re-run when
  // `user` appears after a fresh login — that would steal /role-select for officers
  // (getResumeSessionPath → /home) from useLogin's routeAfterLogin.
  const didResumeRef = useRef(false);

  useEffect(() => {
    // Preserve a legacy Tang Rat handoff if the provider still opens the old
    // login route with query values. Native SDK-only handoffs must use /auth/dga.
    if (window.location.search.includes("mToken=") || window.location.search.includes("appId=")) {
      router.replace(`/auth/dga${window.location.search}`);
      return;
    }

    if (!hydrated || didResumeRef.current) return;
    didResumeRef.current = true;

    const { user: sessionUser, activePortalMode } = useAuthStore.getState();
    if (!sessionUser) return;

    router.replace(
      getResumeSessionPath(sessionUser.roles ?? [], activePortalMode),
    );
  }, [hydrated, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#f7f8fb]">
        <p className="animate-pulse text-sm text-slate-400">กำลังโหลด...</p>
      </div>
    );
  }

  // Existing session resume or post-login: brief loading while navigation runs.
  if (user) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#f7f8fb]">
        <p className="animate-pulse text-sm text-slate-400">กำลังเข้าสู่ระบบ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-svh grid lg:grid-cols-[480px_1fr]">
      {/* ── Left: Brand Panel ── */}
      <aside className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#094d34] via-[#116645] to-[#1e7d55] px-12 py-10 text-white overflow-hidden relative">
        {/* Background decoration rings */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-[400px] w-[400px] rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-[340px] w-[340px] rounded-full bg-white/5" />
        <div className="pointer-events-none absolute top-1/2 -right-10 h-[200px] w-[200px] rounded-full bg-white/5" />

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold leading-snug">
              ระบบบริหารจัดการ<br />ใบอนุญาตธุรกิจ
            </h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              ติดตาม ตรวจสอบ และจัดการใบอนุญาตธุรกิจทุกประเภท<br />จากทุกหน่วยงานในระบบเดียว
            </p>
          </div>

          <Image
            src={heroRight}
            alt="License management illustration"
            height={220}
            className="object-contain drop-shadow-xl"
          />

          <ul className="space-y-3">
            {FEATURES.map(({ icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15 text-base">
                  {icon}
                </span>
                <span className="text-white/90">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-[11px] text-white/40">
          © 2026 Certificate Tracking System
        </p>
      </aside>

      {/* ── Right: Form Panel ── */}
      <main className="flex flex-col items-center justify-center bg-[#f7f8fb] px-5 py-10 sm:px-8">
        <div className="w-full max-w-[400px] space-y-7">
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold text-slate-900">เข้าสู่ระบบ</h1>
              <p className="text-sm text-slate-500">
                ยืนยันตัวตนเพื่อเข้าใช้งานระบบ
              </p>
            </div>
          </div>

          {/* Form card */}
          <div className="rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.07)] border border-slate-200/80 overflow-hidden">
            <LoginForm />
          </div>

          <p className="text-center text-[11px] text-slate-400">
            © 2026 Certificate Tracking System · All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}
