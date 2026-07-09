'use client';

import { Suspense, useMemo } from "react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import { useSearchParams } from "next/navigation";

import { LicenseSearchPageView } from "@/components/app/licenses/license-search-page";
import type { StatusBadgeStatus } from "@/components/shared/StatusBadge";
import { useCitizenLicensesSearchGrouped } from "@/hooks/useLicenses";

dayjs.extend(buddhistEra);
dayjs.locale("th");

export interface GroupedBusinessItem {
  id: string;
  nameTh: string;
  province: string;
  licenseCount: number;
  licenses: {
    id: string;
    licenseNumber: string;
    status: StatusBadgeStatus;
    issuedAt: string;
    expiresAt: string | null;
    licenseType: {
      id: string;
      code: string;
      nameTh: string;
      agency: {
        id: string;
        code: string;
        nameTh: string;
      };
    };
  }[];
}

function toUiStatus(
  status: string,
  expiresAt: string | null,
): StatusBadgeStatus {
  if (status === "EXPIRED") return "expired";
  if (status === "SUSPENDED" || status === "REVOKED") return "suspended";
  if (
    status === "ACTIVE" &&
    expiresAt &&
    dayjs(expiresAt).isBefore(dayjs().add(30, "day"))
  ) {
    return "expiringSoon";
  }
  return "active";
}

function LicenseSearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim() || "";
  const licenseNumber = searchParams.get("licenseNumber")?.trim() || "";
  const hasQuery = !!(q || licenseNumber);

  // Public home search always uses the citizen grouped endpoint (not officer
  // inspection search). Officers in public mode need the same directory results.
  const { data, isLoading, isError, isFetching } = useCitizenLicensesSearchGrouped(
    { q, licenseNumber, page: 1, limit: 50 },
    hasQuery,
  );

  const items = useMemo<GroupedBusinessItem[]>(() => {
    if (!data?.data) return [];
    return data.data.map((bus) => ({
      id: bus.id,
      nameTh: bus.nameTh,
      province: bus.province,
      licenseCount: bus.licenseCount,
      licenses: bus.licenses.map((lib) => ({
        id: lib.id,
        licenseNumber: lib.licenseNumber,
        status: toUiStatus(lib.status, lib.expiresAt),
        issuedAt: dayjs(lib.issuedAt).format("D MMM BBBB"),
        expiresAt: lib.expiresAt
          ? dayjs(lib.expiresAt).format("D MMM BBBB")
          : "ไม่มีวันหมดอายุ",
        licenseType: {
          id: lib.licenseType.id,
          code: lib.licenseType.code,
          nameTh: lib.licenseType.nameTh,
          agency: {
            id: lib.licenseType.agency.id,
            code: lib.licenseType.agency.code,
            nameTh: lib.licenseType.agency.nameTh,
          },
        },
      })),
    }));
  }, [data]);

  if (hasQuery && (isLoading || isFetching) && items.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB]">
        <p className="text-slate-500 animate-pulse">กำลังค้นหา...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB]">
        <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-sm mx-4">
          <p className="text-destructive font-semibold mb-2">เกิดข้อผิดพลาด</p>
          <p className="text-sm text-slate-500">
            ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง
          </p>
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
