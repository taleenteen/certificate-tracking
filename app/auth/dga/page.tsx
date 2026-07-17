"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { dgaAuthFlow, useDgaAuthorize, useLogin } from "@/hooks/useAuth";
import { ApiError } from "@/lib/http";
import { waitForDgaMTokenCredentials } from "@/lib/dga-native";
import { useAuthStore } from "@/stores/auth";

type MTokenDiagnostics = {
  stage: "initializing" | "missing-input" | "exchanging" | "success" | "failed";
  sdkReady: boolean;
  mTokenSource: "url" | "sdk" | "missing";
  appIdSource: "url" | "sdk" | "missing";
  appId: string;
  waitedMs?: number;
  exchangeMs?: number;
  responseStatus?: number;
  responseMessage?: string;
};

const mTokenDebugEnabled = process.env.NEXT_PUBLIC_MTOKEN_DEBUG === "true";

function redactAppId(appId: string | undefined) {
  if (!appId) return "missing";
  if (appId.length <= 4) return "present";
  return `present:...${appId.slice(-4)}`;
}

function displayAppId(appId: string | undefined) {
  return mTokenDebugEnabled ? appId ?? "missing" : redactAppId(appId);
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
  const submittedRef = useRef(false);
  const [tokenMissing, setTokenMissing] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);
  const [diagnostics, setDiagnostics] = useState<MTokenDiagnostics>({
    stage: "initializing",
    sdkReady: false,
    mTokenSource: "missing",
    appIdSource: "missing",
    appId: "missing",
  });

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const queryMToken = params.get("mToken");
      const queryAppId = params.get("appId");
      const { sdk, mToken, appId, waitedMs } =
        await waitForDgaMTokenCredentials({ queryMToken, queryAppId });
      if (cancelled) return;
      sdk?.setTitle?.("เข้าสู่ระบบ e-License", true);

      const mTokenSource = queryMToken ? "url" : mToken ? "sdk" : "missing";
      const appIdSource = queryAppId ? "url" : appId ? "sdk" : "missing";

      if (!mToken || !appId) {
        setDiagnostics({
          stage: "missing-input",
          sdkReady: Boolean(sdk),
          mTokenSource,
          appIdSource,
          appId: displayAppId(appId),
          waitedMs,
        });
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
      setDiagnostics({
        stage: "exchanging",
        sdkReady: Boolean(sdk),
        mTokenSource,
        appIdSource,
        appId: displayAppId(appId),
        waitedMs,
      });
      if (submittedRef.current) return;
      submittedRef.current = true;
      const exchangeStartedAt = performance.now();
      login.mutate(
        { type: "tang-rat", mToken, appId },
        {
          onSuccess: () => {
            setDiagnostics((current) => ({
              ...current,
              stage: "success",
              exchangeMs: Math.round(performance.now() - exchangeStartedAt),
            }));
          },
          onError: (error) => {
            setDiagnostics((current) => ({
              ...current,
              stage: "failed",
              exchangeMs: Math.round(performance.now() - exchangeStartedAt),
              responseStatus: error instanceof ApiError ? error.status : undefined,
              responseMessage: error instanceof Error ? error.message : "Unknown error",
            }));
          },
        },
      );
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [clearAuth, login, queryClient, retryNonce, setHydrated]);

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

      {mTokenDebugEnabled && (
        <section className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950">
          <p className="font-semibold">UAT mToken diagnostics</p>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <dt>Stage</dt><dd>{diagnostics.stage}</dd>
            <dt>SDK ready</dt><dd>{String(diagnostics.sdkReady)}</dd>
            <dt>mToken source</dt><dd>{diagnostics.mTokenSource}</dd>
            <dt>appId source</dt><dd>{diagnostics.appIdSource}</dd>
            <dt>appId</dt><dd>{diagnostics.appId}</dd>
            {diagnostics.waitedMs !== undefined && <><dt>SDK wait</dt><dd>{diagnostics.waitedMs} ms</dd></>}
            {diagnostics.exchangeMs !== undefined && <><dt>API exchange</dt><dd>{diagnostics.exchangeMs} ms</dd></>}
            {diagnostics.responseStatus !== undefined && <><dt>Response</dt><dd>{diagnostics.responseStatus}</dd></>}
            {diagnostics.responseMessage && <><dt>Message</dt><dd>{diagnostics.responseMessage}</dd></>}
          </dl>
        </section>
      )}

      {missingToken && (
        <Button
          type="button"
          className="mt-5 w-full rounded-xl bg-[#1a2a80] text-white hover:bg-[#151f66]"
          onClick={() => {
            setTokenMissing(false);
            setDiagnostics({
              stage: "initializing",
              sdkReady: false,
              mTokenSource: "missing",
              appIdSource: "missing",
              appId: "missing",
            });
            setRetryNonce((current) => current + 1);
          }}
        >
          ลองเชื่อมต่ออีกครั้ง
        </Button>
      )}

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
