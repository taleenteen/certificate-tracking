"use client";

import { useCallback, useEffect, useRef } from "react";
import { XIcon } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type QrScannerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanMock: (value: string) => void;
  id?: string;
  title?: string;
  description?: string;
};

export function QrScannerDialog({
  open,
  onOpenChange,
  onScanMock,
  id = "qr-camera-stream",
  title = "สแกนคิวอาร์โค้ดใบอนุญาต",
  description = "วางคิวอาร์โค้ดให้อยู่ภายในกรอบเพื่อดำเนินการ",
}: QrScannerDialogProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startPromiseRef = useRef<Promise<unknown> | null>(null);
  const cleanupPromiseRef = useRef<Promise<void> | null>(null);
  const isScannerActiveRef = useRef(false);
  const hasHandledScanRef = useRef(false);

  // DECISION: Clean up and stop camera scanner process to release resources
  const cleanupScanner = useCallback(async () => {
    isScannerActiveRef.current = false;

    if (cleanupPromiseRef.current) {
      return cleanupPromiseRef.current;
    }

    // HTML5-QRCode stop with promise sequence handling to prevent race conditions
    const scanner = scannerRef.current;
    scannerRef.current = null;

    if (!scanner) {
      return;
    }

    const cleanupPromise = (async () => {
      const startPromise = startPromiseRef.current;
      startPromiseRef.current = null;

      if (startPromise) {
        try {
          await startPromise;
        } catch {
          // If start rejected, camera is not streaming, but DOM may still need clearing.
        }
      }

      if (scanner.isScanning) {
        try {
          await scanner.stop();
        } catch {
          // Silent catch if already stopped
        }
      }

      try {
        scanner.clear();
      } catch {
        // Silent catch if the container has already been unmounted.
      }
    })().finally(() => {
      if (cleanupPromiseRef.current === cleanupPromise) {
        cleanupPromiseRef.current = null;
      }
    });

    cleanupPromiseRef.current = cleanupPromise;
    return cleanupPromise;
  }, []);

  const handleDialogOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        hasHandledScanRef.current = true;
        void cleanupScanner();
      }

      onOpenChange(nextOpen);
    },
    [cleanupScanner, onOpenChange]
  );

  const handleDecodedScan = useCallback(
    async (decodedText: string) => {
      if (!isScannerActiveRef.current || hasHandledScanRef.current) {
        return;
      }

      hasHandledScanRef.current = true;
      isScannerActiveRef.current = false;
      onOpenChange(false);
      onScanMock(decodedText);
      await cleanupScanner();
    },
    [cleanupScanner, onOpenChange, onScanMock]
  );

  useEffect(() => {
    if (open) {
      isScannerActiveRef.current = true;
      hasHandledScanRef.current = false;
      const timer = setTimeout(() => {
        if (!isScannerActiveRef.current) {
          return;
        }

        const scannerId = id;
        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        const startPromise = html5QrCode.start(
          { facingMode: "environment" },
          { fps: 15, aspectRatio: 1.0 },
          (decodedText) => {
            void handleDecodedScan(decodedText);
          },
          () => {
            // Ignore individual frames that do not contain a QR code.
          },
        );

        startPromiseRef.current = startPromise;

        startPromise.catch((err) => {
          console.warn("Camera scan start skipped (fallback active):", err);
        });
      }, 300);

      return () => {
        clearTimeout(timer);
        void cleanupScanner();
      };
    } else {
      void cleanupScanner();
    }
  }, [cleanupScanner, handleDecodedScan, id, onOpenChange, open]);

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent 
        showCloseButton={false}
        className="fixed top-0 md:top-[5dvh] left-1/2 -translate-x-1/2 translate-y-0 max-w-[430px] w-full h-[100dvh] md:h-[90dvh] border-0 bg-black p-0 text-white shadow-none rounded-[28px] overflow-hidden flex flex-col justify-between items-center pb-12"
      >
        {/* Real WebRTC camera video stream container wrapper */}
        <div className="absolute inset-0 z-10 w-full h-full pointer-events-none overflow-hidden">
          <div 
            id={id} 
            className="!absolute !inset-0 !w-full !h-full [&_video]:!object-cover [&_video]:!w-full [&_video]:!h-full [&_video]:!absolute [&_video]:!inset-0" 
          />
        </div>
        
        {/* Viewfinder blurred camera fallback placeholder background (only visible if camera is blocked/denied) */}
        <div className="absolute inset-0 z-0 bg-slate-950/75 flex items-center justify-center overflow-hidden pointer-events-none">
          <svg className="w-[140%] h-[140%] opacity-20 transform rotate-[15deg] blur-[2px]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="10" width="25" height="25" stroke="white" strokeWidth="4" fill="none" />
            <rect x="16" y="16" width="13" height="13" fill="white" />
            <rect x="65" y="10" width="25" height="25" stroke="white" strokeWidth="4" fill="none" />
            <rect x="71" y="16" width="13" height="13" fill="white" />
            <rect x="10" y="65" width="25" height="25" stroke="white" strokeWidth="4" fill="none" />
            <rect x="16" y="71" width="13" height="13" fill="white" />
            
            <rect x="45" y="15" width="6" height="6" fill="white" />
            <rect x="55" y="22" width="6" height="6" fill="white" />
            <rect x="42" y="42" width="10" height="10" fill="white" />
            <rect x="15" y="45" width="6" height="6" fill="white" />
            <rect x="45" y="65" width="8" height="10" fill="white" />
            <rect x="65" y="45" width="10" height="8" fill="white" />
            <rect x="75" y="65" width="8" height="8" fill="white" />
          </svg>
        </div>

        {/* Close button top right */}
        <DialogClose asChild>
          <button
            type="button"
            className="absolute top-8 right-6 z-30 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <XIcon className="size-6" strokeWidth={2.5} />
          </button>
        </DialogClose>

        {/* Top Text content */}
        <div className="relative z-30 w-full text-center pt-24 px-6 pointer-events-none">
          <DialogTitle className="text-[18px] font-bold text-white tracking-wide">
            {title}
          </DialogTitle>
          <DialogDescription className="text-[11px] text-white/60 mt-1.5 font-medium">
            {description}
          </DialogDescription>
        </div>

        {/* Viewport Center target box */}
        <div className="relative z-20 w-[260px] h-[260px] rounded-[28px] shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] pointer-events-none flex items-center justify-center">
          {/* Top-left corner */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t-[5px] border-l-[5px] border-white rounded-tl-[24px]" />
          {/* Top-right corner */}
          <div className="absolute top-0 right-0 w-10 h-10 border-t-[5px] border-r-[5px] border-white rounded-tr-[24px]" />
          {/* Bottom-left corner */}
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-[5px] border-l-[5px] border-white rounded-bl-[24px]" />
          {/* Bottom-right corner */}
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-[5px] border-r-[5px] border-white rounded-br-[24px]" />
          
          {/* Mid-edge dashes to match the mockup style */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[5px] bg-white rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[5px] bg-white rounded-full" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-8 bg-white rounded-full" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[5px] h-8 bg-white rounded-full" />
        </div>

        {/* Bottom Actions */}
        <div className="relative z-30 w-full px-6 pb-12 flex gap-3">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white text-[13px] font-bold"
            >
              ปิด
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={() => void handleDecodedScan("5621-17/965")}
            className="h-11 flex-1 rounded-2xl bg-white text-[#114e4b] hover:bg-white/90 text-[13px] font-bold"
          >
            สแกนตัวอย่าง
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
