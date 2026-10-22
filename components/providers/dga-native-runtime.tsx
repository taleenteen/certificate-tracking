"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getDgaNativeContext,
  hasDgaNativeEntry,
  onDgaNativeEntry,
  type CzpSdk,
  type DgaPlatform,
} from "@/lib/dga-native";

export type DgaNativeRuntimeStatus =
  | "initializing"
  | "web"
  | "native-ready"
  | "native-unavailable";

export type DgaNativeRuntimeSnapshot = {
  status: DgaNativeRuntimeStatus;
  platform: DgaPlatform;
  sdk?: CzpSdk;
  isNative: boolean;
  canScanQr: boolean;
  canSaveFile: boolean;
};

export type DgaNativeRuntime = DgaNativeRuntimeSnapshot & {
  refresh: () => Promise<DgaNativeRuntimeSnapshot>;
};

const unavailableRuntime: DgaNativeRuntimeSnapshot = {
  status: "initializing",
  platform: "unknown",
  sdk: undefined,
  isNative: false,
  canScanQr: false,
  canSaveFile: false,
};

const DgaNativeRuntimeContext = createContext<DgaNativeRuntime | undefined>(
  undefined,
);

function createRuntime(
  context: Awaited<ReturnType<typeof getDgaNativeContext>>,
): DgaNativeRuntimeSnapshot {
  if (context.isNative) {
    return {
      status: "native-ready",
      platform: "mobile",
      sdk: context.sdk,
      isNative: true,
      canScanQr: Boolean(context.sdk?.scanQrCode),
      canSaveFile: Boolean(context.sdk?.sendFileToNativeWithUrl),
    };
  }

  // mToken URLs identify a Tang Rat handoff even if its native bridge has not
  // attached yet. Do not downgrade that session to browser camera/download.
  if (hasDgaNativeEntry()) {
    return {
      status: "native-unavailable",
      platform: context.platform,
      sdk: context.sdk,
      isNative: true,
      canScanQr: false,
      canSaveFile: false,
    };
  }

  return {
    status: "web",
    platform: context.platform,
    sdk: context.sdk,
    isNative: false,
    canScanQr: false,
    canSaveFile: false,
  };
}

export function DgaNativeRuntimeProvider({ children }: { children: ReactNode }) {
  const [runtime, setRuntime] = useState(unavailableRuntime);

  const refresh = useCallback(async () => {
    const next = createRuntime(await getDgaNativeContext(1_200));
    setRuntime(next);
    return next;
  }, []);

  useEffect(() => {
    const initialProbe = window.setTimeout(() => {
      void refresh();
    }, 0);
    const unsubscribe = onDgaNativeEntry(() => {
      void refresh();
    });
    return () => {
      window.clearTimeout(initialProbe);
      unsubscribe();
    };
  }, [refresh]);

  const value = useMemo<DgaNativeRuntime>(
    () => ({ ...runtime, refresh }),
    [refresh, runtime],
  );

  return (
    <DgaNativeRuntimeContext.Provider value={value}>
      {children}
    </DgaNativeRuntimeContext.Provider>
  );
}

export function useDgaNativeRuntime() {
  const runtime = useContext(DgaNativeRuntimeContext);
  if (!runtime) {
    throw new Error("useDgaNativeRuntime must be used inside DgaNativeRuntimeProvider");
  }
  return runtime;
}
