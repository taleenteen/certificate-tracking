"use client";

import { useCallback, useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  openConfirmedExternalUrl,
  parseExternalQrUrl,
} from "@/lib/external-qr-url";

/**
 * Confirmation step between scanning a QR code and leaving the app.
 *
 * `requestOpen` returns false when the payload is not a usable web link, so
 * callers keep their existing "this QR has no link" error path. Render
 * `dialog` somewhere in the component tree.
 */
export function useExternalQrLink() {
  const [pendingUrl, setPendingUrl] = useState<URL | null>(null);

  const requestOpen = useCallback((value: string) => {
    const url = parseExternalQrUrl(value);
    if (!url) return false;
    setPendingUrl(url);
    return true;
  }, []);

  const handleConfirm = useCallback(() => {
    if (pendingUrl) openConfirmedExternalUrl(pendingUrl);
    setPendingUrl(null);
  }, [pendingUrl]);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) setPendingUrl(null);
  }, []);

  const dialog = (
    <AlertDialog open={pendingUrl !== null} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-[360px] rounded-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-base font-extrabold">
            <ExternalLink className="size-4 text-[#145b57]" />
            ออกจากแอปไปยังเว็บไซต์ภายนอก
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-xs leading-relaxed text-slate-500">
              <p>QR Code นี้จะพาไปยังเว็บไซต์ด้านล่าง กรุณาตรวจสอบก่อนเปิด</p>
              <p className="rounded-xl bg-slate-50 px-3 py-2 font-bold break-all text-slate-800">
                {pendingUrl?.origin}
              </p>
              <p className="break-all text-[11px] text-slate-400">
                {pendingUrl?.toString()}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl text-xs font-bold">
            ยกเลิก
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="rounded-xl bg-[#145b57] text-xs font-bold hover:bg-[#114e4b]"
          >
            เปิดเว็บไซต์
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { requestOpen, dialog };
}
