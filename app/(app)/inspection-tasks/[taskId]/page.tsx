"use client";

import { use, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FolderOpen,
  NotebookPen,
  Calendar,
  ChevronLeft,
  Camera,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useLicense } from "@/hooks/useLicense";
import { useUpdateLicenseStatus } from "@/hooks/useLicenses";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";

export default function InspectionTaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId: licenseId } = use(params);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: license, isLoading } = useLicense(licenseId);
  const updateStatus = useUpdateLicenseStatus(licenseId);

  const [note, setNote] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Thai BE calendar date string calculation
  const today = new Date();
  const dateStr = today.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const handleSave = () => {
    updateStatus.mutate(
      {
        status: "ACTIVE",
        note: note.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("บันทึกผลการตรวจสอบสำเร็จ");
          router.push(`/licenses/${licenseId}`);
        },
        onError: () => toast.error("บันทึกไม่สำเร็จ กรุณาลองใหม่"),
      },
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newUrls.push(URL.createObjectURL(file));
    }
    setImages((prev) => [...prev, ...newUrls].slice(0, 8));
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB]">
        <p className="text-slate-500 animate-pulse font-medium text-[13px]">
          กำลังโหลดข้อมูล...
        </p>
      </div>
    );
  }

  const inspectorName = user?.fullName || "นายสมชาย ใจดี";

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Back Header */}
      {/* <div className="flex items-center gap-3 py-3 px-4 bg-white border-b border-gray-100 sticky top-0 z-10 max-w-md mx-auto w-full">
        <button 
          type="button"
          onClick={() => router.back()} 
          className="size-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-slate-50 cursor-pointer"
        >
          <ChevronLeft className="size-5 text-slate-800" />
        </button>
        <h1 className="text-[16px] font-bold text-slate-900 mx-auto -translate-x-4">
          รายละเอียดใบอนุญาต
        </h1>
      </div> */}

      {/* Main Form Fields */}
      <main className="flex-1 bg-[#F9FAFB] px-4 py-4 pb-28 max-w-md mx-auto w-full space-y-4">
        {/* ข้อมูลทั่วไป */}
        <div className="bg-white border border-gray-200/60 rounded-[16px] p-4 shadow-smooth-low space-y-4 text-left">
          <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100">
            <FolderOpen className="size-[18px] text-[#0d4734]" />
            <h2 className="text-[14px] font-bold text-[#0d4734]">
              ข้อมูลทั่วไป
            </h2>
          </div>

          <div className="space-y-3">
            <div className="space-y-0.5">
              <p className="text-[11px] text-slate-500 font-medium">
                ชื่อสถานประกอบการ
              </p>
              <p className="text-[14px] text-slate-900 font-bold">
                {license?.business?.nameTh ?? "—"}
              </p>
            </div>

            <div className="space-y-0.5">
              <p className="text-[11px] text-slate-500 font-medium">
                เลขที่ใบอนุญาต
              </p>
              <p className="text-[14px] text-slate-900 font-bold font-mono">
                {license?.licenseNumber ?? "—"}
              </p>
            </div>

            <div className="space-y-0.5">
              <p className="text-[11px] text-slate-500 font-medium">
                วันที่ตรวจ
              </p>
              <div className="flex items-center gap-1.5 text-[14px] text-slate-900 font-bold">
                <Calendar className="size-4 text-slate-500" />
                <span>{dateStr}</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <p className="text-[11px] text-slate-500 font-medium">
                ผู้ตรวจสอบ
              </p>
              <p className="text-[14px] text-slate-900 font-bold">
                {inspectorName}
              </p>
            </div>
          </div>
        </div>

        {/* รูปภาพประกอบ */}
        <div className="bg-white border border-gray-200/60 rounded-[16px] p-4 shadow-smooth-low space-y-4 text-left">
          <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100">
            <ImageIcon className="size-[18px] text-[#0d4734]" />
            <h2 className="text-[14px] font-bold text-[#0d4734]">
              รูปภาพประกอบ
            </h2>
          </div>

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-[12px] p-6 bg-slate-50/50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />
            <div className="bg-white border border-gray-200 rounded-full px-4 py-2 flex items-center gap-1.5 text-slate-800 font-bold text-[13px] shadow-sm">
              <Camera className="size-4 text-slate-500" />
              <span>ถ่ายภาพ</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-2">
              ถ่ายภาพประกอบการตรวจสอบ
            </p>
          </div>

          {/* Grid of thumbnails (8 slots total) */}
          <div className="grid grid-cols-4 gap-2.5 pt-1">
            {Array.from({ length: 8 }).map((_, index) => {
              const imgUrl = images[index];
              if (imgUrl) {
                return (
                  <div
                    key={`img-${index}`}
                    className="relative rounded-[12px] aspect-square overflow-hidden border border-gray-100 shadow-sm group"
                  >
                    <img
                      src={imgUrl}
                      alt={`Evidence ${index}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                      className="absolute top-1 right-1 size-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                );
              }
              return (
                <div
                  key={`empty-${index}`}
                  className="bg-slate-100 rounded-[12px] aspect-square"
                />
              );
            })}
          </div>
        </div>

        {/* ผลตรวจ */}
        <div className="bg-white border border-gray-200/60 rounded-[16px] p-4 shadow-smooth-low space-y-4 text-left">
          <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100">
            <NotebookPen className="size-[18px] text-[#0d4734]" />
            <h2 className="text-[14px] font-bold text-[#0d4734]">ผลตรวจ</h2>
          </div>

          <textarea
            placeholder="กรอกผลการตรวจสอบ..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full min-h-[90px] text-[13px] text-slate-800 placeholder-slate-400 border-0 focus:ring-0 p-0 resize-none bg-transparent"
          />
        </div>
      </main>

      {/* Sticky Bottom Actions */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4 z-10">
        <div className="mx-auto max-w-md flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1 rounded-[10px] border-gray-200 text-slate-700 hover:bg-slate-50 h-11 text-[14px] font-bold"
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={updateStatus.isPending}
            className="flex-1 rounded-[10px] bg-[#1e7d55] hover:bg-[#165a3d] text-white h-11 text-[14px] font-bold shadow-sm"
          >
            {updateStatus.isPending ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </div>
      </footer>
    </div>
  );
}
