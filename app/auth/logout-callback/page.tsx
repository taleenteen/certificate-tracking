"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";

export default function LogoutCallbackPage() {
  const clear = useAuthStore((state) => state.clear);

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <main className="min-h-svh bg-[#f7f8fb] px-5 py-8 flex items-center justify-center">
      <section className="w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1e7d55]/10 text-[#1e7d55]">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              ออกจากระบบทางรัฐสำเร็จ
            </h1>
            <p className="text-sm text-slate-500">
              หากต้องการใช้งานต่อ กรุณาเข้าสู่ระบบใหม่
            </p>
          </div>
        </div>

        <Button
          asChild
          className="mt-6 w-full rounded-xl bg-[#1a2a80] text-white hover:bg-[#151f66]"
        >
          <Link href="/auth/login">กลับหน้าเข้าสู่ระบบ</Link>
        </Button>
      </section>
    </main>
  );
}
