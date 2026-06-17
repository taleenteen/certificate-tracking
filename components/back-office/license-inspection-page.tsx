"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertCircle, Camera, FolderOpen, ImagePlus, NotebookPen, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import type { InspectionTaskDetail } from "@/hooks/useInspectionTask";
import {
  useDeleteEvidence,
  useStartTask,
  useSubmitReport,
  useUpdateReport,
  useUploadEvidence,
} from "@/hooks/useInspectionTask";
import { NavigationFooter } from "@/components/shared/NavigationFooter";
import { SectionCard } from "@/components/shared/SectionCard";
import { Textarea } from "@/components/ui/textarea";

const MAX_ATTACHMENTS = 8;
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

type LicenseInspectionPageViewProps = {
  task: InspectionTaskDetail;
};

export function LicenseInspectionPageView({ task }: LicenseInspectionPageViewProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const report = task.report;
  const [note, setNote] = useState(report?.note ?? "");

  const startTask = useStartTask(task.id);
  const updateReport = useUpdateReport(report?.id ?? "", task.id);
  const submitReport = useSubmitReport(report?.id ?? "", task.id);
  const uploadEvidence = useUploadEvidence(report?.id ?? "", task.id);
  const deleteEvidence = useDeleteEvidence(report?.id ?? "", task.id);

  // Auto-start ASSIGNED task when opening the form
  useEffect(() => {
    if (task.status === "ASSIGNED") {
      startTask.mutate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id, task.status]);

  const isEditable = report?.isDraft || task.status === "RETURNED";
  const isReturned = task.status === "RETURNED";

  const evidenceCount = report?.evidence.length ?? 0;
  const slots = useMemo(
    () => Array.from({ length: Math.max(MAX_ATTACHMENTS - evidenceCount, 0) }),
    [evidenceCount],
  );

  const handleSelectFiles = (files: FileList | null) => {
    if (!files || !isEditable) return;
    const remaining = MAX_ATTACHMENTS - evidenceCount;
    if (remaining <= 0) return;

    const selected = Array.from(files).slice(0, remaining);
    for (const file of selected) {
      if (file.size > MAX_FILE_BYTES) {
        toast.error(`ไฟล์ ${file.name} มีขนาดเกิน 10 MB`);
        continue;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`ไฟล์ ${file.name} ต้องเป็น JPEG, PNG หรือ PDF เท่านั้น`);
        continue;
      }
      uploadEvidence.mutate(file, {
        onError: () => toast.error(`อัปโหลด ${file.name} ไม่สำเร็จ กรุณาลองใหม่`),
      });
    }

    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSave = () => {
    if (!report?.id || !isEditable) return;
    updateReport.mutate(
      { note },
      {
        onSuccess: () => toast.success("บันทึกสำเร็จ"),
        onError: () => toast.error("บันทึกไม่สำเร็จ กรุณาลองใหม่"),
      },
    );
  };

  const handleSubmit = () => {
    if (!report?.id || !isEditable) return;
    // Save note first, then submit
    updateReport.mutate(
      { note },
      {
        onSuccess: () =>
          submitReport.mutate(undefined, {
            onSuccess: () => {
              toast.success("ส่งรายงานสำเร็จ");
              router.push("/reports");
            },
            onError: () => toast.error("ส่งรายงานไม่สำเร็จ กรุณาลองใหม่"),
          }),
        onError: () => toast.error("บันทึกไม่สำเร็จ กรุณาลองใหม่"),
      },
    );
  };

  return (
    <>
      <main className="min-h-[calc(100vh-57px)] bg-[#F9FAFB] px-4 py-4 pb-28">
        <div className="mx-auto max-w-md space-y-4">
          {isReturned && report?.reviewComment && (
            <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-800">ส่งคืนจากผู้ตรวจสอบ</p>
                <p className="text-sm text-amber-700">{report.reviewComment}</p>
              </div>
            </div>
          )}

          <SectionCard
            icon={<FolderOpen className="h-4 w-4 text-slate-600" />}
            title="ข้อมูลทั่วไป"
            className="rounded-[22px] border-slate-200/80 py-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
            headerClassName="px-4 pt-4 pb-1"
            titleClassName="text-sm font-semibold text-slate-900"
            contentClassName="space-y-3 px-4 pb-4 pt-2"
          >
            <InfoField label="ชื่อสถานประกอบการ" value={task.business.nameTh} />
            <InfoField
              label="ชื่อใบอนุญาต"
              value={task.license?.licenseType.nameTh ?? "-"}
            />
            <InfoField
              label="เลขที่ใบอนุญาต"
              value={task.license?.licenseNumber ?? "-"}
            />
            <InfoField
              label="ผู้ตรวจสอบ"
              value={task.assignee?.fullName ?? "-"}
            />
          </SectionCard>

          <SectionCard
            icon={<ImagePlus className="h-4 w-4 text-slate-600" />}
            title="หลักฐานประกอบ"
            headerAction={`${evidenceCount}/${MAX_ATTACHMENTS}`}
            className="rounded-[22px] border-slate-200/80 py-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
            headerClassName="px-4 pt-4 pb-1"
            titleClassName="text-sm font-semibold text-slate-900"
            contentClassName="space-y-4 px-4 pb-4 pt-2"
          >
            {isEditable && (
              <>
                <input
                  ref={inputRef}
                  id={inputId}
                  type="file"
                  accept={ALLOWED_TYPES.join(",")}
                  capture="environment"
                  className="sr-only"
                  onChange={(e) => handleSelectFiles(e.target.files)}
                />
                <label
                  htmlFor={inputId}
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition-colors hover:border-[#114e4b]/40 hover:bg-[#114e4b]/[0.03]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">
                    <Camera className="h-4 w-4" />
                  </div>
                  <p className="text-xs text-slate-500">
                    อัปโหลดภาพหรือ PDF (สูงสุด 10 MB)
                  </p>
                </label>
              </>
            )}

            <div className="grid grid-cols-4 gap-2.5">
              {(report?.evidence ?? []).map((ev) => (
                <EvidencePreview
                  key={ev.id}
                  evidence={ev}
                  isEditable={isEditable}
                  onRemove={() =>
                    deleteEvidence.mutate(ev.id, {
                      onError: () => toast.error("ลบไฟล์ไม่สำเร็จ"),
                    })
                  }
                />
              ))}
              {isEditable &&
                slots.map((_, i) => (
                  <div
                    key={`slot-${i}`}
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
              onChange={(e) => setNote(e.target.value)}
              disabled={!isEditable}
              placeholder="กรอกผลการตรวจสอบ..."
              className="min-h-28 resize-none border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0 disabled:cursor-default disabled:opacity-60"
            />
          </SectionCard>
        </div>
      </main>

      <footer className="sticky bottom-0">
        {isEditable ? (
          <NavigationFooter
            actions={[
              {
                label: "บันทึก",
                onClick: handleSave,
                variant: "secondary",
              },
              {
                label: submitReport.isPending ? "กำลังส่ง..." : "ส่งรายงาน",
                onClick: handleSubmit,
                variant: "primary",
              },
            ]}
          />
        ) : (
          <NavigationFooter
            actions={[
              {
                label: "กลับ",
                onClick: () => router.back(),
                variant: "secondary",
              },
            ]}
          />
        )}
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

function EvidencePreview({
  evidence,
  isEditable,
  onRemove,
}: {
  evidence: { id: string; url: string; filename: string };
  isEditable: boolean;
  onRemove: () => void;
}) {
  const isImage = /\.(jpe?g|png|gif|webp)$/i.test(evidence.filename);

  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {isEditable && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/70 text-white transition hover:bg-rose-600"
          aria-label={`ลบ ${evidence.filename}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {isImage ? (
        <Image
          src={evidence.url}
          alt={evidence.filename}
          fill
          unoptimized
          className="object-cover"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1 p-2 text-center">
          <Trash2 className="h-6 w-6 text-slate-400" />
          <p className="line-clamp-2 text-[10px] leading-4 text-slate-500">
            {evidence.filename}
          </p>
        </div>
      )}
    </div>
  );
}
