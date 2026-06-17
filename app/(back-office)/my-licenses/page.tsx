"use client";

import {
  LicenseListPageView,
  MY_LICENSE_TABS,
} from "@/components/back-office/license-list-page";
import type { LicenseCardItem } from "@/components/back-office/license-certificate-card";
import { useLicenses, LicenseResponse } from "@/hooks/useLicenses";
import { useMemo } from "react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

dayjs.extend(buddhistEra);
dayjs.locale("th");

export default function MyLicensesPage() {
  const { data: licenses, isLoading, isError } = useLicenses();

  const formattedLicenses = useMemo<LicenseCardItem[]>(() => {
    if (!licenses) return [];

    return licenses.map((lib: LicenseResponse) => {
      // Map API status to UI status
      // API: ACTIVE, EXPIRED, SUSPENDED, REVOKED, PENDING
      // UI: active, expired, suspended, expiringSoon
      let uiStatus: any = "active";
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
        issuedAt: dayjs(lib.issuedAt).format("D MMM BBBB"),
        expiresAt: dayjs(lib.expiresAt).format("D MMM BBBB"),
        previewType: "document",
        detailsHref: `/my-licenses/${lib.id}`,
      };
    });
  }, [licenses]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB]">
        <p className="text-slate-500 animate-pulse">กำลังโหลดข้อมูลใบอนุญาต...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB]">
        <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-sm mx-4">
          <p className="text-destructive font-semibold mb-2">เกิดข้อผิดพลาด</p>
          <p className="text-sm text-slate-500">ไม่สามารถดึงข้อมูลใบอนุญาตได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง</p>
        </div>
      </div>
    );
  }

  return (
    <LicenseListPageView
      items={formattedLicenses}
      defaultTab="all"
      tabs={MY_LICENSE_TABS}
    />
  );
}
