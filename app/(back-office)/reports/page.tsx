'use client';

import { Suspense, useMemo } from "react";
import { ReportsPageView, type ReportItem } from "@/components/back-office/reports-page";
import { useInspectionTasks } from "@/hooks/useInspectionTasks";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

dayjs.extend(buddhistEra);
dayjs.locale("th");

function ReportsContent() {
  const { data: tasks, isLoading, isError } = useInspectionTasks();

  const reports = useMemo<ReportItem[]>(() => {
    if (!tasks) return [];
    return tasks.map((task) => ({
      id: task.id,
      companyName: task.business?.nameTh ?? "-",
      businessType: task.license?.licenseType.nameTh ?? "-",
      inspectionDateTime: dayjs(task.updatedAt).format("D MMM BBBB - HH:mm น."),
      location: task.business?.province ?? "-",
      inspectorName: task.assignee?.fullName ?? "-",
      // TODO(api-gap): no category field in task — defaulting to 'hotel'; needs enum mapping
      category: "hotel" as const,
      region: task.business?.province ?? "-",
      detailsHref: `/my-licenses/${task.id}/inspection`,
    }));
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB]">
        <p className="text-slate-500 animate-pulse">กำลังโหลดข้อมูลรายงาน...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB]">
        <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-sm mx-4">
          <p className="text-destructive font-semibold mb-2">เกิดข้อผิดพลาด</p>
          <p className="text-sm text-slate-500">ไม่สามารถดึงข้อมูลรายงานได้ กรุณาลองใหม่อีกครั้ง</p>
        </div>
      </div>
    );
  }

  return <ReportsPageView reports={reports} />;
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <ReportsContent />
    </Suspense>
  );
}

function PageFallback() {
  return <main className="min-h-[calc(100vh-57px)] bg-[#F9FAFB] px-4 py-4" />;
}
