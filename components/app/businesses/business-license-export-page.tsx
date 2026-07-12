"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Building2, ChevronDown, Download, FileDown, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

import { AppBreadcrumb } from "@/components/shared/app-breadcrumb";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLicenseDocumentExport } from "@/hooks/useLicenseDocumentExports";
import { CertificatePreview } from "@/components/app/licenses/certificate-preview";
import approvedIcon from "@/assets/icon/approved.svg";
import almostExpireIcon from "@/assets/icon/almost-expire.svg";
import expiredIcon from "@/assets/icon/expired.svg";
import suspendedIcon from "@/assets/icon/suspended.svg";
import type { BusinessDetailData } from "./business-detail-page";

type BusinessLicenseExportPageProps = {
  businessId: string;
  data: BusinessDetailData;
  from: string | null;
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

function sourceContext(source: string | null) {
  if (source === "search") return { label: "ค้นหาใบอนุญาต", href: "/license-search" };
  if (source === "e-map") return { label: "e-map", href: "/e-map" };
  return { label: "ใบอนุญาตของฉัน", href: "/licenses" };
}

export function BusinessLicenseExportPage({
  businessId,
  data,
  from,
}: BusinessLicenseExportPageProps) {
  const [isOpen, setIsOpen] = useState(true);
  const exportDocuments = useLicenseDocumentExport(businessId);
  const source = sourceContext(from);

  const exportLicenses = async (licenseIds: string[]) => {
    try {
      await exportDocuments.mutateAsync({ format: "pdf", licenseIds });
      toast.success("กำลังดาวน์โหลดเอกสารใบอนุญาต");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ไม่สามารถส่งออกใบอนุญาตได้");
    }
  };

  return (
    <main className="min-h-[calc(100vh-57px)] bg-[#F9FAFB] px-6 py-6 text-left">
      <div className="mx-auto max-w-3xl space-y-6">
        <AppBreadcrumb
          items={[
            { label: "หน้าแรก", href: "/home" },
            { label: source.label, href: source.href },
            { label: data.businessName, href: `/businesses/${businessId}?from=${from ?? "my-licenses"}` },
            { label: "ส่งออกใบอนุญาต" },
          ]}
          variant="dark"
        />

        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
          {/* Business Info Header */}
          <div>
            <h2 className="text-base font-bold text-slate-800 leading-snug">{data.businessName}</h2>
            {data.registrationId && (
              <p className="mt-1 text-xs font-semibold text-slate-400">{data.registrationId}</p>
            )}
          </div>

          {/* Details Row Info */}
          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3">
              <Building2 className="h-4.5 w-4.5 text-[#145b57] mt-0.5 shrink-0" />
              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                <span className="text-slate-400 font-medium">ประเภทธุรกิจ :</span>{" "}
                {data.businessType || "โรงงาน"}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-4.5 w-4.5 text-[#145b57] mt-0.5 shrink-0" />
              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                <span className="text-slate-400 font-medium">สถานที่ตรวจ :</span>{" "}
                {data.address}
              </p>
            </div>
          </div>

          {/* Export All Action Button */}
          <div className="pt-2">
            <Button
              type="button"
              disabled={data.documents.length === 0 || exportDocuments.isPending}
              onClick={() => void exportLicenses(data.documents.map((document) => document.id))}
              className="w-full h-12 gap-2 rounded-2xl bg-[#145b57] text-sm font-bold text-white hover:bg-[#0c403d] transition-all"
            >
              {exportDocuments.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4.5 w-4.5" />}
              ส่งออกใบอนุญาตทั้งหมด
            </Button>
          </div>

          {/* Collapsible Trigger & Content inside same card */}
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="flex justify-center border-t border-slate-100 pt-4">
              <CollapsibleTrigger className="inline-flex items-center gap-1 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors">
                <span>{isOpen ? "ซ่อนรายการ" : "แสดงรายการ"}</span>
                <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="mt-5 space-y-4">
              <h3 className="text-xs font-bold text-[#145b57]">
                ใบอนุญาต ({data.documents.length})
              </h3>
              <div className="space-y-4">
                {data.documents.map((document) => (
                  <article
                    key={document.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 leading-snug">{document.title}</h4>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mt-1">
                        <span>เลขที่ใบอนุญาต</span>
                        <span className="text-[#2d57bb] font-bold">{document.licenseNumber}</span>
                      </div>
                    </div>

                    {/* PDF Preview Area */}
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center relative shadow-inner p-4 border border-slate-200/50">
                      <div className="relative aspect-[3/4] h-full shadow-md rounded-md overflow-hidden bg-white">
                        <CertificatePreview
                          licenseId={document.previewUrl ? document.id : undefined}
                          previewUrl={document.previewUrl}
                        />
                      </div>

                      {/* Status Stamp Overlay */}
                      <div className="absolute right-4 bottom-4 pointer-events-none z-10 w-[95px] h-[95px]">
                        <Image
                          src={STATUS_STAMP_MAP[document.status]}
                          alt={STATUS_LABELS[document.status]}
                          width={95}
                          height={95}
                          className="object-contain rotate-[-12deg]"
                        />
                      </div>
                    </div>

                    {/* Export Single Document Button */}
                    <Button
                      type="button"
                      variant="outline"
                      disabled={exportDocuments.isPending}
                      onClick={() => void exportLicenses([document.id])}
                      className="w-full h-11 gap-2 rounded-xl border-[#145b57] bg-white text-xs font-bold text-[#145b57] hover:bg-[#145b57] hover:text-white transition-all"
                    >
                      <Download className="h-4 w-4" />
                      ส่งออกใบอนุญาต
                    </Button>
                  </article>
                ))}
                {data.documents.length === 0 && (
                  <p className="py-4 text-center text-sm font-semibold text-slate-400">ไม่พบใบอนุญาตสำหรับส่งออก</p>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </section>

        <Link href={`/businesses/${businessId}?from=${from ?? "my-licenses"}`} className="block text-center text-sm font-bold text-[#145b57] hover:underline pt-2">
          กลับไปหน้าสถานประกอบการ
        </Link>
      </div>
    </main>
  );
}

