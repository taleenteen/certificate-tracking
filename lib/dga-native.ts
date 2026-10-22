export type DgaPlatform = "mobile" | "web" | "unknown";

export type CzpSdk = {
  getPlatform?: () => DgaPlatform | Promise<DgaPlatform>;
  isCitizenPortal?: () => boolean | Promise<boolean>;
  getToken?: () => string | Promise<string | undefined> | undefined;
  getAppId?: () => string | Promise<string | undefined> | undefined;
  getParameterByName?: (name: string, url?: string) => string | null | undefined;
  setTitle?: (title: string, isShowBackButton?: boolean) => void;
  setBackButtonVisible?: (visible: boolean) => void;
  setCaptureButtonVisible?: (visible: boolean) => void;
  scanQrCode?: () => Promise<string>;
  sendFileToNativeWithUrl?: (url: string, fileName: string) => void | Promise<void>;
};

export type DgaMTokenCredentials = {
  sdk?: CzpSdk;
  mToken?: string;
  appId?: string;
  waitedMs: number;
};

const nativeEntryStorageKey = "dga-native-entry";
const nativeEntryEvent = "dga-native-entry";

declare global {
  interface Window {
    czpSdk?: CzpSdk;
  }
}

export function dgaSdkSource() {
  return "https://czp.dga.or.th/cportal/sdk/iu/v5/sdk.js";
}

export function getDgaSdk() {
  return typeof window === "undefined" ? undefined : window.czpSdk;
}

export async function waitForDgaSdk(timeoutMs = 4_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const sdk = getDgaSdk();
    if (sdk) return sdk;
    await new Promise((resolve) => window.setTimeout(resolve, 100));
  }
  return undefined;
}

async function readDgaValue(
  read: (() => string | Promise<string | undefined> | undefined) | undefined,
  timeoutMs: number,
) {
  if (!read) return undefined;

  return new Promise<string | undefined>((resolve) => {
    const timer = window.setTimeout(() => resolve(undefined), timeoutMs);
    Promise.resolve()
      .then(read)
      .then(
        (value) => {
          window.clearTimeout(timer);
          resolve(value);
        },
        () => {
          window.clearTimeout(timer);
          resolve(undefined);
        },
      );
  });
}

export async function waitForDgaMTokenCredentials(options: {
  queryMToken?: string | null;
  queryAppId?: string | null;
  timeoutMs?: number;
}): Promise<DgaMTokenCredentials> {
  const startedAt = Date.now();
  const timeoutMs = options.timeoutMs ?? 10_000;
  let sdk = getDgaSdk();
  let mToken = options.queryMToken ?? getDgaEntryQueryValue(["mToken", "mtoken", "token"]);
  let appId = options.queryAppId ?? getDgaEntryQueryValue(["appId", "app_id", "client_id"]);

  while (Date.now() - startedAt < timeoutMs) {
    sdk ??= getDgaSdk();
    if (!mToken) {
      mToken = getDgaSdkParameter(sdk, ["mToken", "mtoken", "token"]);
    }
    if (!mToken) {
      mToken = await readDgaValue(() => sdk?.getToken?.(), 1_000);
    }
    if (!appId) {
      appId = getDgaSdkParameter(sdk, ["appId", "app_id", "client_id"]);
    }
    if (!appId) {
      appId = await readDgaValue(() => sdk?.getAppId?.(), 1_000);
    }
    if (mToken && appId) {
      return { sdk, mToken, appId, waitedMs: Date.now() - startedAt };
    }
    await new Promise((resolve) => window.setTimeout(resolve, 150));
  }

  return { sdk, mToken, appId, waitedMs: Date.now() - startedAt };
}

export function getDgaEntryQueryValue(names: readonly string[]) {
  if (typeof window === "undefined") return undefined;

  const params = new URLSearchParams(window.location.search);
  for (const name of names) {
    const value = params.get(name)?.trim();
    if (value) return value;
  }
  return undefined;
}

function getDgaSdkParameter(sdk: CzpSdk | undefined, names: readonly string[]) {
  for (const name of names) {
    try {
      const value = sdk?.getParameterByName?.(name)?.trim();
      if (value) return value;
    } catch {
      // Some SDK builds do not expose URL parameter access in every WebView.
    }
  }
  return undefined;
}

export function markDgaNativeEntry() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(nativeEntryStorageKey, "1");
  window.dispatchEvent(new Event(nativeEntryEvent));
}

export function hasDgaNativeEntry() {
  return typeof window !== "undefined" &&
    window.sessionStorage.getItem(nativeEntryStorageKey) === "1";
}

export function onDgaNativeEntry(listener: () => void) {
  window.addEventListener(nativeEntryEvent, listener);
  return () => window.removeEventListener(nativeEntryEvent, listener);
}

export async function getDgaNativeContext(timeoutMs = 800) {
  const sdk = getDgaSdk() ?? (await waitForDgaSdk(timeoutMs));
  if (!sdk) return { sdk: undefined, platform: "unknown" as const, isNative: false };

  try {
    const rawPlatform = await sdk.getPlatform?.();
    const normalizedPlatform =
      typeof rawPlatform === "string" ? rawPlatform.toLowerCase() : "unknown";
    const platform: DgaPlatform =
      normalizedPlatform === "mobile" || normalizedPlatform === "web"
        ? normalizedPlatform
        : "unknown";
    return {
      sdk,
      platform,
      // The v5 UAT bridge can report an inconsistent isCitizenPortal value
      // while still exposing the native interface. Platform is the documented
      // universal signal and must decide whether we use browser fallback.
      isNative: platform === "mobile",
    };
  } catch {
    return { sdk, platform: "unknown" as const, isNative: false };
  }
}

export async function scanWithDgaNative(sdk: CzpSdk | undefined) {
  if (!sdk?.scanQrCode) {
    return { supported: false as const, value: null, failed: false };
  }

  try {
    return {
      supported: true as const,
      value: await sdk.scanQrCode(),
      failed: false,
    };
  } catch {
    return { supported: true as const, value: null, failed: true };
  }
}

export async function saveFileWithDgaNative(
  sdk: CzpSdk | undefined,
  url: string,
  fileName: string,
) {
  if (!sdk?.sendFileToNativeWithUrl) return false;

  await sdk.sendFileToNativeWithUrl(url, fileName);
  return true;
}
