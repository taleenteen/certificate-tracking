"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { scanWithDgaNative } from "@/lib/dga-native";

export function useNativeQrScanner(onScan: (value: string) => void) {
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
      const nativeScan = await scanWithDgaNative();
      if (nativeScan.supported) {
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
  }, [onScan]);

  return { isBrowserScannerOpen, setIsBrowserScannerOpen, startScanner };
}
