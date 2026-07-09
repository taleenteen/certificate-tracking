"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Trash2,
  Camera,
  Plus,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Check,
  Pencil,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { useBusiness, useJuristicBusiness } from "@/hooks/useBusinesses";
import { useCreateOfficerInspection, uploadInspectionEvidence } from "@/hooks/useOfficer";
import { AppBreadcrumb } from "@/components/shared/app-breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InspectionFormItem {
  tempId: string;
  licenseId: string;
  detailNote: string;
  localImages: { file: File; previewUrl: string }[];
  isEditing: boolean;
}

export default function BusinessInspectPage() {
  const router = useRouter();
  const params = useParams();
  
  const businessId = params.businessId as string;
  const isMock = businessId.startsWith("mock-est-");

  const juristicQuery = useJuristicBusiness(isMock ? "" : businessId);
  const publicQuery = useBusiness(isMock || juristicQuery.data ? "" : businessId);
  const activeData = juristicQuery.data || publicQuery.data;

  const createInspection = useCreateOfficerInspection();

  const [inspectionItems, setInspectionItems] = useState<InspectionFormItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [cameraTargetTempId, setCameraTargetTempId] = useState<string | null>(null);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isLoading = juristicQuery.isLoading || (!juristicQuery.data && publicQuery.isLoading);
  const isError = juristicQuery.isError && publicQuery.isError;

  const availableLicenses = useMemo(() => {
    if (!activeData?.licenses) return [];
    return activeData.licenses;
  }, [activeData]);

  // Initialize once activeData loads
  useEffect(() => {
    if (activeData?.licenses && inspectionItems.length === 0) {
      setInspectionItems([
        {
          tempId: "init-1",
          licenseId: activeData.licenses[0]?.id || "",
          detailNote: "",
          localImages: [],
          isEditing: true,
        },
      ]);
    }
  }, [activeData, inspectionItems.length]);

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
        isEditing: true,
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

  const handleToggleEdit = (tempId: string) => {
    setInspectionItems((prev) =>
      prev.map((item) =>
        item.tempId === tempId ? { ...item, isEditing: !item.isEditing } : item
      )
    );
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleOpenCamera = async (tempId: string) => {
    const currentItem = inspectionItems.find((item) => item.tempId === tempId);
    if (!currentItem?.isEditing) return;

    if ((currentItem.localImages.length ?? 0) >= 8) {
      toast.warning("ถ่ายรูปภาพได้สูงสุด 8 รูปต่อใบอนุญาต");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("อุปกรณ์นี้ไม่รองรับการเปิดกล้องผ่านเบราว์เซอร์");
      return;
    }

    setCameraTargetTempId(tempId);
    setCameraError("");
    setIsCameraStarting(true);

    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error(err);
      setCameraError("ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการใช้งานกล้อง");
      toast.error("ไม่สามารถเปิดกล้องได้");
    } finally {
      setIsCameraStarting(false);
    }
  };

  const handleCloseCamera = () => {
    stopCamera();
    setCameraTargetTempId(null);
    setCameraError("");
  };

  const handleCapturePhoto = () => {
    if (!cameraTargetTempId || !videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext("2d");
    if (!context) {
      toast.error("ไม่สามารถบันทึกภาพจากกล้องได้");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("ไม่สามารถบันทึกภาพจากกล้องได้");
          return;
        }

        const file = new File(
          [blob],
          `inspection-${cameraTargetTempId}-${Date.now()}.jpg`,
          { type: "image/jpeg" }
        );
        const previewUrl = URL.createObjectURL(file);

        setInspectionItems((prev) =>
          prev.map((item) =>
            item.tempId === cameraTargetTempId
              ? {
                  ...item,
                  localImages: [...item.localImages, { file, previewUrl }],
                }
              : item
          )
        );

        handleCloseCamera();
      },
      "image/jpeg",
      0.9
    );
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

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

    // 3. Validate detail notes
    if (inspectionItems.some((item) => !item.detailNote.trim())) {
      toast.error("กรุณากรอกบันทึกรายละเอียดให้ครบทุกรายการ");
      return;
    }

    setIsSubmitting(true);
    setUploadStatus("กำลังบันทึกข้อมูลการตรวจสอบ...");

    try {
      // 4. Create batch inspection
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

      // 5. Sequentially upload evidence per item
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
      router.push("/reports");
    } catch (err: unknown) {
      console.error(err);
      const error = err as Error;
      toast.error(error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
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
          กำลังโหลดข้อมูลสถานประกอบการ...
        </p>
      </div>
    );
  }

  if (isError || !activeData) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB]">
        <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-sm mx-4">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive font-semibold mb-2">เกิดข้อผิดพลาด</p>
          <p className="text-sm text-slate-500">
            ไม่พบข้อมูลสถานประกอบการ กรุณาลองใหม่อีกครั้ง
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24 text-left">
      <main className="mx-auto max-w-md px-4 py-4 space-y-4">
        {/* Breadcrumb matching mockup layout */}
        <AppBreadcrumb
          items={[
            { label: "หน้าแรก", href: "/home" },
            { label: "ข้อมูลสถานประกอบการ", href: `/businesses/${businessId}` },
            { label: "บันทึกผลการตรวจสอบ" },
          ]}
          variant="dark"
        />

        {/* Header Title with Back Button */}
        <div className="flex items-center gap-3 my-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full bg-white hover:bg-slate-100 border border-slate-200 shrink-0 h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-wide leading-none">
              บันทึกผลการเข้าตรวจสอบ
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">
              ระบบกรอกข้อมูลตรวจสอบสำหรับเจ้าหน้าที่ภาคสนาม
            </p>
          </div>
        </div>

        {/* Business Info Header Card */}
        <Card className="rounded-[20px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
          <CardContent className="p-0 space-y-1.5">
            <h3 className="text-[15px] font-bold text-slate-800 leading-snug">
              {activeData.nameTh}
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
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleEdit(item.tempId)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#145b57] hover:text-[#0f423f] bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      {item.isEditing ? (
                        <>
                          <Check className="h-3 w-3" />
                          เสร็จ
                        </>
                      ) : (
                        <>
                          <Pencil className="h-3 w-3" />
                          แก้ไข
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCard(item.tempId)}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      ลบรายการ
                    </button>
                  </div>
                </div>

                {/* Dropdown 1: Select License */}
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-bold text-slate-500">
                    ชื่อใบอนุญาตที่ทำการตรวจสอบ
                  </label>
                  <Select
                    value={item.licenseId}
                    onValueChange={(val) => handleUpdateField(item.tempId, "licenseId", val)}
                    disabled={!item.isEditing}
                  >
                    <SelectTrigger className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#145b57] focus:border-[#145b57] text-left [&_svg]:ml-auto h-11">
                      <SelectValue placeholder="เลือกใบอนุญาต..." />
                    </SelectTrigger>
                    <SelectContent className="max-w-[calc(100vw-2rem)] md:max-w-md">
                      {availableLicenses.map((lic) => (
                        <SelectItem key={lic.id} value={lic.id} className="text-xs font-semibold text-slate-800">
                          {lic.licenseType.nameTh} ({lic.licenseNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Textarea: Notes */}
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-bold text-slate-500">
                    รายละเอียด *
                  </label>
                  <textarea
                    placeholder="บันทึกรายละเอียดผลตรวจ"
                    value={item.detailNote}
                    disabled={!item.isEditing}
                    onChange={(e) => handleUpdateField(item.tempId, "detailNote", e.target.value)}
                    className="w-full min-h-[90px] px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#145b57] focus:border-[#145b57] resize-none disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>

                {/* Evidence Photo Uploader */}
                <div className="space-y-2">
                  <label className="block text-[12px] font-bold text-slate-500">
                    ภาพหลักฐาน
                  </label>

                  <div className="flex flex-wrap gap-2.5">
                    {/* Camera capture only: no album/file picker */}
                    <button
                      type="button"
                      onClick={() => handleOpenCamera(item.tempId)}
                      disabled={!item.isEditing}
                      className="w-[75px] h-[75px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all select-none shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Camera className="h-5 w-5 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 mt-1">
                        เปิดกล้อง
                      </span>
                    </button>

                    {/* Previews */}
                    {item.localImages.map((img, imgIdx) => (
                      <div
                        key={img.previewUrl}
                        className="relative w-[75px] h-[75px] rounded-2xl overflow-hidden border border-slate-100 shadow-sm shrink-0"
                      >
                        <Image
                          unoptimized
                          src={img.previewUrl}
                          alt="Thumbnail preview"
                          width={75}
                          height={75}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          disabled={!item.isEditing}
                          onClick={() => handleRemoveImage(item.tempId, imgIdx)}
                          className="absolute -top-1 -right-1 size-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors disabled:hidden"
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

      {cameraTargetTempId && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-bold">ถ่ายภาพหลักฐาน</p>
              <p className="text-xs text-slate-300">ใช้กล้องถ่ายภาพหน้างานเท่านั้น</p>
            </div>
            <button
              type="button"
              onClick={handleCloseCamera}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              aria-label="ปิดกล้อง"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black">
            {isCameraStarting && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80">
                <Loader2 className="mb-3 h-8 w-8 animate-spin" />
                <p className="text-sm font-semibold">กำลังเปิดกล้อง...</p>
              </div>
            )}
            {cameraError ? (
              <div className="mx-6 rounded-2xl bg-white p-5 text-center text-slate-900">
                <AlertCircle className="mx-auto mb-2 h-8 w-8 text-destructive" />
                <p className="text-sm font-bold">{cameraError}</p>
              </div>
            ) : null}
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="h-full max-h-full w-full object-cover"
            />
          </div>

          <div className="px-4 pb-6 pt-4">
            <button
              type="button"
              onClick={handleCapturePhoto}
              disabled={isCameraStarting || !!cameraError}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 disabled:opacity-50"
              aria-label="ถ่ายภาพ"
            >
              <span className="block h-11 w-11 rounded-full bg-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
