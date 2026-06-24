"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Building2,
  MapPin,
  Navigation,
  Map,
  FileText,
  Check,
  Copy,
} from "lucide-react";

import type { LicenseDetailData } from "./license-data";
import { LicensePreview } from "./license-preview";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type LicenseDetailPageViewProps = {
  data: LicenseDetailData;
  isStaff?: boolean;
  rawApiStatus?: string;
  hideVerify?: boolean;
};

export function LicenseDetailPageView({
  data,
  isStaff,
  rawApiStatus,
  hideVerify = false,
}: LicenseDetailPageViewProps) {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.licenseNumber);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1500);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f5f7] px-4 py-4 pb-24 text-slate-900">
      <div className="mx-auto max-w-[430px] space-y-4">
        {/* Back Button Link */}
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm font-bold text-slate-800 hover:opacity-80 transition-opacity cursor-pointer py-1"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
            <span>ย้อนกลับ</span>
          </button>
        </div>

        {/* Card 1: Business Info Card */}
        <Card className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] text-left">
          <div className="space-y-4.5">
            {/* Title & License Subtitle */}
            <div>
              <h2 className="text-[17px] font-bold text-slate-800 leading-snug">
                {data.businessName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-400 font-semibold select-all">
                  {data.licenseNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                  aria-label="Copy License Number"
                >
                  {isCopied ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>

            {/* Business type and Location Details */}
            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3">
                <Building2 className="h-4.5 w-4.5 text-[#145b57] mt-0.5 shrink-0" />
                <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                  <span className="text-slate-400">ประเภทธุรกิจ :</span>{" "}
                  {data.businessType}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4.5 w-4.5 text-[#145b57] mt-0.5 shrink-0" />
                <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                  <span className="text-slate-400">สถานที่ :</span> {data.address}
                </p>
              </div>
            </div>

            {/* Navigation buttons inside Card 1 */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Button
                asChild
                variant="outline"
                className="w-full rounded-2xl border border-[#145b57] bg-white text-xs font-bold text-[#145b57] hover:bg-[#145b57]/5 hover:text-[#145b57] h-11 transition-colors cursor-pointer"
              >
                <a href={`/e-map?selected=${data.id}`} className="flex items-center justify-center gap-2">
                  <Navigation className="h-4 w-4" />
                  นำทาง
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full rounded-2xl border border-[#145b57] bg-white text-xs font-bold text-[#145b57] hover:bg-[#145b57]/5 hover:text-[#145b57] h-11 transition-colors cursor-pointer"
              >
                <a href={`/e-map?selected=${data.id}`} className="flex items-center justify-center gap-2">
                  <Map className="h-4 w-4" />
                  ดูบนแผนที่
                </a>
              </Button>
            </div>
          </div>
        </Card>

        {/* Card 2: License Details Card */}
        <Card className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] text-left">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-2">
              <FileText className="h-4.5 w-4.5 text-[#145b57]" />
              <h3 className="text-[14px] font-bold text-slate-800">
                ข้อมูลใบอนุญาต
              </h3>
            </div>

            {/* Info rows */}
            <div className="space-y-3.5">
              <div>
                <p className="text-xs text-slate-400 font-semibold mb-1">ชื่อใบอนุญาต</p>
                <p className="text-sm font-bold text-slate-800 leading-snug">
                  {data.licenseName}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-semibold mb-1">เลขที่ใบอนุญาต</p>
                <p className="text-sm font-bold text-slate-800">
                  {data.licenseNumber}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-semibold mb-1">สถานะ</p>
                <div className="pt-0.5">
                  <StatusBadge
                    status={data.status}
                    className="px-2.5 py-0.5 text-[11px] font-bold rounded-lg"
                  />
                </div>
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-1">วันที่ออกใบอนุญาต</p>
                  <p className="text-sm font-bold text-slate-800">
                    {data.issuedAt}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-1">วันหมดอายุ</p>
                  <p className="text-sm font-bold text-slate-800">
                    {data.expiresAt}
                  </p>
                </div>
              </div>
            </div>

            {/* Divider line */}
            <div className="h-px bg-slate-100 my-4" />

            {/* Scanned certificate container */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 p-1.5 bg-white">
              <LicensePreview
                type={data.previewType}
                size="detail"
                previewImage={data.previewImage}
                className="border-0 shadow-none p-1 min-h-[300px]"
              />
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
