"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  Check,
  Download,
  Loader2,
  Pencil,
  X,
} from "lucide-react";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import { toast } from "sonner";

import { AppBreadcrumb } from "@/components/shared/app-breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  uploadInspectionEvidence,
  useOfficerInspection,
  useUpdateOfficerInspectionItem,
} from "@/hooks/useOfficer";

dayjs.extend(buddhistEra);

export default function OfficerInspectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const inspectionId = params.inspectionId as string;
  const { data, isLoading, isError, refetch } = useOfficerInspection(inspectionId);
  const updateItem = useUpdateOfficerInspectionItem(inspectionId);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    fileName: string;
  } | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [cameraTargetItemId, setCameraTargetItemId] = useState<string | null>(null);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const inspectedAt = useMemo(
    () => (data ? dayjs(data.inspectedAt).format("D MMM BBBB - HH:mm น.") : ""),
    [data],
  );

  useEffect(() => {
    if (!data) return;
    setDraftNotes(
      Object.fromEntries(data.items.map((item) => [item.id, item.detailNote ?? ""]))
    );
  }, [data]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => () => stopCamera(), []);

  const handleStartEdit = (itemId: string, detailNote: string | null) => {
    setDraftNotes((prev) => ({ ...prev, [itemId]: detailNote ?? "" }));
    setEditingItemId(itemId);
  };

  const handleCancelEdit = (itemId: string, detailNote: string | null) => {
    setDraftNotes((prev) => ({ ...prev, [itemId]: detailNote ?? "" }));
    setEditingItemId(null);
  };

  const handleSaveItem = async (itemId: string) => {
    try {
      await updateItem.mutateAsync({
        itemId,
        dto: { detailNote: draftNotes[itemId] ?? "" },
      });
      setEditingItemId(null);
      toast.success("บันทึกรายการตรวจสอบแล้ว");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  const handleOpenCamera = async (itemId: string) => {
    if (editingItemId !== itemId) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("อุปกรณ์นี้ไม่รองรับการเปิดกล้องผ่านเบราว์เซอร์");
      return;
    }

    setCameraTargetItemId(itemId);
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
    } catch (error) {
      console.error(error);
      setCameraError("ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการใช้งานกล้อง");
      toast.error("ไม่สามารถเปิดกล้องได้");
    } finally {
      setIsCameraStarting(false);
    }
  };

  const handleCloseCamera = () => {
    stopCamera();
    setCameraTargetItemId(null);
    setCameraError("");
  };

  const handleCapturePhoto = () => {
    if (!cameraTargetItemId || !videoRef.current) return;

    const itemId = cameraTargetItemId;
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
      async (blob) => {
        if (!blob) {
          toast.error("ไม่สามารถบันทึกภาพจากกล้องได้");
          return;
        }

        const file = new File([blob], `inspection-${itemId}-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        setIsUploadingEvidence(true);
        try {
          await uploadInspectionEvidence(inspectionId, itemId, file);
          await refetch();
          toast.success("เพิ่มภาพหลักฐานแล้ว");
          handleCloseCamera();
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "ไม่สามารถอัปโหลดภาพหลักฐานได้"
          );
        } finally {
          setIsUploadingEvidence(false);
        }
      },
      "image/jpeg",
      0.9
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB]">
        <Loader2 className="mr-2 h-6 w-6 animate-spin text-slate-500" />
        <p className="text-[13px] font-medium text-slate-500">
          กำลังโหลดรายละเอียดรายงาน...
        </p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB]">
        <div className="mx-4 max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-2 h-8 w-8 text-destructive" />
          <p className="mb-2 font-semibold text-destructive">เกิดข้อผิดพลาด</p>
          <p className="text-sm text-slate-500">
            ไม่สามารถดึงรายละเอียดรายงานได้ กรุณาลองใหม่อีกครั้ง
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24 text-left">
      <main className="mx-auto max-w-md space-y-4 px-4 py-4">
        <AppBreadcrumb
          items={[
            { label: "หน้าแรก", href: "/home" },
            { label: "รายการตรวจสอบ", href: "/reports" },
            { label: data.inspectionNo },
          ]}
          variant="dark"
        />

        <div className="my-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10 shrink-0 rounded-full border border-slate-200 bg-white hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-wide text-slate-800">
              รายละเอียดผลการเข้าตรวจสอบ
            </h1>
            <p className="mt-1 text-[10px] font-semibold text-slate-400">
              {data.inspectionNo} • {inspectedAt}
            </p>
          </div>
        </div>

        {/* Business Info Header Card */}
        <Card className="rounded-[20px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
          <CardContent className="space-y-1.5 p-0">
            <h3 className="text-[15px] font-bold leading-snug text-slate-800">
              {data.business.nameTh}
            </h3>
            <p className="text-[12px] font-semibold text-slate-400">
              ประเภทธุรกิจ : โรงงาน
            </p>
            <p className="text-[11px] font-semibold text-slate-400">
              {data.business.province ?? "-"} • ใบอนุญาต {data.items.length} รายการ
            </p>
          </CardContent>
        </Card>

        {data.summaryNote ? (
          <Card className="rounded-[20px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
            <CardContent className="space-y-1.5 p-0">
              <h3 className="text-[13px] font-bold text-slate-800">
                สรุปผลการตรวจสอบ
              </h3>
              <p className="text-[12px] font-semibold leading-6 text-slate-500">
                {data.summaryNote}
              </p>
            </CardContent>
          </Card>
        ) : null}

        <div className="space-y-4">
          {data.items.map((item, index) => {
            const isEditing = editingItemId === item.id;
            const isSaving = updateItem.isPending && updateItem.variables?.itemId === item.id;

            return (
              <Card
                key={item.id}
                className="space-y-4 rounded-[20px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-800">
                      รายการใบอนุญาตที่ตรวจสอบ #{index + 1}
                    </h4>
                    <span className="mt-2 inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-500">
                      {item.license.status}
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelEdit(item.id, item.detailNote)}
                        disabled={isSaving}
                        className="h-8 rounded-lg px-2 text-[11px] font-bold"
                      >
                        <X className="mr-1 h-3.5 w-3.5" />
                        ยกเลิก
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSaveItem(item.id)}
                        disabled={isSaving}
                        className="h-8 rounded-lg bg-[#0c403d] px-2 text-[11px] font-bold text-white hover:bg-[#082c2a]"
                      >
                        {isSaving ? (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="mr-1 h-3.5 w-3.5" />
                        )}
                        บันทึก
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartEdit(item.id, item.detailNote)}
                      className="h-8 shrink-0 rounded-lg px-2 text-[11px] font-bold"
                    >
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      แก้ไข
                    </Button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[12px] font-bold text-slate-500">
                    ชื่อใบอนุญาตที่ทำการตรวจสอบ
                  </label>
                  <div className="min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800">
                    {item.license.licenseType.nameTh} ({item.license.licenseNumber})
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[12px] font-bold text-slate-500">
                    รายละเอียด
                  </label>
                  {isEditing ? (
                    <textarea
                      value={draftNotes[item.id] ?? ""}
                      onChange={(event) =>
                        setDraftNotes((prev) => ({
                          ...prev,
                          [item.id]: event.target.value,
                        }))
                      }
                      rows={4}
                      className="min-h-[110px] w-full resize-none rounded-xl border border-[#0c403d]/25 bg-white px-3.5 py-2.5 text-xs font-semibold leading-6 text-slate-800 outline-none ring-2 ring-transparent transition focus:ring-[#0c403d]/10"
                      placeholder="กรอกรายละเอียดผลการตรวจสอบ"
                    />
                  ) : (
                    <div className="min-h-[90px] w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold leading-6 text-slate-800">
                      {item.detailNote || "-"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label className="block text-[12px] font-bold text-slate-500">
                      ภาพหลักฐาน
                    </label>
                    {isEditing ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenCamera(item.id)}
                        className="h-8 rounded-lg px-2 text-[11px] font-bold"
                      >
                        <Camera className="mr-1 h-3.5 w-3.5" />
                        ถ่ายรูป
                      </Button>
                    ) : null}
                  </div>

                  {item.evidence.length > 0 ? (
                    <div className="flex flex-wrap gap-2.5">
                      {item.evidence.map((evidence) =>
                        evidence.mimeType.startsWith("image/") ? (
                          <button
                            key={evidence.id}
                            type="button"
                            onClick={() =>
                              setPreviewImage({
                                url: evidence.url,
                                fileName: evidence.fileName,
                              })
                            }
                            className="relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                          >
                            <img
                              src={evidence.url}
                              alt={evidence.fileName}
                              className="h-full w-full object-cover"
                            />
                          </button>
                        ) : (
                          <a
                            key={evidence.id}
                            href={evidence.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-20 w-20 flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-2 text-center text-[10px] font-bold text-slate-500"
                          >
                            <Camera className="mb-1 h-4 w-4" />
                            PDF
                          </a>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-300">
                      <Camera className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="rounded-[20px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
          <CardContent className="p-0">
            <Button
              type="button"
              onClick={() =>
                window.open(
                  `/api/officer/inspections/${data.id}/export?format=pdf`,
                  "_blank",
                  "noopener,noreferrer",
                )
              }
              className="h-10 w-full rounded-xl bg-[#0c403d] text-xs font-bold text-white hover:bg-[#082c2a]"
            >
              <Download className="mr-2 h-4 w-4" />
              ส่งออก PDF
            </Button>
          </CardContent>
        </Card>

        <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
          <DialogContent className="max-w-[calc(100vw-1.5rem)] border-0 bg-transparent p-0 shadow-none sm:max-w-3xl">
            <DialogTitle className="sr-only">
              {previewImage?.fileName ?? "ภาพหลักฐาน"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              แสดงภาพหลักฐานขนาดเต็ม
            </DialogDescription>
            {previewImage ? (
              <img
                src={previewImage.url}
                alt={previewImage.fileName}
                className="max-h-[82vh] w-full rounded-2xl object-contain"
              />
            ) : null}
          </DialogContent>
        </Dialog>
      </main>

      {cameraTargetItemId ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-bold">ถ่ายภาพหลักฐาน</p>
              <p className="text-xs text-slate-300">ใช้กล้องถ่ายภาพหน้างานเท่านั้น</p>
            </div>
            <button
              type="button"
              onClick={handleCloseCamera}
              disabled={isUploadingEvidence}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50"
              aria-label="ปิดกล้อง"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black">
            {(isCameraStarting || isUploadingEvidence) && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80">
                <Loader2 className="mb-3 h-8 w-8 animate-spin" />
                <p className="text-sm font-semibold">
                  {isUploadingEvidence ? "กำลังอัปโหลดภาพ..." : "กำลังเปิดกล้อง..."}
                </p>
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
              disabled={isCameraStarting || isUploadingEvidence || !!cameraError}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 disabled:opacity-50"
              aria-label="ถ่ายภาพ"
            >
              <span className="block h-11 w-11 rounded-full bg-white" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
