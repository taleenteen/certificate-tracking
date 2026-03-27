"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, FolderOpen, ImagePlus, NotebookPen, X } from "lucide-react";

import type { LicenseDetailData } from "./license-data";
import { NavigationFooter } from "@/components/shared/NavigationFooter";
import { SectionCard } from "@/components/shared/SectionCard";
import { Textarea } from "@/components/ui/textarea";

type AttachmentItem = {
  id: string;
  file: File;
  previewUrl: string | null;
};

type LicenseInspectionPageViewProps = {
  data: LicenseDetailData;
};

const MAX_ATTACHMENTS = 8;

export function LicenseInspectionPageView({
  data,
}: LicenseInspectionPageViewProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const attachmentsRef = useRef<AttachmentItem[]>([]);
  const router = useRouter();
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [note, setNote] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, []);

  const slots = useMemo(
    () =>
      Array.from({ length: Math.max(MAX_ATTACHMENTS - attachments.length, 0) }),
    [attachments.length],
  );

  const handleSelectFiles = (files: FileList | null) => {
    if (!files) return;

    const remaining = Math.max(MAX_ATTACHMENTS - attachments.length, 0);
    if (remaining === 0) {
      return;
    }

    const selectedFiles = Array.from(files).slice(0, remaining);
    const nextItems = selectedFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      previewUrl: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    }));

    setAttachments((current) => [...current, ...nextItems]);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((current) => {
      const target = current.find((item) => item.id === id);

      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return current.filter((item) => item.id !== id);
    });
  };

  const handleSave = () => {
    setIsSaved(true);
    window.setTimeout(() => setIsSaved(false), 1500);
  };

  return (
    <>
      <main className="min-h-[calc(100vh-57px)] bg-[#F9FAFB] px-4 py-4 pb-28">
        <div className="mx-auto max-w-md space-y-4">
          <SectionCard
            icon={<FolderOpen className="h-4 w-4 text-slate-600" />}
            title="ข้อมูลทั่วไป"
            className="rounded-[22px] border-slate-200/80 py-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
            headerClassName="px-4 pt-4 pb-1"
            titleClassName="text-sm font-semibold text-slate-900"
            contentClassName="space-y-3 px-4 pb-4 pt-2"
          >
            <InfoField label="ชื่อสถานประกอบการ" value={data.businessName} />
            <InfoField label="ชื่อใบอนุญาต" value={data.licenseName} />
            <InfoField label="เลขที่ใบอนุญาต" value={data.licenseNumber} />
            <InfoField label="วันที่" value={data.inspectionDate} />
            <InfoField label="ผู้ตรวจสอบ" value={data.inspectorName} />
          </SectionCard>

          <SectionCard
            icon={<ImagePlus className="h-4 w-4 text-slate-600" />}
            title="รูปภาพประกอบ"
            headerAction={`${attachments.length}/${MAX_ATTACHMENTS}`}
            className="rounded-[22px] border-slate-200/80 py-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
            headerClassName="px-4 pt-4 pb-1"
            titleClassName="text-sm font-semibold text-slate-900"
            contentClassName="space-y-4 px-4 pb-4 pt-2"
          >
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(event) => handleSelectFiles(event.target.files)}
            />

            <label
              htmlFor={inputId}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition-colors hover:border-[#114e4b]/40 hover:bg-[#114e4b]/[0.03]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">
                <Camera className="h-4 w-4" />
              </div>
              <p className="text-xs text-slate-500">ถ่ายภาพประกอบการตรวจสอบ</p>
            </label>

            <div className="grid grid-cols-4 gap-2.5">
              {attachments.map((item) => (
                <AttachmentPreview
                  key={item.id}
                  item={item}
                  onRemove={() => handleRemoveAttachment(item.id)}
                />
              ))}

              {slots.map((_, index) => (
                <div
                  key={`empty-slot-${index}`}
                  className="aspect-square rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            icon={<NotebookPen className="h-4 w-4 text-slate-600" />}
            title="หมายเหตุ"
            className="rounded-[22px] border-slate-200/80 py-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
            headerClassName="px-4 pt-4 pb-1"
            titleClassName="text-sm font-semibold text-slate-900"
            contentClassName="px-4 pb-4 pt-2"
          >
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="กรอกผลการตรวจสอบ..."
              className="min-h-28 resize-none border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0"
            />
          </SectionCard>
        </div>
      </main>

      <footer className="sticky bottom-0">
        <NavigationFooter
          actions={[
            {
              label: "ยกเลิก",
              onClick: () => router.push(`/my-licenses/${data.slug}`),
              variant: "secondary",
            },
            {
              label: isSaved ? "บันทึกแล้ว" : "บันทึก",
              onClick: handleSave,
              variant: "primary",
            },
          ]}
        />
      </footer>
    </>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="text-sm text-slate-900">{value}</p>
    </div>
  );
}

function AttachmentPreview({
  item,
  onRemove,
}: {
  item: AttachmentItem;
  onRemove: () => void;
}) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/70 text-white transition hover:bg-slate-900"
        aria-label={`ลบไฟล์ ${item.file.name}`}
      >
        <X className="h-3 w-3" />
      </button>

      {item.previewUrl ? (
        <Image
          src={item.previewUrl}
          alt={item.file.name}
          fill
          unoptimized
          className="object-cover"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <Camera className="h-5 w-5" />
          </div>
          <p className="line-clamp-2 text-[10px] leading-4 text-slate-500">
            {item.file.name}
          </p>
        </div>
      )}
    </div>
  );
}
