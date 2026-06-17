'use client';

import { Suspense, useMemo } from "react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

import { LicenseSearchPageView } from "@/components/back-office/license-search-page";
import type { LicenseCardItem } from "@/components/back-office/license-certificate-card";
import { useLicenses } from "@/hooks/useLicenses";

dayjs.extend(buddhistEra);
dayjs.locale("th");

function LicenseSearchContent() {
  const { data: licenses, isLoading, isError } = useLicenses();

  const items = useMemo<LicenseCardItem[]>(() => {
    if (!licenses) return [];
    return licenses.map((l) => ({
      id: l.id,
      holderName: l.business.nameTh,
      licenseName: l.licenseType.nameTh,
      licenseNumber: l.licenseNumber,
      status:
        l.status === "ACTIVE"
          ? "active"
          : l.status === "EXPIRED" || l.status === "REVOKED"
            ? "expired"
            : "expired",
      issuedAt: dayjs(l.issuedAt).format("D MMM BBBB"),
      expiresAt: l.expiresAt
        ? dayjs(l.expiresAt).format("D MMM BBBB")
        : "ไม่มีวันหมดอายุ (ชำระค่าธรรมเนียมรายปี)",
      previewType: "document" as const,
      detailsHref: `/my-licenses/${l.id}`,
    }));
  }, [licenses]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB]">
        <p className="text-slate-500 animate-pulse">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB]">
        <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-sm mx-4">
          <p className="text-destructive font-semibold mb-2">เกิดข้อผิดพลาด</p>
          <p className="text-sm text-slate-500">ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง</p>
        </div>
      </div>
    );
  }

  return <LicenseSearchPageView items={items} />;
}

export default function LicenseSearchPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <LicenseSearchContent />
    </Suspense>
  );
}

function PageFallback() {
  return <main className="min-h-[calc(100vh-57px)] bg-[#F9FAFB] px-4 py-4" />;
}
