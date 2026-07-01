"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDgaAuthorize } from "@/hooks/useAuth";

export default function DgaLoginPage() {
  const authorize = useDgaAuthorize();

  useEffect(() => {
    if (authorize.isIdle) {
      authorize.mutate(undefined, {
        onSuccess: (data) => {
          window.location.href = data.authorizeUrl;
        },
      });
    }
  }, [authorize]);

  return (
    <main className="min-h-svh bg-[#f7f8fb] px-5 py-8 flex items-center justify-center">
      <section className="w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1a2a80]/10 text-[#1a2a80]">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              เข้าสู่ระบบด้วยทางรัฐ
            </h1>
            <p className="text-sm text-slate-500">
              กำลังพาไปยังระบบ DGA Digital ID
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
          {authorize.isError ? (
            <p className="text-rose-600">
              {authorize.error instanceof Error
                ? authorize.error.message
                : "ไม่สามารถเริ่มเข้าสู่ระบบทางรัฐได้"}
            </p>
          ) : (
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-[#1a2a80]" />
              <span>กำลังสร้างคำขอเข้าสู่ระบบ...</span>
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          {authorize.isError && (
            <Button
              type="button"
              className="flex-1 rounded-xl bg-[#1a2a80] text-white hover:bg-[#151f66]"
              onClick={() =>
                authorize.mutate(undefined, {
                  onSuccess: (data) => {
                    window.location.href = data.authorizeUrl;
                  },
                })
              }
            >
              ลองใหม่
            </Button>
          )}
          <Button asChild variant="outline" className="flex-1 rounded-xl">
            <Link href="/auth/login">
              <ArrowLeft className="h-4 w-4" />
              กลับหน้าเข้าสู่ระบบ
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
