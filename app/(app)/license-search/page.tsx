'use client';

import { Suspense, useMemo } from "react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

import { LicenseSearchPageView } from "@/components/app/licenses/license-search-page";
import type { LicenseCardItem } from "@/components/app/licenses/license-certificate-card";
import type { StatusBadgeStatus } from "@/components/shared/StatusBadge";
import { useLicenses } from "@/hooks/useLicenses";

dayjs.extend(buddhistEra);
dayjs.locale("th");

function LicenseSearchContent() {
  const { data: licenses, isLoading, isError } = useLicenses();

  const items = useMemo<LicenseCardItem[]>(() => {
    if (!licenses) return [];
    return licenses.map((lib) => {
      let uiStatus: StatusBadgeStatus = "active";
      if (lib.status === "EXPIRED") uiStatus = "expired";
      if (lib.status === "SUSPENDED" || lib.status === "REVOKED") uiStatus = "suspended";

      // Check if expiring soon (within 30 days)
      const expiryDate = dayjs(lib.expiresAt);
      if (lib.status === "ACTIVE" && expiryDate.isBefore(dayjs().add(30, "day"))) {
        uiStatus = "expiringSoon";
      }

      return {
        id: lib.id,
        holderName: lib.business.nameTh,
        licenseName: lib.licenseType.nameTh,
        licenseNumber: lib.licenseNumber,
        status: uiStatus,
        issuedAt: dayjs(lib.issuedAt).format("D ม.ค. BBBB"), // matching dynamic Thai format
        expiresAt: lib.expiresAt ? dayjs(lib.expiresAt).format("D ม.ค. BBBB") : "ไม่มีวันหมดอายุ",
        detailsHref: `/licenses/${lib.id}`,
      };
    });
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
