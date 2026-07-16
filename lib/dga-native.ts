export type DgaPlatform = "mobile" | "web" | "unknown";

type CzpSdk = {
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

export async function getDgaNativeContext() {
  const sdk = getDgaSdk();
  if (!sdk) return { sdk: undefined, platform: "unknown" as const, isNative: false };

  try {
    const platform = (await sdk.getPlatform?.()) ?? "unknown";
    const isCitizenPortal = await sdk.isCitizenPortal?.();
    return {
      sdk,
      platform,
      isNative: platform === "mobile" && isCitizenPortal !== false,
    };
  } catch {
    return { sdk, platform: "unknown" as const, isNative: false };
  }
}

export async function scanWithDgaNative() {
  const context = await getDgaNativeContext();
  if (!context.isNative || !context.sdk?.scanQrCode) {
    return { supported: false as const, value: null };
  }

  try {
    return { supported: true as const, value: await context.sdk.scanQrCode() };
  } catch {
    // Cancellation and native scanner failures must not fall through to a
    // second camera prompt in the WebView.
    return { supported: true as const, value: null };
  }
}

export async function saveFileWithDgaNative(url: string, fileName: string) {
  const context = await getDgaNativeContext();
  if (!context.isNative || !context.sdk?.sendFileToNativeWithUrl) return false;

  await context.sdk.sendFileToNativeWithUrl(url, fileName);
  return true;
}
