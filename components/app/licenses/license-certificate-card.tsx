"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

import { type StatusBadgeStatus } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import licenseImg from "@/assets/license.png";

import approvedIcon from "@/assets/icon/approved.svg";
import almostExpireIcon from "@/assets/icon/almost-expire.svg";
import expiredIcon from "@/assets/icon/expired.svg";
import suspendedIcon from "@/assets/icon/suspended.svg";

export type LicenseCardItem = {
  id: string;
  holderName: string;
  licenseName: string;
  licenseNumber: string;
  status: StatusBadgeStatus;
  issuedAt: string;
  expiresAt: string;
  previewLabel?: string;
  previewUrl?: string | null;
  detailsHref?: string;
};

type LicenseCertificateCardProps = {
  item: LicenseCardItem;
};

const STATUS_LABELS: Record<string, string> = {
  active: "มีผลบังคับใช้",
  expiringSoon: "ใกล้หมดอายุ",
  expired: "หมดอายุ",
  suspended: "ถูกระงับ",
};

const STATUS_STAMP_MAP = {
  active: approvedIcon,
  expiringSoon: almostExpireIcon,
  expired: expiredIcon,
  suspended: suspendedIcon,
};

function CertificatePreview({ previewUrl }: { previewUrl?: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!previewUrl || !canvasRef.current) return;

    let cancelled = false;
    let destroy: (() => void) | undefined;

    const renderFirstPage = async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();

        const loadingTask = pdfjs.getDocument({ url: previewUrl });
        const documentProxy = await loadingTask.promise;
        destroy = () => {
          loadingTask.destroy();
          void documentProxy.cleanup();
        };
        const page = await documentProxy.getPage(1);
        if (cancelled || !canvasRef.current) return;

        const viewport = page.getViewport({ scale: 1.4 });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas context unavailable");

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        await page.render({ canvas, canvasContext: context, viewport }).promise;
      } catch {
        if (!cancelled) setHasError(true);
      }
    };

    void renderFirstPage();
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [previewUrl]);

  if (!previewUrl || hasError) {
    return (
      <Image
        src={licenseImg}
        alt="ใบอนุญาต"
        fill
        className="object-cover object-center"
        sizes="(max-width: 430px) 150px, 200px"
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-label="หน้าแรกของเอกสารใบอนุญาต"
      className="h-full w-full bg-white object-contain"
    />
  );
}

export function LicenseCertificateCard({ item }: LicenseCertificateCardProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.licenseNumber);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1500);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <Card className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.015)] select-none text-left">
      <CardContent className="p-0 space-y-4">
        {/* Card Header Info */}
        <div>
          <h3 className="text-[14px] font-bold text-slate-800 leading-snug">
            {item.licenseName}
          </h3>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 mt-1">
            <span>เลขที่ใบอนุญาต</span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[#2d57bb] font-bold hover:underline transition-all text-[10px]"
              title="คลิกเพื่อคัดลอกเลขใบอนุญาต"
            >
              <span>{item.licenseNumber}</span>
              {isCopied ? (
                <Check className="h-2.5 w-2.5 text-emerald-600" />
              ) : (
                <Copy className="h-2.5 w-2.5 opacity-60" />
              )}
            </button>
          </div>
        </div>

        {/* Certificate Large Preview Area */}
        <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center relative shadow-inner p-4 border border-slate-200/50">
          <div className="relative aspect-[3/4] h-full shadow-md rounded-md overflow-hidden">
            <CertificatePreview previewUrl={item.previewUrl} />
          </div>

          {/* Status Stamp Overlay using imported SVGs */}
          <div className="absolute right-4 bottom-4 pointer-events-none z-10 w-[95px] h-[95px]">
            <Image
              src={STATUS_STAMP_MAP[item.status]}
              alt={STATUS_LABELS[item.status]}
              width={95}
              height={95}
              className="object-contain rotate-[-12deg]"
            />
          </div>
        </div>

        {/* Card Action Button */}
        <Link
          href={item.detailsHref ?? "#"}
          className="flex h-11 w-full items-center justify-center rounded-xl bg-[#145b57] text-[13px] font-bold text-white hover:bg-[#0c403d] transition-colors shadow-sm cursor-pointer"
        >
          ดูรายละเอียด
        </Link>
      </CardContent>
    </Card>
  );
}
