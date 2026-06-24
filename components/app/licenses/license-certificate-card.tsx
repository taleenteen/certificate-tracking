"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

import {
  StatusBadge,
  type StatusBadgeStatus,
} from "@/components/shared/StatusBadge";
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
      <CardContent className="p-0 space-y-3.5">
        {/* Card Header Info */}
        <div>
          <h3 className="text-[14px] font-bold text-slate-800 leading-snug">
            {item.holderName}
          </h3>
          <p className="text-[12px] font-semibold text-slate-400 mt-0.5">
            {item.licenseName}
          </p>
        </div>

        {/* Divider Line */}
        <div className="h-px bg-slate-100" />

        {/* Card Body - Split Layout */}
        <div className="grid grid-cols-[100px_1fr] gap-4 items-start">
          {/* Left: Certificate Thumbnail Preview */}
          <div className="aspect-[3/4] w-[100px] overflow-hidden rounded-xl border border-slate-200/60 bg-slate-50 relative shadow-sm">
            <Image
              src={licenseImg}
              alt="ใบอนุญาต"
              fill
              className="object-cover object-center"
              sizes="100px"
              priority
            />
          </div>

          {/* Right: Details List */}
          <div className="space-y-1.5 text-[12px] leading-relaxed text-slate-700 font-medium">
            <div className="flex items-center gap-1">
              <span>ใบอนุญาตที่</span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[#2d57bb] underline hover:text-[#1a3a82] transition-colors"
                title="คลิกเพื่อคัดลอกเลขใบอนุญาต"
              >
                <span>{item.licenseNumber}</span>
                {isCopied ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3 opacity-60" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span>สถานะ :</span>
              <StatusBadge
                status={item.status}
                className="px-2 py-0.5 text-[10px] font-bold tracking-wide rounded-md shadow-none border-0"
              />
            </div>

            <div>
              <span>วันออก : </span>
              <span className="text-slate-800">{item.issuedAt}</span>
            </div>

            <div>
              <span>วันหมดอายุ : </span>
              <span className="text-slate-800">{item.expiresAt}</span>
            </div>
          </div>
        </div>

        {/* Card Action Button */}
        <Link
          href={item.detailsHref ?? "#"}
          className="flex h-10 w-full items-center justify-center rounded-xl bg-[#145b57] text-[13px] font-bold text-white hover:bg-[#0c403d] transition-colors shadow-sm cursor-pointer"
        >
          ดูรายละเอียด
        </Link>
      </CardContent>
    </Card>
  );
}
