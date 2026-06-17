"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

import {
  StatusBadge,
  type StatusBadgeStatus,
} from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import licenseImg from "@/assets/license.png";

export type LicenseCardItem = {
  id: string;
  holderName: string;
  licenseName: string;
  licenseNumber: string;
  status: StatusBadgeStatus;
  issuedAt: string;
  expiresAt: string;
  previewLabel?: string;
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
            <Image
              src={licenseImg}
              alt="ใบอนุญาต"
              className="h-full w-full object-cover"
              style={{ minHeight: 170 }}
            />
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
