"use client";

import Image from "next/image";
import { Download, Loader2 } from "lucide-react";
import exportPdfBanner from "@/assets/button/export-pdf-banner.svg";
import { Button } from "@/components/ui/button";

interface ExportBannerProps {
  children?: React.ReactNode;
  onExport?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ExportBanner({
  children,
  onExport,
  isLoading = false,
  disabled = false,
}: ExportBannerProps) {
  return (
    <div className="relative w-full h-28 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#0E473A] via-[#175C4B] to-[#297C68] shadow-sm flex items-center justify-end px-5">
      {/* Illustration positioned absolute bottom-left */}
      <div className="absolute left-0 bottom-0 h-full w-[183px] pointer-events-none select-none">
        <Image
          src={exportPdfBanner}
          alt="Export Illustration"
          className="object-contain object-left-bottom h-full w-full"
          priority
        />
      </div>

      {/* Action button on the right */}
      <div className="z-10 flex items-center">
        {children ?? (
          <Button
            type="button"
            onClick={onExport}
            disabled={disabled || isLoading}
            className="flex items-center gap-2 rounded-2xl bg-[#063428] hover:bg-[#04241C] text-white px-5 h-12 text-sm font-bold border border-emerald-950/20 shadow-md cursor-pointer transition-colors shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Download className="h-4 w-4 text-white" />
            )}
            ส่งออกใบอนุญาต
          </Button>
        )}
      </div>
    </div>
  );
}
