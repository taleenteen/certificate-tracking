"use client";

import { useMemo } from "react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import { toast } from "sonner";

import { LicenseListPageView } from "@/components/app/licenses/license-list-page";
import type { LicenseCardItem } from "@/components/app/licenses/license-certificate-card";
import type { StatusBadgeStatus } from "@/components/shared/StatusBadge";
import {
  useLicenses,
  useDevSeedLicense,
  useJuristicMemberships,
  type LicenseResponse,
} from "@/hooks/useLicenses";
import { useSwitchContext } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";

dayjs.extend(buddhistEra);
dayjs.locale("th");

export default function MyLicensesPage() {
  const activeJuristicId = useAuthStore((s) => s.activeJuristicId);

  const { data: licenses, isLoading, isError } = useLicenses();
  const { data: memberships = [] } = useJuristicMemberships();
  const switchContext = useSwitchContext();
  const { mutate: seedLicense, isPending: isSeeding } = useDevSeedLicense();

  const activeTab = activeJuristicId ? "juristic" : "personal";

  const formattedLicenses = useMemo<LicenseCardItem[]>(() => {
    if (!licenses) return [];

    return licenses.map((lib: LicenseResponse) => {
      // Map API status to UI status
      // API: ACTIVE, EXPIRED, SUSPENDED, REVOKED, PENDING
      // UI: active, expired, suspended, expiringSoon
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
        issuedAt: dayjs(lib.issuedAt).format("D ม.ค. BBBB"), // matches dynamic Thai formatting
        expiresAt: lib.expiresAt ? dayjs(lib.expiresAt).format("D ม.ค. BBBB") : "ไม่มีวันหมดอายุ",
        detailsHref: `/licenses/${lib.id}`,
      };
    });
  }, [licenses]);

  const handleTabChange = (tab: "personal" | "juristic") => {
    if (tab === "personal") {
      switchContext.mutate(null);
    } else {
      if (memberships.length > 0) {
        // If we have companies, switch to the first one as default
        const defaultCompanyId = memberships[0].juristicId;
        switchContext.mutate(defaultCompanyId);
      } else {
        toast.error("ไม่พบข้อมูลนิติบุคคลที่เกี่ยวข้องกับบัญชีของท่าน");
      }
    }
  };

  const handleSwitchJuristicCompany = (juristicId: string | null) => {
    switchContext.mutate(juristicId);
  };

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
      items={formattedLicenses}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      memberships={memberships}
      activeJuristicId={activeJuristicId}
      onSwitchJuristicCompany={handleSwitchJuristicCompany}
      isSwitching={switchContext.isPending}
      devSeedButton={
        <Button
          variant="outline"
          size="sm"
          onClick={() => seedLicense()}
          disabled={isSeeding}
          className="text-xs border-dashed border-slate-300 text-slate-500 hover:text-slate-700 bg-white"
        >
          {isSeeding ? "กำลังสร้าง..." : "[DEV] สร้างใบอนุญาตทดสอบ"}
        </Button>
      }
    />
  );
}
