'use client';

import {
  EXPIRED_LICENSE_TABS,
  LegacyLicenseListPageView,
} from "@/components/app/licenses/license-list-page";
import type { LicenseCardItem } from "@/components/app/licenses/license-certificate-card";
import { useLicenses } from "@/hooks/useLicenses";
import { useMemo } from "react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

dayjs.extend(buddhistEra);
dayjs.locale("th");

export default function ExpiredLicensesPage() {
  const { data: licenses, isLoading, isError } = useLicenses();

  const expiredLicenses = useMemo<LicenseCardItem[]>(() => {
    if (!licenses) return [];
    return licenses
      .filter((l) => l.status === "EXPIRED" || l.status === "SUSPENDED" || l.status === "REVOKED")
      .map((lib) => ({
        id: lib.id,
        holderName: lib.business.nameTh,
        licenseName: lib.licenseType.nameTh,
        licenseNumber: lib.licenseNumber,
        status: lib.status === "EXPIRED" ? "expired" : "suspended",
        issuedAt: dayjs(lib.issuedAt).format("D MMM BBBB"),
        expiresAt: lib.expiresAt ? dayjs(lib.expiresAt).format("D MMM BBBB") : "ไม่มีวันหมดอายุ",
        previewUrl: lib.previewUrl,
        previewType: "document" as const,
        detailsHref: `/licenses/${lib.id}`,
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

  return (
    <LegacyLicenseListPageView
      items={expiredLicenses}
      defaultTab="all"
      tabs={EXPIRED_LICENSE_TABS}
    />
  );
}
