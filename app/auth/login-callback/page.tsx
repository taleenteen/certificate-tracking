"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDgaCallback } from "@/hooks/useAuth";

function LoginCallbackContent() {
  const searchParams = useSearchParams();
  const callback = useDgaCallback();
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  useEffect(() => {
    if (code && state && callback.isIdle) {
      callback.mutate({ code, state });
    }
  }, [callback, code, state]);

  const missingParams = !code || !state;

  return (
    <section className="w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1e7d55]/10 text-[#1e7d55]">
          {callback.isSuccess ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : missingParams || callback.isError ? (
            <AlertCircle className="h-6 w-6 text-rose-600" />
          ) : (
            <Loader2 className="h-6 w-6 animate-spin" />
          )}
        </span>
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            ตรวจสอบข้อมูลจากทางรัฐ
          </h1>
          <p className="text-sm text-slate-500">
            ระบบกำลังยืนยันตัวตนและสร้าง session
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
        {missingParams ? (
          <p className="text-rose-600">
            ไม่พบ code หรือ state จากทางรัฐ กรุณาเริ่มเข้าสู่ระบบใหม่
          </p>
        ) : callback.isError ? (
          <p className="text-rose-600">
            {callback.error instanceof Error
              ? callback.error.message
              : "ไม่สามารถยืนยันตัวตนผ่านทางรัฐได้"}
          </p>
        ) : callback.isSuccess ? (
          <p className="text-[#1e7d55]">ยืนยันสำเร็จ กำลังพาเข้าสู่ระบบ...</p>
        ) : (
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-[#1a2a80]" />
            <span>กำลังแลกเปลี่ยน code และตรวจสอบข้อมูล...</span>
          </div>
        )}
      </div>

      {(missingParams || callback.isError) && (
        <div className="mt-5 flex gap-3">
          <Button asChild className="flex-1 rounded-xl bg-[#1a2a80] text-white hover:bg-[#151f66]">
            <Link href="/auth/dga">เข้าสู่ระบบทางรัฐอีกครั้ง</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 rounded-xl">
            <Link href="/auth/login">กลับหน้าเข้าสู่ระบบ</Link>
          </Button>
        </div>
      )}
    </section>
  );
}

export default function LoginCallbackPage() {
  return (
    <main className="min-h-svh bg-[#f7f8fb] px-5 py-8 flex items-center justify-center">
      <Suspense
        fallback={
          <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-[#1a2a80]" />
            กำลังโหลดข้อมูล...
          </div>
        }
      >
        <LoginCallbackContent />
      </Suspense>
    </main>
  );
}
