"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import {
  BriefcaseBusiness,
  Check,
  ClipboardCheck,
  Copy,
  FileBadge2,
  History,
  Mail,
  MapPinned,
  Phone,
  UserRound,
} from "lucide-react";

import type { LicenseDetailData } from "./license-data";
import { LicensePreview } from "./license-preview";
import { NavigationFooter } from "@/components/shared/NavigationFooter";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from "@/components/ui/timeline";

type LicenseDetailPageViewProps = {
  data: LicenseDetailData;
};

export function LicenseDetailPageView({
  data,
}: LicenseDetailPageViewProps) {
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
    <>
      <main className="min-h-[calc(100vh-57px)] bg-[#F9FAFB] px-4 py-4 pb-28">
        <div className="mx-auto max-w-md space-y-4">
          <Card className="overflow-hidden rounded-[22px] border-0 bg-[#1b6863] py-0 text-white shadow-[0_18px_40px_rgba(17,78,75,0.24)]">
            <CardContent className="flex items-end justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-xs text-white/75">เลขที่ใบอนุญาต</p>
                <p className="mt-1 truncate text-base font-semibold">
                  {data.licenseNumber}
                </p>
              </div>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={handleCopy}
                className="h-10 w-10 rounded-xl bg-white/10 text-white hover:bg-white/15 hover:text-white"
              >
                {isCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </CardContent>
          </Card>

          <SectionCard
            icon={<BriefcaseBusiness className="h-4 w-4 text-slate-600" />}
            title="ข้อมูลสถานประกอบการ"
            className="rounded-[22px] border-slate-200/80 py-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
            headerClassName="px-4 pt-4 pb-1"
            titleClassName="text-sm font-semibold text-slate-900"
            contentClassName="space-y-4 px-4 pb-4 pt-2"
          >
            <DetailField label="ชื่อสถานประกอบการ" value={data.businessName} />
            <DetailField label="ประเภทกิจการ" value={data.businessType} />
            <DetailField label="ที่ตั้ง" value={data.address} />
          </SectionCard>

          <SectionCard
            icon={<FileBadge2 className="h-4 w-4 text-slate-600" />}
            title="ข้อมูลใบอนุญาต"
            className="rounded-[22px] border-slate-200/80 py-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
            headerClassName="px-4 pt-4 pb-1"
            titleClassName="text-sm font-semibold text-slate-900"
            contentClassName="space-y-4 px-4 pb-4 pt-2"
          >
            <DetailField label="ชื่อใบอนุญาต" value={data.licenseName} />
            <DetailField label="วัตถุประสงค์" value={data.purpose} />

            <div className="rounded-2xl bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">สถานะ:</span>
                <StatusBadge
                  status={data.status}
                  className="px-2 py-0.5 text-[10px]"
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <DetailField label="วันเริ่มต้น" value={data.issuedAt} dense />
                <DetailField label="วันหมดอายุ" value={data.expiresAt} dense />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] p-3">
              <LicensePreview type={data.previewType} size="detail" />
            </div>
          </SectionCard>

          <SectionCard
            icon={<UserRound className="h-4 w-4 text-slate-600" />}
            title="ข้อมูลเจ้าของกิจการ"
            className="rounded-[22px] border-slate-200/80 py-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
            headerClassName="px-4 pt-4 pb-1"
            titleClassName="text-sm font-semibold text-slate-900"
            contentClassName="space-y-4 px-4 pb-4 pt-2"
          >
            <DetailField label="ผู้ถือใบอนุญาต" value={data.ownerName} />

            <ContactLink
              href={`tel:${data.phoneNumber}`}
              icon={<Phone className="h-4 w-4 text-slate-500" />}
              value={data.phoneNumber}
            />

            <ContactLink
              href={`mailto:${data.email}`}
              icon={<Mail className="h-4 w-4 text-slate-500" />}
              value={data.email}
            />
          </SectionCard>

          <SectionCard
            icon={<History className="h-4 w-4 text-slate-600" />}
            title="ประวัติการตรวจสอบ"
            className="rounded-[22px] border-slate-200/80 py-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
            headerClassName="px-4 pt-4 pb-1"
            titleClassName="text-sm font-semibold text-slate-900"
            contentClassName="px-4 pb-2 pt-3"
          >
            <Timeline>
              {data.timeline.map((item, index) => (
                <TimelineItem key={item.id}>
                  <TimelineSeparator className="top-0">
                    <TimelineDot
                      className={
                        item.current ? "bg-[#114e4b]" : "bg-[#114e4b]/45"
                      }
                    />
                    {index < data.timeline.length - 1 ? (
                      <TimelineConnector className="bg-slate-200" />
                    ) : null}
                  </TimelineSeparator>

                  <TimelineContent className="pb-4">
                    <p className="text-[11px] text-slate-500">{item.date}</p>
                    <div className="mt-2 rounded-2xl bg-slate-50 p-3">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </SectionCard>
        </div>
      </main>

      <footer className="sticky bottom-0">
        <NavigationFooter
          actions={[
            {
              label: "นำทาง",
              href: "/map",
              icon: <MapPinned className="h-4 w-4" />,
              variant: "secondary",
            },
            {
              label: "ตรวจสอบ",
              href: `/my-licenses/${data.slug}/inspection`,
              icon: <ClipboardCheck className="h-4 w-4" />,
              variant: "primary",
            },
          ]}
        />
      </footer>
    </>
  );
}

function DetailField({
  label,
  value,
  dense = false,
}: {
  label: string;
  value: string;
  dense?: boolean;
}) {
  return (
    <div className={dense ? "space-y-1" : "space-y-1.5"}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={dense ? "text-sm font-medium text-slate-900" : "text-sm text-slate-900"}>
        {value}
      </p>
    </div>
  );
}

function ContactLink({
  href,
  icon,
  value,
}: {
  href: string;
  icon: ReactNode;
  value: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 text-sm text-slate-900 transition-colors hover:text-[#114e4b]"
    >
      {icon}
      <span>{value}</span>
    </a>
  );
}
