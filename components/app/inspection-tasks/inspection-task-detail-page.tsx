"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  AlertCircle, 
  Camera, 
  FolderOpen, 
  ImagePlus, 
  NotebookPen, 
  X, 
  ClipboardList, 
  FileText
} from "lucide-react";
import { toast } from "sonner";

import type { InspectionTaskDetail } from "@/hooks/useInspectionTask";
import {
  useDeleteEvidence,
  useStartTask,
  useSubmitReport,
  useUpdateReport,
  useUploadEvidence,
  useApproveReport,
  useReturnReport,
} from "@/hooks/useInspectionTask";
import { useAuthStore } from "@/stores/auth";
import { NavigationFooter } from "@/components/shared/NavigationFooter";
import { SectionCard } from "@/components/shared/SectionCard";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
  const user = useAuthStore((s) => s.user);

  const report = task.reports?.[0] || null;
  const [note, setNote] = useState(report?.summaryNote ?? "");
  
  // Checklist Answers local state: { no, answer, note }[]
  const [findings, setFindings] = useState<{ no: number; answer: boolean; note: string }[]>([]);

  // Initialize findings from report data if available
  useEffect(() => {
    if (report?.checklistTemplate?.items) {
      const templateItems = report.checklistTemplate.items;
      const savedFindings = report.findings || [];
      const initialFindings = templateItems.map((item) => {
        const saved = savedFindings.find((f) => f.no === item.no);
        return {
          no: item.no,
          answer: saved ? saved.answer : true, // default to true (Pass)
          note: saved ? saved.note : "",
        };
      });
      setFindings(initialFindings);
    }
  }, [report]);

  // Sync summaryNote state when report updates
  useEffect(() => {
    if (report) {
      setNote(report.summaryNote ?? "");
    }
  }, [report]);

  const startTask = useStartTask(task.id);
  const updateReport = useUpdateReport(report?.id ?? "", task.id);
  const submitReport = useSubmitReport(report?.id ?? "", task.id);
  const uploadEvidence = useUploadEvidence(report?.id ?? "", task.id);
  const deleteEvidence = useDeleteEvidence(report?.id ?? "", task.id);
  const approveReport = useApproveReport(report?.id ?? "", task.id);
  const returnReport = useReturnReport(report?.id ?? "", task.id);

  // Auto-start ASSIGNED task when opening the form
  useEffect(() => {
    if (task.status === "ASSIGNED") {
      startTask.mutate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id, task.status]);

  const isEditable = report?.isDraft || task.status === "RETURNED";
  const isReturned = task.status === "RETURNED";

  const isSupervisorOrAdmin = useMemo(() => {
    return user?.roles?.some((r) => 
      ["supervisor", "zone_supervisor", "admin", "super_admin"].includes(r)
    ) || false;
  }, [user]);

  // Calculate score based on answers weights
  const { score: computedScore, result: computedResult } = useMemo(() => {
    if (!report?.checklistTemplate?.items || findings.length === 0) {
      return { score: 100, result: "PASSED" as const };
    }
    const templateItems = report.checklistTemplate.items;
    const totalWeight = templateItems.reduce((sum, item) => sum + item.weight, 0) || 1;
    const earnedWeight = templateItems.reduce((sum, item) => {
      const finding = findings.find((f) => f.no === item.no);
      return sum + (finding?.answer ? item.weight : 0);
    }, 0);

    const score = Math.round((earnedWeight / totalWeight) * 100);
    const passingScore = report.checklistTemplate.passingScore ?? 70;
    const result = score >= passingScore ? ("PASSED" as const) : ("FAILED" as const);

    return { score, result };
  }, [report, findings]);

  const documentsCount = report?.documents?.length ?? 0;
  const slots = useMemo(
    () => Array.from({ length: Math.max(MAX_ATTACHMENTS - documentsCount, 0) }),
    [documentsCount],
  );

  const handleSelectFiles = (files: FileList | null) => {
    if (!files || !isEditable || !report?.id) return;
    const remaining = MAX_ATTACHMENTS - documentsCount;
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

  const handleUpdateFindingAnswer = (no: number, answer: boolean) => {
    if (!isEditable) return;
    setFindings((prev) =>
      prev.map((f) => (f.no === no ? { ...f, answer } : f))
    );
  };

  const handleUpdateFindingNote = (no: number, noteText: string) => {
    if (!isEditable) return;
    setFindings((prev) =>
      prev.map((f) => (f.no === no ? { ...f, note: noteText } : f))
    );
  };

  const handleSave = () => {
    if (!report?.id || !isEditable) return;
    updateReport.mutate(
      {
        score: computedScore,
        result: computedResult,
        findings,
        summaryNote: note,
      },
      {
        onSuccess: () => toast.success("บันทึกสำเร็จ"),
        onError: () => toast.error("บันทึกไม่สำเร็จ กรุณาลองใหม่"),
      },
    );
  };

  const handleSubmit = () => {
    if (!report?.id || !isEditable) return;
    
    // Save report first, then transition state
    updateReport.mutate(
      {
        score: computedScore,
        result: computedResult,
        findings,
        summaryNote: note,
      },
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

  // Supervisor Dialog Form
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnComment, setReturnComment] = useState("");

  const handleApprove = () => {
    if (!report?.id || task.status !== "PENDING_REVIEW") return;
    approveReport.mutate(undefined, {
      onSuccess: () => {
        toast.success("อนุมัติผลการตรวจสอบสำเร็จ");
        router.push("/reports");
      },
      onError: () => toast.error("เกิดข้อผิดพลาดในการอนุมัติ"),
    });
  };

  const handleReturnSubmit = () => {
    if (!report?.id || task.status !== "PENDING_REVIEW") return;
    if (!returnComment.trim()) {
      toast.warning("กรุณากรอกเหตุผลหรือรายละเอียดในการส่งกลับ");
      return;
    }
    returnReport.mutate(
      { reviewComment: returnComment },
      {
        onSuccess: () => {
          toast.success("ส่งกลับแก้ไขรายงานสำเร็จ");
          setShowReturnModal(false);
          router.push("/reports");
        },
        onError: () => toast.error("เกิดข้อผิดพลาดในการส่งกลับ"),
      }
    );
  };

  // Status mapping colors helper
  const statusConfig = {
    ASSIGNED: { label: "รอมอบหมาย", color: "bg-blue-50 text-blue-700 border-blue-200" },
    IN_PROGRESS: { label: "กำลังดำเนินการ", color: "bg-teal-50 text-teal-700 border-teal-200" },
    PENDING_REVIEW: { label: "รอตรวจสอบ", color: "bg-amber-50 text-amber-700 border-amber-200" },
    APPROVED: { label: "เสร็จสิ้น (อนุมัติแล้ว)", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    RETURNED: { label: "ส่งกลับแก้ไข", color: "bg-rose-50 text-rose-700 border-rose-200" },
    CANCELLED: { label: "ยกเลิก", color: "bg-slate-50 text-slate-700 border-slate-200" },
  };

  const currentStatusInfo = statusConfig[task.status] || { label: task.status, color: "bg-slate-50 text-slate-700" };

  return (
    <>
      <main className="min-h-screen bg-[#F9FAFB] px-4 py-4 pb-28 text-left">
        <div className="mx-auto max-w-md space-y-4">
          
          {/* Supervisor return comment banner */}
          {isReturned && report?.reviewComment && (
            <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-800">ส่งคืนจากผู้ตรวจสอบ</p>
                <p className="text-sm text-amber-700">{report.reviewComment}</p>
              </div>
            </div>
          )}

          {/* General Information Card */}
          <SectionCard
            icon={<FolderOpen className="h-4 w-4 text-slate-600" />}
            title="ข้อมูลทั่วไป"
            className="rounded-[22px] border-slate-200/80 py-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)] bg-white"
            headerClassName="px-4 pt-4 pb-1"
            titleClassName="text-sm font-semibold text-slate-900"
            contentClassName="space-y-3 px-4 pb-4 pt-2"
          >
            <InfoField label="ชื่อสถานประกอบการ" value={task.business.nameTh} />
            <InfoField
              label="ประเภทใบอนุญาต"
              value={task.license?.licenseType.nameTh ?? "-"}
            />
            <InfoField
              label="เลขที่ใบอนุญาต"
              value={task.license?.licenseNo ?? "-"}
            />
            <div className="grid grid-cols-2 gap-4">
              <InfoField
                label="ผู้ตรวจสอบ"
                value={task.assignee?.fullName ?? "-"}
              />
              <div className="space-y-1">
                <p className="text-[11px] text-slate-500 font-bold">สถานะงานตรวจ</p>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${currentStatusInfo.color}`}>
                  {currentStatusInfo.label}
                </span>
              </div>
            </div>
          </SectionCard>

          {/* Checklist Evaluation Card */}
          {report ? (
            <SectionCard
              icon={<ClipboardList className="h-4 w-4 text-slate-600" />}
              title="แบบตรวจและประเมินผล"
              headerAction={
                <span className="text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                  ผ่านเกณฑ์ที่ {report.checklistTemplate?.passingScore ?? 70} คะแนน
                </span>
              }
              className="rounded-[22px] border-slate-200/80 py-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)] bg-white"
              headerClassName="px-4 pt-4 pb-1"
              titleClassName="text-sm font-semibold text-slate-900"
              contentClassName="space-y-4 px-4 pb-4 pt-2"
            >
              {/* Score dashboard bar */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500">คะแนนประเมินปัจจุบัน</p>
                  <p className="text-[20px] font-extrabold text-[#114e4b] mt-0.5">
                    {computedScore} <span className="text-xs font-semibold text-slate-400">/ 100 คะแนน</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-slate-500">ผลการประเมิน</p>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    computedResult === "PASSED" 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}>
                    {computedResult === "PASSED" ? "ผ่านเกณฑ์" : "ไม่ผ่านเกณฑ์"}
                  </span>
                </div>
              </div>

              {/* Checklist Questions */}
              <div className="space-y-4 divide-y divide-slate-100">
                {report.checklistTemplate?.items.map((item, index) => {
                  const finding = findings.find((f) => f.no === item.no);
                  const isPassed = finding?.answer ?? true;
                  const itemNote = finding?.note ?? "";

                  return (
                    <div key={item.no} className={`space-y-2.5 ${index > 0 ? "pt-4" : ""}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="text-xs font-bold text-slate-700 leading-snug">
                          {item.no}. {item.question_th}
                          <span className="text-[10px] font-bold text-slate-400 ml-1">
                            (ค่าน้ำหนัก: {item.weight})
                          </span>
                          {item.required && (
                            <span className="text-rose-500 font-bold ml-0.5">*</span>
                          )}
                        </div>

                        {/* Pass/Fail buttons */}
                        <div className="flex border border-slate-200 rounded-lg overflow-hidden shrink-0">
                          <button
                            type="button"
                            disabled={!isEditable}
                            onClick={() => handleUpdateFindingAnswer(item.no, true)}
                            className={`px-3 py-1.5 text-[10px] font-bold transition-all cursor-pointer ${
                              isPassed
                                ? "bg-emerald-50 text-emerald-700 font-extrabold"
                                : "bg-white text-slate-400 hover:bg-slate-50"
                            }`}
                          >
                            ผ่าน
                          </button>
                          <div className="w-[1px] bg-slate-200" />
                          <button
                            type="button"
                            disabled={!isEditable}
                            onClick={() => handleUpdateFindingAnswer(item.no, false)}
                            className={`px-3 py-1.5 text-[10px] font-bold transition-all cursor-pointer ${
                              !isPassed
                                ? "bg-rose-50 text-rose-700 font-extrabold"
                                : "bg-white text-slate-400 hover:bg-slate-50"
                            }`}
                          >
                            ไม่ผ่าน
                          </button>
                        </div>
                      </div>

                      {/* Question notes field */}
                      {isEditable ? (
                        <input
                          type="text"
                          placeholder="คำอธิบาย/ข้อเสนอแนะเพิ่มเติมสำหรับข้อนี้..."
                          value={itemNote}
                          onChange={(e) => handleUpdateFindingNote(item.no, e.target.value)}
                          className="w-full px-3 py-2 border border-slate-100 rounded-xl bg-slate-50/50 text-[11px] font-semibold placeholder-slate-400 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#114e4b]"
                        />
                      ) : (
                        itemNote && (
                          <div className="px-3 py-2 bg-slate-50 rounded-xl text-[11px] font-semibold text-slate-500">
                            <span className="font-bold text-slate-600">โน้ต: </span>{itemNote}
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          ) : (
            <Card className="rounded-[22px] border border-slate-100 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] text-center">
              <ClipboardList className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">กรุณาเริ่มการตรวจสอบก่อนเพื่อบันทึกผลการประเมิน</p>
            </Card>
          )}

          {/* Evidence Documents Card */}
          {report && (
            <SectionCard
              icon={<ImagePlus className="h-4 w-4 text-slate-600" />}
              title="หลักฐานประกอบ"
              headerAction={`${documentsCount}/${MAX_ATTACHMENTS}`}
              className="rounded-[22px] border-slate-200/80 py-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)] bg-white"
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
                {(report.documents || []).map((doc) => (
                  <EvidencePreview
                    key={doc.id}
                    doc={doc}
                    isEditable={isEditable}
                    onRemove={() =>
                      deleteEvidence.mutate(doc.id, {
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
          )}

          {/* Notes Card */}
          {report && (
            <SectionCard
              icon={<NotebookPen className="h-4 w-4 text-slate-600" />}
              title="บันทึกข้อความสรุป"
              className="rounded-[22px] border-slate-200/80 py-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)] bg-white"
              headerClassName="px-4 pt-4 pb-1"
              titleClassName="text-sm font-semibold text-slate-900"
              contentClassName="px-4 pb-4 pt-2"
            >
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={!isEditable}
                placeholder="กรอกสรุปบันทึกผลการตรวจสอบภาพรวม..."
                className="min-h-28 resize-none border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0 disabled:cursor-default disabled:opacity-60 text-left"
              />
            </SectionCard>
          )}
        </div>
      </main>

      {/* Action Footer Navigation */}
      <footer className="sticky bottom-0 z-40 bg-white border-t border-slate-100 shadow-md">
        {task.status === "ASSIGNED" ? (
          <NavigationFooter
            actions={[
              {
                label: startTask.isPending ? "กำลังเริ่มงานตรวจ..." : "เริ่มการตรวจสอบ",
                onClick: () => startTask.mutate(),
                variant: "primary",
              },
            ]}
          />
        ) : isEditable ? (
          <NavigationFooter
            actions={[
              {
                label: "บันทึกร่าง",
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
        ) : task.status === "PENDING_REVIEW" && isSupervisorOrAdmin ? (
          <NavigationFooter
            actions={[
              {
                label: "ส่งกลับแก้ไข",
                onClick: () => setShowReturnModal(true),
                variant: "secondary",
              },
              {
                label: approveReport.isPending ? "กำลังอนุมัติ..." : "อนุมัติผลตรวจ",
                onClick: handleApprove,
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

      {/* Return Dialog Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm rounded-[24px] border-slate-100 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.15)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-rose-600">
                <AlertCircle className="h-4.5 w-4.5" />
                <h4 className="text-[14px] font-bold text-slate-800">ส่งกลับเพื่อแก้ไข</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] font-bold text-slate-500">
                ข้อเสนอแนะเพิ่มเติม / รายละเอียดในการส่งกลับ
              </label>
              <Textarea
                placeholder="ระบุสิ่งที่ต้องการให้เจ้าหน้าที่ตรวจแก้ไขเพิ่มเติม (เช่น เพิ่มรูปถ่าย, เอกสาร...)"
                value={returnComment}
                onChange={(e) => setReturnComment(e.target.value)}
                className="min-h-[100px] text-xs font-semibold rounded-xl border border-slate-200 focus-visible:ring-1 focus-visible:ring-[#114e4b]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowReturnModal(false)}
                className="h-10 rounded-xl text-xs font-bold border-slate-200 cursor-pointer"
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                onClick={handleReturnSubmit}
                disabled={returnReport.isPending}
                className="h-10 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                {returnReport.isPending ? "กำลังส่งกลับ..." : "ส่งกลับ"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5 text-left">
      <p className="text-[10px] text-slate-500 font-bold">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function EvidencePreview({
  doc,
  isEditable,
  onRemove,
}: {
  doc: { id: string; url: string; filename: string };
  isEditable: boolean;
  onRemove: () => void;
}) {
  const isImage = /\.(jpe?g|png|gif|webp)$/i.test(doc.filename);

  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {isEditable && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/70 text-white transition hover:bg-rose-600 cursor-pointer animate-in fade-in zoom-in duration-100"
          aria-label={`ลบ ${doc.filename}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {isImage ? (
        <Image
          src={doc.url}
          alt={doc.filename}
          fill
          unoptimized
          className="object-cover"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1 p-2 text-center">
          <FileText className="h-6 w-6 text-slate-400" />
          <p className="line-clamp-2 text-[10px] leading-4 text-slate-500">
            {doc.filename}
          </p>
        </div>
      )}
    </div>
  );
}
