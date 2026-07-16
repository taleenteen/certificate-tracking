"use client";

import { useCallback, useRef, useState } from "react";
import { scanWithDgaNative } from "@/lib/dga-native";

export function useNativeQrScanner(onScan: (value: string) => void) {
  const [isBrowserScannerOpen, setIsBrowserScannerOpen] = useState(false);
  const isNativeScanPending = useRef(false);

  const startScanner = useCallback(async () => {
    if (isNativeScanPending.current) return;

    isNativeScanPending.current = true;
    try {
      const nativeScan = await scanWithDgaNative();
      if (nativeScan.supported) {
        if (nativeScan.value) onScan(nativeScan.value);
        return;
      }

      setIsBrowserScannerOpen(true);
    } finally {
      isNativeScanPending.current = false;
    }
  }, [onScan]);

  return { isBrowserScannerOpen, setIsBrowserScannerOpen, startScanner };
}
