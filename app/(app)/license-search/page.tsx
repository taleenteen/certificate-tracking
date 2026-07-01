'use client';

import { Suspense, useMemo } from "react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import { useSearchParams } from "next/navigation";

import { LicenseSearchPageView } from "@/components/app/licenses/license-search-page";
import type { LicenseCardItem } from "@/components/app/licenses/license-certificate-card";
import type { StatusBadgeStatus } from "@/components/shared/StatusBadge";
import { useLicenses, useCitizenLicensesSearchGrouped } from "@/hooks/useLicenses";
import { useMyProfile } from "@/hooks/useMyProfile";
import { useOfficerLicenses } from "@/hooks/useOfficer";

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

function LicenseSearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const licenseNumber = searchParams.get("licenseNumber") || "";

  const { data: profile, isLoading: isProfileLoading } = useMyProfile();
  const isOfficer = profile?.roles?.includes("officer");

  // VERSION NOTE: There are 2 versions of search:
  // 1. Flat search list (useCitizenLicensesSearch)
  // 2. Grouped-by-business search (useCitizenLicensesSearchGrouped)
  // We use Version 2 (Grouped) per request.
  const { data: citizenData, isLoading: isCitizenLoading, isError: isCitizenError } = useCitizenLicensesSearchGrouped(
    { q, licenseNumber },
    !isOfficer && !!(q || licenseNumber)
  );
  const { data: officerData, isLoading: isOfficerLoading, isError: isOfficerError } = useOfficerLicenses(
    { q, licenseNumber },
    !!isOfficer && !!(q || licenseNumber)
  );

  const isLoading = isProfileLoading || (isOfficer ? isOfficerLoading : isCitizenLoading);
  const isError = isOfficer ? isOfficerError : isCitizenError;

  const items = useMemo<GroupedBusinessItem[]>(() => {
    if (isOfficer) {
      if (!officerData?.data) return [];
      const groupsMap: Record<string, GroupedBusinessItem> = {};
      officerData.data.forEach((lib) => {
        const bus = lib.business;
        if (!groupsMap[bus.id]) {
          groupsMap[bus.id] = {
            id: bus.id,
            nameTh: bus.nameTh,
            province: bus.province,
            licenseCount: 0,
            licenses: [],
          };
        }

        let uiStatus: StatusBadgeStatus = "active";
        if (lib.status === "EXPIRED") uiStatus = "expired";
        if (lib.status === "SUSPENDED" || lib.status === "REVOKED") uiStatus = "suspended";
        const expiryDate = dayjs(lib.expiresAt);
        if (lib.status === "ACTIVE" && lib.expiresAt && expiryDate.isBefore(dayjs().add(30, "day"))) {
          uiStatus = "expiringSoon";
        }

        groupsMap[bus.id].licenses.push({
          id: lib.id,
          licenseNumber: lib.licenseNumber,
          status: uiStatus,
          issuedAt: dayjs(lib.issuedAt).format("D ม.ค. BBBB"),
          expiresAt: lib.expiresAt ? dayjs(lib.expiresAt).format("D ม.ค. BBBB") : "ไม่มีวันหมดอายุ",
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
        });
        groupsMap[bus.id].licenseCount = groupsMap[bus.id].licenses.length;
      });
      return Object.values(groupsMap);
    } else {
      if (!citizenData?.data) return [];
      return citizenData.data.map((bus) => {
        return {
          id: bus.id,
          nameTh: bus.nameTh,
          province: bus.province,
          licenseCount: bus.licenseCount,
          licenses: bus.licenses.map((lib) => {
            let uiStatus: StatusBadgeStatus = "active";
            if (lib.status === "EXPIRED") uiStatus = "expired";
            if (lib.status === "SUSPENDED" || lib.status === "REVOKED") uiStatus = "suspended";
            const expiryDate = dayjs(lib.expiresAt);
            if (lib.status === "ACTIVE" && lib.expiresAt && expiryDate.isBefore(dayjs().add(30, "day"))) {
              uiStatus = "expiringSoon";
            }

            return {
              id: lib.id,
              licenseNumber: lib.licenseNumber,
              status: uiStatus,
              issuedAt: dayjs(lib.issuedAt).format("D ม.ค. BBBB"),
              expiresAt: lib.expiresAt ? dayjs(lib.expiresAt).format("D ม.ค. BBBB") : "ไม่มีวันหมดอายุ",
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
            };
          }),
        };
      });
    }
  }, [isOfficer, officerData, citizenData]);

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
