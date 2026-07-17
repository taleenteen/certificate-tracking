"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { scanWithDgaNative } from "@/lib/dga-native";
import { useDgaNativeRuntime } from "@/components/providers/dga-native-runtime";

export function useNativeQrScanner(onScan: (value: string) => void) {
  const nativeRuntime = useDgaNativeRuntime();
  const [isBrowserScannerOpen, setIsBrowserScannerOpen] = useState(false);
  const isNativeScanPending = useRef(false);
  const nativeScanRequestId = useRef(0);

  useEffect(() => {
    const releaseAfterNativeScannerCloses = () => {
      if (document.visibilityState === "hidden") return;
      // Some Tang Rat versions dismiss the scanner without settling scanQrCode().
      // Returning to the WebView is the only reliable cancellation signal.
      isNativeScanPending.current = false;
    };

    document.addEventListener("visibilitychange", releaseAfterNativeScannerCloses);
    window.addEventListener("focus", releaseAfterNativeScannerCloses);
    return () => {
      document.removeEventListener("visibilitychange", releaseAfterNativeScannerCloses);
      window.removeEventListener("focus", releaseAfterNativeScannerCloses);
    };
  }, []);

  const startScanner = useCallback(async () => {
    if (isNativeScanPending.current) return;

    isNativeScanPending.current = true;
    const requestId = ++nativeScanRequestId.current;
    try {
      const runtime =
        nativeRuntime.status === "web"
          ? nativeRuntime
          : await nativeRuntime.refresh();

      if (runtime.status === "native-unavailable") {
        toast.error(
          "ไม่สามารถเชื่อมต่อกล้องของแอปทางรัฐได้ กรุณาปิดและเปิด e-Service ใหม่",
        );
        return;
      }

      if (runtime.isNative) {
        if (!runtime.canScanQr) {
          toast.error("แอปทางรัฐเวอร์ชันนี้ไม่รองรับการสแกน QR Code");
          return;
        }

        const nativeScan = await scanWithDgaNative(runtime.sdk);
        if (!nativeScan.supported) {
          toast.error("ไม่สามารถเปิดกล้องของแอปทางรัฐได้ กรุณาลองใหม่");
          return;
        }
        if (nativeScan.value && requestId === nativeScanRequestId.current) {
          onScan(nativeScan.value);
        }
        return;
      }

      setIsBrowserScannerOpen(true);
    } finally {
      if (requestId === nativeScanRequestId.current) {
        isNativeScanPending.current = false;
      }
    }
  }, [nativeRuntime, onScan]);

  return { isBrowserScannerOpen, setIsBrowserScannerOpen, startScanner };
}
