"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  Download,
  Loader2,
} from "lucide-react";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";

import { AppBreadcrumb } from "@/components/shared/app-breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOfficerInspection } from "@/hooks/useOfficer";

dayjs.extend(buddhistEra);

export default function OfficerInspectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const inspectionId = params.inspectionId as string;
  const { data, isLoading, isError } = useOfficerInspection(inspectionId);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    fileName: string;
  } | null>(null);

  const inspectedAt = useMemo(
    () => (data ? dayjs(data.inspectedAt).format("D MMM BBBB - HH:mm น.") : ""),
    [data],
  );

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
          {data.items.map((item, index) => (
            <Card
              key={item.id}
              className="space-y-4 rounded-[20px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)]"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-[14px] font-bold text-slate-800">
                  รายการใบอนุญาตที่ตรวจสอบ #{index + 1}
                </h4>
                <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-500">
                  {item.license.status}
                </span>
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
                <div className="min-h-[90px] w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold leading-6 text-slate-800">
                  {item.detailNote || "-"}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[12px] font-bold text-slate-500">
                  ภาพหลักฐาน
                </label>

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
          ))}
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
    </div>
  );
}
