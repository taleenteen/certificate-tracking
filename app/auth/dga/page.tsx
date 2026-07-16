"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { dgaAuthFlow, useDgaAuthorize, useLogin } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/auth";

type CzpSdk = {
  getToken?: () => string | Promise<string | undefined> | undefined;
  getAppId?: () => string | Promise<string | undefined> | undefined;
  setTitle?: (title: string, isShowBackButton?: boolean) => void;
};

declare global {
  interface Window {
    czpSdk?: CzpSdk;
  }
}

function AuthPanel({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#f7f8fb] px-5 py-8">
      <section className="w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
        {children}
      </section>
    </main>
  );
}

function MTokenLandingPage() {
  const login = useLogin();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clear);
  const setHydrated = useAuthStore((state) => state.setHydrated);
  const startedRef = useRef(false);
  const [tokenMissing, setTokenMissing] = useState(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const waitForSdk = async () => {
      for (let attempt = 0; attempt < 40; attempt += 1) {
        if (window.czpSdk) return window.czpSdk;
        await new Promise((resolve) => window.setTimeout(resolve, 100));
      }
      return undefined;
    };

    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const queryMToken = params.get("mToken");
      const queryAppId = params.get("appId");
      const sdk =
        window.czpSdk ??
        (!queryMToken || !queryAppId ? await waitForSdk() : undefined);
      sdk?.setTitle?.("เข้าสู่ระบบ e-License", true);

      const mToken =
        queryMToken ??
        (await Promise.resolve(sdk?.getToken?.()));
      const appId =
        queryAppId ??
        (await Promise.resolve(sdk?.getAppId?.()));

      if (!mToken || !appId) {
        setTokenMissing(true);
        return;
      }

      // A fresh native handoff must never render or reuse data cached for the
      // previous WebView account. Remove the short-lived query values only
      // after the SDK has read them, then exchange the values held in memory.
      queryClient.clear();
      clearAuth();
      setHydrated(false);
      window.history.replaceState(null, "", window.location.pathname + window.location.hash);
      login.mutate({ type: "tang-rat", mToken, appId });
    };

    void run();
  }, [clearAuth, login, queryClient, setHydrated]);

  const missingToken = tokenMissing && !login.isPending && !login.isSuccess && !login.isError;

  return (
    <AuthPanel>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1a2a80]/10 text-[#1a2a80]">
          {login.isError || missingToken ? (
            <AlertCircle className="h-6 w-6 text-rose-600" />
          ) : (
            <ShieldCheck className="h-6 w-6" />
          )}
        </span>
        <div>
          <h1 className="text-lg font-bold text-slate-900">เข้าสู่ระบบด้วยทางรัฐ</h1>
          <p className="text-sm text-slate-500">กำลังยืนยันตัวตนจากแอปทางรัฐ</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
        {login.isError ? (
          <p className="text-rose-600">
            {login.error instanceof Error
              ? login.error.message
              : "ไม่สามารถยืนยันตัวตนผ่านทางรัฐได้"}
          </p>
        ) : missingToken ? (
          <p className="text-rose-600">กรุณาเปิดหน้านี้จากแอปพลิเคชันทางรัฐ</p>
        ) : (
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-[#1a2a80]" />
            <span>กำลังเชื่อมต่อข้อมูลกับทางรัฐ...</span>
          </div>
        )}
      </div>

      <Button asChild variant="outline" className="mt-5 w-full rounded-xl">
        <Link href="/auth/login">
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าเข้าสู่ระบบ
        </Link>
      </Button>
    </AuthPanel>
  );
}

function OidcLoginPage() {
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
    <AuthPanel>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1a2a80]/10 text-[#1a2a80]">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-lg font-bold text-slate-900">เข้าสู่ระบบด้วยทางรัฐ</h1>
          <p className="text-sm text-slate-500">กำลังพาไปยังระบบ DGA Digital ID</p>
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
    </AuthPanel>
  );
}

export default function DgaLoginPage() {
  return dgaAuthFlow() === "oidc" ? <OidcLoginPage /> : <MTokenLandingPage />;
}
