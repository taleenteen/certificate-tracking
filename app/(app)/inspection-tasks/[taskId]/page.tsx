"use client";

import { use, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Trash2,
  Camera,
  Check,
  Plus,
  ChevronLeft,
  ClipboardCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

import { useLicense } from "@/hooks/useLicense";
import { useBusiness } from "@/hooks/useBusinesses";
import { useCreateOfficerInspection, uploadInspectionEvidence } from "@/hooks/useOfficer";
import { useIsStaff } from "@/hooks/useIsStaff";
import { useAuthStore } from "@/stores/auth";
import { AppBreadcrumb } from "@/components/shared/app-breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface InspectionFormItem {
  tempId: string;
  licenseId: string;
  detailNote: string;
  localImages: { file: File; previewUrl: string }[];
}

export default function InspectionTaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId: initialLicenseId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isStaff = useIsStaff();
  const user = useAuthStore((s) => s.user);
  const officerAgencyId = user?.agencyId;

  const fromParam = searchParams.get("from");
  const fromLabel = fromParam === "search" ? "ค้นหาใบอนุญาต..." : "ใบอนุญาตของฉัน";
  const fromHref = fromParam === "search" ? "/license-search" : "/licenses";

  // Fetch initial license to discover business ID
  const { data: initialLicense, isLoading: isLicenseLoading, isError: isLicenseError } = useLicense(initialLicenseId);
  const businessId = initialLicense?.business?.id ?? "";

  // Fetch all licenses under this business
  const { data: business, isLoading: isBusinessLoading, isError: isBusinessError } = useBusiness(businessId);
  const createInspection = useCreateOfficerInspection();

  // Dynamic state for inspection cards
  const [inspectionItems, setInspectionItems] = useState<InspectionFormItem[]>([
    {
      tempId: "init-1",
      licenseId: initialLicenseId,
      detailNote: "",
      localImages: [],
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const isLoading = isLicenseLoading || (!!businessId && isBusinessLoading);
  const isError = isLicenseError || isBusinessError;

  // Available licenses options mapping
  // Officers may select licenses from any agency (spec §1)
  const availableLicenses = useMemo(() => {
    if (!business?.licenses) return [];
    return business.licenses;
  }, [business]);

  const handleAddCard = () => {
    const nextUnusedLicense = availableLicenses.find(
      (lic) => !inspectionItems.some((item) => item.licenseId === lic.id)
    );

    setInspectionItems((prev) => [
      ...prev,
      {
        tempId: `card-${Date.now()}-${Math.random()}`,
        licenseId: nextUnusedLicense?.id || availableLicenses[0]?.id || "",
        detailNote: "",
        localImages: [],
      },
    ]);
  };

  const handleDeleteCard = (tempId: string) => {
    if (inspectionItems.length === 1) {
      toast.warning("ต้องมีรายการตรวจสอบอย่างน้อย 1 รายการ");
      return;
    }
    setInspectionItems((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  const handleUpdateField = <K extends keyof InspectionFormItem>(
    tempId: string,
    key: K,
    value: InspectionFormItem[K]
  ) => {
    setInspectionItems((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, [key]: value } : item))
    );
  };

  const handleFileChange = (tempId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const currentItem = inspectionItems.find((item) => item.tempId === tempId);
    const existingCount = currentItem?.localImages.length ?? 0;

    if (existingCount + files.length > 8) {
      toast.warning("อัปโหลดรูปภาพได้สูงสุด 8 รูปต่อใบอนุญาต");
      return;
    }

    const newImages = Array.from(files).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setInspectionItems((prev) =>
      prev.map((item) =>
        item.tempId === tempId
          ? { ...item, localImages: [...item.localImages, ...newImages] }
          : item
      )
    );
  };

  const handleRemoveImage = (tempId: string, imgIdx: number) => {
    setInspectionItems((prev) =>
      prev.map((item) => {
        if (item.tempId === tempId) {
          const removed = item.localImages[imgIdx];
          if (removed) URL.revokeObjectURL(removed.previewUrl);
          return {
            ...item,
            localImages: item.localImages.filter((_, idx) => idx !== imgIdx),
          };
        }
        return item;
      })
    );
  };

  const handleSubmit = async () => {
    // 1. Validate duplicates
    const selectedIds = inspectionItems.map((item) => item.licenseId);
    const uniqueIds = new Set(selectedIds);
    if (selectedIds.length !== uniqueIds.size) {
      toast.error("มีรายการใบอนุญาตที่เลือกซ้ำกัน กรุณาตรวจสอบข้อมูล");
      return;
    }

    // 2. Validate empty license selection
    if (inspectionItems.some((item) => !item.licenseId)) {
      toast.error("กรุณาเลือกใบอนุญาตให้ครบทุกรายการ");
      return;
    }

    setIsSubmitting(true);
    setUploadStatus("กำลังบันทึกข้อมูลการตรวจสอบ...");

    try {
      // 3. Create batch inspection
      // result field is not sent per spec §2: no item-level pass/fail status
      const payload = {
        businessId,
        inspectedAt: new Date().toISOString(),
        summaryNote: `ตรวจสอบหน้างาน ณ วันที่ ${new Date().toLocaleDateString("th-TH")}`,
        items: inspectionItems.map((item) => ({
          licenseId: item.licenseId,
          detailNote: item.detailNote,
          findings: {},
        })),
      };

      const res = await createInspection.mutateAsync(payload);

      // 4. Sequentially upload evidence per item
      for (const item of inspectionItems) {
        if (item.localImages.length === 0) continue;

        // Find match in returned batch response items
        const matchedItem = res.items.find((rItem) => rItem.licenseId === item.licenseId);
        if (!matchedItem) continue;

        for (let idx = 0; idx < item.localImages.length; idx++) {
          setUploadStatus(
            `กำลังอัปโหลดรูปภาพหลักฐานสำหรับใบอนุญาตใบที่ ${
              selectedIds.indexOf(item.licenseId) + 1
            } (${idx + 1}/${item.localImages.length})...`
          );
          await uploadInspectionEvidence(res.id, matchedItem.id, item.localImages[idx].file);
        }
      }

      toast.success("บันทึกผลการตรวจสอบและอัปโหลดหลักฐานสำเร็จ");
      router.push(`/licenses/${initialLicenseId}?from=${fromParam || "my-licenses"}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSubmitting(false);
      setUploadStatus("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB]">
        <Loader2 className="h-6 w-6 text-slate-500 animate-spin mr-2" />
        <p className="text-slate-500 animate-pulse font-medium text-[13px]">
          กำลังโหลดข้อมูล...
        </p>
      </div>
    );
  }

  // Agency authorization removed per spec §1: officers may inspect across agencies
  if (isError || !initialLicense) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB]">
        <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-sm mx-4">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive font-semibold mb-2">เกิดข้อผิดพลาด</p>
          <p className="text-sm text-slate-500">
            ไม่พบข้อมูลสถานประกอบการหรือใบอนุญาต กรุณาลองใหม่อีกครั้ง
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24 text-left">
      <main className="mx-auto max-w-md px-4 py-4 space-y-4">
        {/* Breadcrumb matches mockup */}
        <AppBreadcrumb
          items={[
            { label: "หน้าแรก", href: "/home" },
            { label: fromLabel, href: fromHref },
            { label: initialLicense.business.nameTh, href: `/businesses/${businessId}?from=${fromParam || "my-licenses"}` },
            { label: "ตรวจสอบใบอนุญาต" },
          ]}
          variant="dark"
        />

        {/* Centered Page Title */}
        <h2 className="text-[20px] font-bold text-slate-800 text-center tracking-wide my-4">
          บันทึกผลการตรวจสอบ
        </h2>

        {/* Business Info Header Card */}
        <Card className="rounded-[20px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
          <CardContent className="p-0 space-y-1.5">
            <h3 className="text-[15px] font-bold text-slate-800 leading-snug">
              {initialLicense.business.nameTh}
            </h3>
            <p className="text-[12px] font-semibold text-slate-400">
              ประเภทธุรกิจ : โรงงาน
            </p>
          </CardContent>
        </Card>

        {/* Inspection List Cards */}
        <div className="space-y-4">
          {inspectionItems.map((item, index) => {
            return (
              <Card
                key={item.tempId}
                className="rounded-[20px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-[14px] font-bold text-slate-800">
                    รายการใบอนุญาตที่ตรวจสอบ #{index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleDeleteCard(item.tempId)}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    ลบรายการ
                  </button>
                </div>

                {/* Dropdown 1: Select License */}
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-bold text-slate-500">
                    ชื่อใบอนุญาตที่ทำการตรวจสอบ
                  </label>
                  <select
                    value={item.licenseId}
                    onChange={(e) => handleUpdateField(item.tempId, "licenseId", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#145b57] focus:border-[#145b57]"
                  >
                    {availableLicenses.map((lic) => (
                      <option key={lic.id} value={lic.id}>
                        {lic.licenseType.nameTh} ({lic.licenseNumber})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Textarea: Notes */}
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-bold text-slate-500">
                    รายละเอียด
                  </label>
                  <textarea
                    placeholder="บันทึกรายละเอียดผลตรวจ"
                    value={item.detailNote}
                    onChange={(e) => handleUpdateField(item.tempId, "detailNote", e.target.value)}
                    className="w-full min-h-[90px] px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#145b57] focus:border-[#145b57] resize-none"
                  />
                </div>

                {/* Evidence Photo Uploader */}
                <div className="space-y-2">
                  <label className="block text-[12px] font-bold text-slate-500">
                    ภาพหลักฐาน
                  </label>

                  <div className="flex flex-wrap gap-2.5">
                    {/* Add Image Dotted Box */}
                    <input
                      type="file"
                      id={`file-${item.tempId}`}
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileChange(item.tempId, e)}
                    />
                    <label
                      htmlFor={`file-${item.tempId}`}
                      className="w-[75px] h-[75px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all select-none shrink-0"
                    >
                      <Camera className="h-5 w-5 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 mt-1">
                        เพิ่มรูปภาพ
                      </span>
                    </label>

                    {/* Previews */}
                    {item.localImages.map((img, imgIdx) => (
                      <div
                        key={img.previewUrl}
                        className="relative w-[75px] h-[75px] rounded-2xl overflow-hidden border border-slate-100 shadow-sm shrink-0"
                      >
                        <img
                          src={img.previewUrl}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(item.tempId, imgIdx)}
                          className="absolute -top-1 -right-1 size-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Add Card Button */}
        <button
          type="button"
          onClick={handleAddCard}
          className="w-full py-3 border border-[#145b57] text-[#145b57] bg-white hover:bg-emerald-50/20 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>เพิ่มรายการตรวจสอบ</span>
        </button>

        {/* Save button at the bottom */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3 bg-[#0c403d] hover:bg-[#082c2a] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(12,64,61,0.15)] disabled:opacity-50"
        >
          <ClipboardCheck className="h-4.5 w-4.5 text-white" />
          <span>บันทึกผลการตรวจสอบ</span>
        </button>
      </main>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white select-none">
          <Loader2 className="h-8 w-8 animate-spin text-white mb-3" />
          <p className="text-[13px] font-bold text-slate-100 px-4 text-center max-w-xs">
            {uploadStatus}
          </p>
        </div>
      )}
    </div>
  );
}
