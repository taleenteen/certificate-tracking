'use client';

import { Suspense, useMemo } from "react";
import { ReportsPageView, type ReportItem } from "@/components/app/inspection-tasks/reports-page";
import { useOfficerInspections } from "@/hooks/useOfficer";
import { useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

dayjs.extend(buddhistEra);
dayjs.locale("th");

function ReportsContent() {
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => ({
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      limit: 100,
    }),
    [searchParams],
  );
  const { data: inspectionPage, isLoading, isError } = useOfficerInspections(filters);

  const reports = useMemo<ReportItem[]>(() => {
    if (!inspectionPage) return [];
    return inspectionPage.data.map((inspection) => ({
      id: inspection.inspectionId,
      companyName: inspection.business?.nameTh ?? "-",
      businessType: `${inspection.inspectionNo} ${
        inspection.juristic?.nameTh ?? "รายงานตรวจสอบภาคสนาม"
      }`,
      inspectionDateTime: dayjs(inspection.inspectedAt).format("D MMM BBBB - HH:mm น."),
      location: inspection.business?.province ?? "-",
      inspectorName: inspection.officer.fullName,
      category: "hotel" as const,
      region: inspection.business?.province ?? "-",
      detailsHref: `/officer/inspections/${inspection.inspectionId}`,
      exportHref: `/api/officer/inspections/${inspection.inspectionId}/export?format=pdf`,
      updatedAt: inspection.submittedAt,
      itemCount: inspection.itemCount,
    }));
  }, [inspectionPage]);

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
