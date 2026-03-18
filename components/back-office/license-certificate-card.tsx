"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy, FileText } from "lucide-react";

import {
  StatusBadge,
  type StatusBadgeStatus,
} from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type LicenseCardItem = {
  id: string;
  holderName: string;
  licenseName: string;
  licenseNumber: string;
  status: StatusBadgeStatus;
  issuedAt: string;
  expiresAt: string;
  previewLabel?: string;
  previewType?: "document" | "seal";
  detailsHref?: string;
};

type LicenseCertificateCardProps = {
  item: LicenseCardItem;
};

export function LicenseCertificateCard({ item }: LicenseCertificateCardProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.licenseNumber);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1500);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <Card className="rounded-xl border border-slate-200/90 py-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <CardContent className="space-y-4 p-2">
        <div className="grid grid-cols-[118px_1fr] gap-3">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex h-full min-h-[170px] items-center justify-center bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
              <LicensePreview
                type={item.previewType ?? "document"}
                label={item.previewLabel}
              />
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-6 text-slate-950">
              {item.holderName}
            </h3>
            <div className="mt-1 h-px bg-slate-200" />

            <div className="mt-2.5 space-y-1 text-[12px] leading-5 text-slate-800">
              <p className="leading-5 text-sm">{item.licenseName}</p>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-700">ใบอนุญาตที่</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-[12px] text-[#2d57bb] underline-offset-2 hover:underline"
                >
                  <span>{item.licenseNumber}</span>
                  {isCopied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-700">สถานะ :</span>
                <StatusBadge
                  status={item.status}
                  className="px-2 py-0.5 text-[10px]"
                />
              </div>

              <p className="text-xs">
                <span className="text-slate-700">วันออก : </span>
                <span>{item.issuedAt}</span>
              </p>

              <p className="text-xs">
                <span className="text-slate-700">วันหมดอายุ : </span>
                <span>{item.expiresAt}</span>
              </p>
            </div>
          </div>
        </div>

        <Button
          asChild
          type="button"
          className="h-10 w-full rounded-lg bg-[#04302F] text-sm font-medium text-white hover:bg-[#0d403d]"
        >
          <Link href={item.detailsHref ?? "#"}>ดูรายละเอียด</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function LicensePreview({
  type,
  label,
}: {
  type: "document" | "seal";
  label?: string;
}) {
  if (type === "seal") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#2d57bb] text-[#2d57bb]">
          <FileText className="h-6 w-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col justify-between bg-white p-3">
      <div className="space-y-1">
        <div className="mx-auto h-5 w-5 rounded-full bg-rose-200" />
        <div className="space-y-1">
          <div className="h-1.5 rounded bg-slate-200" />
          <div className="h-1.5 w-4/5 rounded bg-slate-200" />
          <div className="h-1.5 w-3/5 rounded bg-slate-200" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="h-1.5 rounded bg-slate-200" />
        <div className="h-1.5 w-5/6 rounded bg-slate-200" />
        <div className="h-1.5 w-2/3 rounded bg-slate-200" />
      </div>

      <div className="flex items-end justify-between">
        <div className="h-5 w-10 rounded-full border border-rose-200" />
        <div className="h-6 w-6 rounded-full border-2 border-sky-400" />
      </div>

      {label && (
        <p className="absolute bottom-2 left-3 text-[9px] text-slate-400">
          {label}
        </p>
      )}
    </div>
  );
}
