"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

import { LicenseListPageView } from "@/components/app/licenses/license-list-page";
import type { LicenseCardItem } from "@/components/app/licenses/license-certificate-card";
import type { StatusBadgeStatus } from "@/components/shared/StatusBadge";
import {
  useLicenses,
  useDevSeedLicense,
  useJuristicLicenseGroups,
  useDevSeedJuristicLicense,
  type LicenseResponse,
} from "@/hooks/useLicenses";
import { useSwitchContext } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";

dayjs.extend(buddhistEra);
dayjs.locale("th");

export default function MyLicensesPage() {
  const activeJuristicId = useAuthStore((s) => s.activeJuristicId);
  const [activeTab, setActiveTab] = useState<"personal" | "juristic">(
    activeJuristicId ? "juristic" : "personal"
  );

  const { data: personalLicenses = [], isLoading: isPersonalLoading, isError: isPersonalError } = useLicenses();
  const { data: juristicGroups = [], isLoading: isJuristicLoading, isError: isJuristicError } = useJuristicLicenseGroups();
  const switchContext = useSwitchContext();
  const { mutate: seedLicense, isPending: isSeeding } = useDevSeedLicense();
  const { mutate: seedJuristicLicense, isPending: isSeedingJuristic } = useDevSeedJuristicLicense();

  const formattedPersonalLicenses = useMemo<LicenseCardItem[]>(() => {
    return personalLicenses.map((lib: LicenseResponse) => {
      let uiStatus: StatusBadgeStatus = "active";
      if (lib.status === "EXPIRED") uiStatus = "expired";
      if (lib.status === "SUSPENDED" || lib.status === "REVOKED") uiStatus = "suspended";

      const expiryDate = dayjs(lib.expiresAt);
      if (lib.status === "ACTIVE" && lib.expiresAt && expiryDate.isBefore(dayjs().add(30, "day"))) {
        uiStatus = "expiringSoon";
      }

      return {
        id: lib.id,
        holderName: lib.business.nameTh,
        licenseName: lib.licenseType.nameTh,
        licenseNumber: lib.licenseNumber,
        status: uiStatus,
        issuedAt: dayjs(lib.issuedAt).format("D ม.ค. BBBB"),
        expiresAt: lib.expiresAt ? dayjs(lib.expiresAt).format("D ม.ค. BBBB") : "ไม่มีวันหมดอายุ",
        detailsHref: `/licenses/${lib.id}`,
      };
    });
  }, [personalLicenses]);

  const handleTabChange = (tab: "personal" | "juristic") => {
    setActiveTab(tab);
    if (tab === "personal" && activeJuristicId !== null) {
      switchContext.mutate(null);
    }
  };

  const isLoading = activeTab === "personal" ? isPersonalLoading : isJuristicLoading;
  const isError = activeTab === "personal" ? isPersonalError : isJuristicError;

  const devSeedButton = useMemo(() => {
    if (activeTab === "personal") {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => seedLicense()}
          disabled={isSeeding}
          className="text-xs border-dashed border-slate-300 text-slate-500 hover:text-slate-700 bg-white"
        >
          {isSeeding ? "กำลังสร้าง..." : "[DEV] สร้างใบอนุญาตทดสอบ"}
        </Button>
      );
    } else {
      // Only show the juristic seed button when there are no juristic groups yet
      if (juristicGroups.length > 0) return null;
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => seedJuristicLicense()}
          disabled={isSeedingJuristic}
          className="text-xs border-dashed border-slate-300 text-slate-500 hover:text-slate-700 bg-white"
        >
          {isSeedingJuristic ? "กำลังสร้าง..." : "สร้างข้อมูลนิติบุคคลตัวอย่าง"}
        </Button>
      );
    }
  }, [activeTab, seedLicense, isSeeding, seedJuristicLicense, isSeedingJuristic, juristicGroups]);

  if (isLoading && !switchContext.isPending) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#f4f5f7]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#145b57] border-t-transparent" />
          <p className="text-slate-500 text-xs animate-pulse">กำลังโหลดข้อมูลใบอนุญาต...</p>
        </div>
      </div>
    );
  }

  if (isError && !switchContext.isPending) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#f4f5f7]">
        <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-sm mx-4 text-left">
          <p className="text-destructive font-bold mb-2">เกิดข้อผิดพลาด</p>
          <p className="text-sm text-slate-500 mb-4">
            ไม่สามารถดึงข้อมูลใบอนุญาตได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง
          </p>
        </div>
      </div>
    );
  }

  return (
    <LicenseListPageView
      personalLicenses={formattedPersonalLicenses}
      juristicGroups={juristicGroups}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      devSeedButton={devSeedButton}
    />
  );
}
