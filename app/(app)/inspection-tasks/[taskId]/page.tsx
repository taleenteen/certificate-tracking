"use client";

import { use } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { useInspectionTask, useInspectionTaskByLicense } from "@/hooks/useInspectionTask";
import { LicenseInspectionPageView } from "@/components/app/inspection-tasks/inspection-task-detail-page";

export default function InspectionTaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = use(params);

  // 1. Fetch by Task ID (if the taskId parameter is actually the task UUID)
  const { data: taskById, isLoading: isLoadingById, isError: isErrorById } = useInspectionTask(taskId);

  // 2. Fallback: Fetch by License ID (if the taskId parameter is the license UUID instead of task UUID)
  const shouldTryLicense = isErrorById || (!isLoadingById && !taskById);
  const { data: taskByLicense, isLoading: isLoadingByLicense } = useInspectionTaskByLicense(taskId, {
    enabled: shouldTryLicense
  });

  const isLoading = isLoadingById || (shouldTryLicense && isLoadingByLicense);
  const task = taskById || taskByLicense;

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB]">
        <Loader2 className="h-6 w-6 text-slate-500 animate-spin mr-2" />
        <p className="text-slate-500 animate-pulse font-medium text-[13px]">
          กำลังโหลดรายละเอียดการตรวจสอบ...
        </p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB]">
        <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-sm mx-4">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive font-semibold mb-2">ไม่พบงานตรวจสอบ</p>
          <p className="text-sm text-slate-500">
            คุณไม่ได้รับสิทธิ์เข้าถึงงานตรวจสอบรายการนี้ หรือไม่พบข้อมูลตามรหัสที่ระบุ
          </p>
        </div>
      </div>
    );
  }

  return <LicenseInspectionPageView task={task} />;
}
