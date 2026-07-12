"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Navigation,
  Map,
  FileText,
  Check,
  Copy,
} from "lucide-react";

import type { LicenseDetailData } from "./license-data";
import { LicensePreview, STATUS_STAMP_MAP, STATUS_LABELS } from "./license-preview";
import { CertificatePreview } from "./certificate-preview";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppBreadcrumb } from "@/components/shared/app-breadcrumb";
import { useLicenseDocumentExport } from "@/hooks/useLicenseDocumentExports";
import { ExportBanner } from "@/components/app/licenses/export-banner";

type LicenseDetailPageViewProps = {
  data: LicenseDetailData;
  isStaff?: boolean;
};

export function LicenseDetailPageView({
  data,
  isStaff = false,
}: LicenseDetailPageViewProps) {
  const searchParams = useSearchParams();
  const [isCopied, setIsCopied] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const exportLicense = useLicenseDocumentExport(data.businessId ?? "");

  const fromParam = searchParams.get("from");
  const fromContext = getSourceContext(fromParam);
  const directionsUrl =
    data.latitude !== null &&
    data.latitude !== undefined &&
    data.longitude !== null &&
    data.longitude !== undefined
      ? `https://www.google.com/maps/dir/?api=1&destination=${data.latitude},${data.longitude}`
      : null;
  const mapHref = data.businessId
    ? `/e-map?selected=${data.businessId}`
    : "/e-map";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.licenseNumber);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1500);
    } catch {
      setIsCopied(false);
    }
  };

  const handleExport = () => {
    if (!data.businessId) return;
    exportLicense.mutate({ format: "pdf", licenseIds: [data.id] });
  };

  return (
    <main className="min-h-screen bg-[#f4f5f7] px-6 py-6 pb-24 text-slate-900 text-left">
      <div className="mx-auto max-w-[430px] space-y-6">
        {/* Breadcrumb matching mockup layout */}
        <AppBreadcrumb
          items={[
            { label: "หน้าแรก", href: "/home" },
            { label: fromContext.label, href: fromContext.href },
            { label: data.licenseName },
          ]}
          variant="dark"
        />

        {isStaff &&
          data.businessId &&
          (fromParam === "search" || fromParam === "e-map") && (
            <ExportBanner
              onExport={handleExport}
              isLoading={exportLicense.isPending}
            />
          )}
        {exportLicense.error && (
          <p className="text-sm text-destructive">
            {exportLicense.error.message}
          </p>
        )}

        {/* Centered Page Title */}
        <h2 className="text-[20px] font-bold text-slate-800 text-center tracking-wide my-4">
          {data.licenseName}
        </h2>

        {/* Card 1: Business Info Card */}
        <Card className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] text-left">
          <div className="space-y-4.5">
            {/* Title & License Subtitle */}
            <div>
              <h2 className="text-[17px] font-bold text-slate-800 leading-snug">
                {data.ownershipType === "INDIVIDUAL"
                  ? data.ownerName
                  : data.businessName}
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
                  <span className="text-slate-400">สถานที่ :</span>{" "}
                  {data.address}
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
                <a
                  href={directionsUrl ?? "#"}
                  target={directionsUrl ? "_blank" : undefined}
                  rel={directionsUrl ? "noreferrer" : undefined}
                  className="flex items-center justify-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  นำทาง
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full rounded-2xl border border-[#145b57] bg-white text-xs font-bold text-[#145b57] hover:bg-[#145b57]/5 hover:text-[#145b57] h-11 transition-colors cursor-pointer"
              >
                <Link
                  href={mapHref}
                  className="flex items-center justify-center gap-2"
                >
                  <Map className="h-4 w-4" />
                  ดูบนแผนที่
                </Link>
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
                <p className="text-xs text-slate-400 font-semibold mb-1">
                  ชื่อใบอนุญาต
                </p>
                <p className="text-sm font-bold text-slate-800 leading-snug">
                  {data.licenseName}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-semibold mb-1">
                  เลขที่ใบอนุญาต
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {data.licenseNumber}
                </p>
              </div>

              {/* <div>
                <p className="text-xs text-slate-400 font-semibold mb-1">สถานะ</p>
                <div className="pt-0.5">
                  <StatusBadge
                    status={data.status}
                    className="px-2.5 py-0.5 text-[11px] font-bold rounded-lg"
                  />
                </div>
              </div> */}

              {/* Dates Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-1">
                    วันที่ออกใบอนุญาต
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {data.issuedAt}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-1">
                    วันหมดอายุ
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {data.expiresAt}
                  </p>
                </div>
              </div>
            </div>

            {/* Divider line */}
            <div className="h-px bg-slate-100 my-4" />

            {/* Scanned certificate container */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-1.5 relative">
              <button
                type="button"
                onClick={() =>
                  (data.previewImage || data.previewUrl) && setIsPreviewOpen(true)
                }
                disabled={!data.previewImage && !data.previewUrl}
                className="block w-full cursor-zoom-in rounded-[inherit] text-left disabled:cursor-default"
                aria-label="เปิดดูรูปใบอนุญาตขนาดเต็ม"
              >
                {data.previewUrl ? (
                  <div className="relative aspect-[3/4] max-h-[400px] w-full max-w-[280px] mx-auto shadow-md rounded-md overflow-hidden bg-white p-1 my-2">
                    <CertificatePreview
                      licenseId={data.id}
                      previewUrl={data.previewUrl}
                      size="detail"
                    />
                  </div>
                ) : (
                  <LicensePreview
                    type={data.previewType}
                    size="detail"
                    previewImage={data.previewImage}
                    status={data.status}
                    className="border-0 shadow-none p-1 min-h-[300px]"
                  />
                )}
              </button>

              {/* Status Stamp Overlay for PDF preview */}
              {data.previewUrl && data.status && (
                <div className="absolute right-4 bottom-4 pointer-events-none z-10 w-[95px] h-[95px]">
                  <Image
                    src={STATUS_STAMP_MAP[data.status]}
                    alt={STATUS_LABELS[data.status] || "สถานะ"}
                    width={95}
                    height={95}
                    className="object-contain rotate-[-12deg]"
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-[calc(100vw-1.5rem)] border-0 bg-transparent p-0 shadow-none sm:max-w-3xl">
            <DialogTitle className="sr-only">{data.licenseName}</DialogTitle>
            <DialogDescription className="sr-only">
              แสดงรูปใบอนุญาตขนาดเต็ม
            </DialogDescription>
            {data.previewUrl ? (
              <div className="max-h-[86vh] overflow-auto rounded-2xl bg-white p-2 flex items-center justify-center relative">
                <div className="relative w-full max-w-[500px] aspect-[3/4]">
                  <CertificatePreview
                    licenseId={data.id}
                    previewUrl={data.previewUrl}
                    size="detail"
                  />
                  {data.status && (
                    <div className="absolute right-4 bottom-4 pointer-events-none z-10 w-[120px] h-[120px]">
                      <Image
                        src={STATUS_STAMP_MAP[data.status]}
                        alt={STATUS_LABELS[data.status] || "สถานะ"}
                        width={120}
                        height={120}
                        className="object-contain rotate-[-12deg]"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : data.previewImage ? (
              <div className="max-h-[86vh] overflow-hidden rounded-2xl bg-white p-2">
                <Image
                  src={data.previewImage}
                  alt={data.licenseName}
                  className="max-h-[82vh] w-full object-contain"
                  priority
                />
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}

function getSourceContext(source: string | null) {
  if (source === "search") {
    return { label: "ค้นหาใบอนุญาต...", href: "/license-search" };
  }
  if (source === "e-map") {
    return { label: "e-map", href: "/e-map" };
  }
  return { label: "ใบอนุญาตของฉัน", href: "/licenses" };
}
