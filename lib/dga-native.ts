export type DgaPlatform = "mobile" | "web" | "unknown";

export type CzpSdk = {
  getPlatform?: () => DgaPlatform | Promise<DgaPlatform>;
  isCitizenPortal?: () => boolean | Promise<boolean>;
  getToken?: () => string | Promise<string | undefined> | undefined;
  getAppId?: () => string | Promise<string | undefined> | undefined;
  setTitle?: (title: string, isShowBackButton?: boolean) => void;
  setBackButtonVisible?: (visible: boolean) => void;
  setCaptureButtonVisible?: (visible: boolean) => void;
  scanQrCode?: () => Promise<string>;
  sendFileToNativeWithUrl?: (url: string, fileName: string) => void | Promise<void>;
};

const nativeEntryStorageKey = "dga-native-entry";
const nativeEntryEvent = "dga-native-entry";

declare global {
  interface Window {
    czpSdk?: CzpSdk;
  }
}

export function dgaSdkSource() {
  return process.env.NEXT_PUBLIC_DGA_SDK_ENV === "production"
    ? "https://czp.dga.or.th/cportal/sdk/iu/v5/sdk.js"
    : "https://cpt-uat.dg-paas.cloud/cportal/sdk/iu/v5/sdk-uat.js";
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
    return { supported: false as const, value: null };
  }

  try {
    return { supported: true as const, value: await sdk.scanQrCode() };
  } catch {
    // Cancellation and native scanner failures must not fall through to a
    // second camera prompt in the WebView.
    return { supported: true as const, value: null };
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
