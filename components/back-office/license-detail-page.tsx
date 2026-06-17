"use client";

import type { ReactNode } from "react";
import { useRef, useState } from "react";
import {
  BriefcaseBusiness,
  Check,
  ClipboardCheck,
  Copy,
  FileBadge2,
  History,
  Mail,
  MapPinned,
  Paperclip,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import type { LicenseDetailData } from "./license-data";
import { LicensePreview } from "./license-preview";
import { NavigationFooter } from "@/components/shared/NavigationFooter";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from "@/components/ui/timeline";
import {
  useUpdateLicenseStatus,
  type LicenseStatusUpdate,
} from "@/hooks/useLicenses";

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
  const [isCopied, setIsCopied] = useState(false);
  const [statusValue, setStatusValue] = useState<LicenseStatusUpdate>(
    (rawApiStatus as LicenseStatusUpdate) ?? "ACTIVE",
  );
  const [note, setNote] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const updateStatus = useUpdateLicenseStatus(data.id);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.licenseNumber);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1500);
    } catch {
      setIsCopied(false);
    }
  };

  const handleSaveStatus = () => {
    updateStatus.mutate(
      { status: statusValue, note: note.trim() || undefined },
      {
        onSuccess: () => {
          toast.success("อัปเดตสถานะสำเร็จ");
          setNote("");
        },
        onError: (err: unknown) => {
          const msg =
            err instanceof Error ? err.message : "ไม่สามารถอัปเดตสถานะได้";
          toast.error(msg);
        },
      },
    );
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
                  {data.licenseNumber?.trim() || "—"}
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
              <LicensePreview type={data.previewType} size="detail" previewImage={data.previewImage} />
            </div>
          </SectionCard>

          {/* {isStaff && (
            <SectionCard
              icon={<ShieldCheck className="h-4 w-4 text-teal-600" />}
              title="อัปเดตสถานะ (เจ้าหน้าที่)"
              className="rounded-[22px] border-teal-100 bg-teal-50/40 py-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
              headerClassName="px-4 pt-4 pb-1"
              titleClassName="text-sm font-semibold text-teal-800"
              contentClassName="space-y-4 px-4 pb-4 pt-2"
            >
              <div className="space-y-1">
                <p className="text-xs text-slate-500">สถานะใบอนุญาต</p>
                <Select value={statusValue} onValueChange={(v) => setStatusValue(v as LicenseStatusUpdate)}>
                  <SelectTrigger className="w-full border-slate-200 bg-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">มีผล (ACTIVE)</SelectItem>
                    <SelectItem value="PENDING">รออนุมัติ (PENDING)</SelectItem>
                    <SelectItem value="SUSPENDED">ระงับ (SUSPENDED)</SelectItem>
                    <SelectItem value="EXPIRED">หมดอายุ (EXPIRED)</SelectItem>
                    <SelectItem value="REVOKED">ถูกเพิกถอน (REVOKED)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500">หมายเหตุ (ไม่บังคับ)</p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="ระบุเหตุผลหรือรายละเอียดเพิ่มเติม..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-200 resize-none"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-500">
                  เอกสารแนบ{" "}
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                    MOCK
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <Paperclip className="h-4 w-4 text-slate-400" />
                  เลือกไฟล์ (JPEG / PNG / PDF ≤ 10 MB)
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const names = Array.from(e.target.files ?? []).map((f) => f.name);
                    setSelectedFiles((prev) => [...prev, ...names]);
                  }}
                />
                {selectedFiles.length > 0 && (
                  <ul className="space-y-1">
                    {selectedFiles.map((name, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                        <Paperclip className="h-3 w-3 text-slate-400 shrink-0" />
                        {name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Button
                type="button"
                onClick={handleSaveStatus}
                disabled={updateStatus.isPending}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white h-10 text-sm font-semibold rounded-xl"
              >
                {updateStatus.isPending ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </SectionCard>
          )} */}

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
              href: "/e-map",
              icon: <MapPinned className="h-4 w-4" />,
              variant: "secondary",
            },
            ...(!hideVerify && isStaff
              ? [
                  {
                    label: "ตรวจสอบ",
                    href: `/my-licenses/${data.slug}/inspection`,
                    icon: <ClipboardCheck className="h-4 w-4" />,
                    variant: "primary" as const,
                  },
                ]
              : []),
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
      <p
        className={
          dense
            ? "text-sm font-medium text-slate-900"
            : "text-sm text-slate-900"
        }
      >
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
