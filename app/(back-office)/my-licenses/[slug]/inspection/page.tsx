'use client';

import { use } from "react";
import { LicenseInspectionPageView } from "@/components/back-office/license-inspection-page";
import { useInspectionTask } from "@/hooks/useInspectionTask";

export default function MyLicenseInspectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: task, isLoading, isError } = useInspectionTask(slug);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB]">
        <p className="text-slate-500 animate-pulse">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB]">
        <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-sm mx-4">
          <p className="text-destructive font-semibold mb-2">เกิดข้อผิดพลาด</p>
          <p className="text-sm text-slate-500">ไม่พบงานตรวจสอบนี้</p>
        </div>
      </div>
    );
  }

  return <LicenseInspectionPageView task={task} />;
}
