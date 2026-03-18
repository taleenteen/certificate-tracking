"use client";

import { QrCode, ScanLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type QrScannerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanMock: (value: string) => void;
};

export function QrScannerDialog({
  open,
  onOpenChange,
  onScanMock,
}: QrScannerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-[28px] border-0 bg-[#0b2f2e] p-0 text-white shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div className="rounded-[28px] bg-[radial-gradient(circle_at_top,#145b57_0%,#0b2f2e_65%)] p-5">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg font-semibold text-white">
              สแกน QR Code
            </DialogTitle>
            <DialogDescription className="text-sm text-white/70">
              ใช้กล้องสแกน QR เพื่อค้นหาเลขใบอนุญาตอย่างรวดเร็ว
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="relative overflow-hidden rounded-[22px] border border-white/15 bg-[linear-gradient(180deg,#103b39_0%,#0a2524_100%)] p-6">
              <div className="mx-auto flex aspect-square max-w-[220px] items-center justify-center rounded-[28px] border-2 border-white/70">
                <div className="flex h-full w-full items-center justify-center">
                  <QrCode className="h-20 w-20 text-white/80" />
                </div>

                <div className="pointer-events-none absolute inset-x-12 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-emerald-300 shadow-[0_0_20px_rgba(110,231,183,0.8)] animate-pulse" />
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-white/65">
                <ScanLine className="h-4 w-4" />
                <span>จัด QR ให้อยู่ในกรอบเพื่อสแกน</span>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-5 flex-row gap-3 sm:justify-stretch">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 flex-1 rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              ปิด
            </Button>
            <Button
              type="button"
              onClick={() => onScanMock("5621-17/965")}
              className="h-11 flex-1 rounded-2xl bg-white text-[#114e4b] hover:bg-white/90"
            >
              สแกนตัวอย่าง
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
