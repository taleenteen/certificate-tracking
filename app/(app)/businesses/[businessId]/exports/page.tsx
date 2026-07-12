"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

import {
  BusinessLicenseExportPage,
} from "@/components/app/businesses/business-license-export-page";
import type { BusinessDetailData } from "@/components/app/businesses/business-detail-page";
import { useBusiness } from "@/hooks/useBusinesses";
import { useIsStaff } from "@/hooks/useIsStaff";
import type { StatusBadgeStatus } from "@/components/shared/StatusBadge";

dayjs.extend(buddhistEra);
dayjs.locale("th");

function toDocStatus(status: string, expiresAt: string | null): StatusBadgeStatus {
  if (status === "EXPIRED") return "expired";
  if (status === "SUSPENDED" || status === "REVOKED") return "suspended";
  if (status === "ACTIVE" && expiresAt && dayjs(expiresAt).isBefore(dayjs().add(30, "day"))) return "expiringSoon";
  return "active";
}

function BusinessExportContent({ businessId }: { businessId: string }) {
  const searchParams = useSearchParams();
  const businessQuery = useBusiness(businessId);
  const isStaff = useIsStaff();

  if (!isStaff) {
    return <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB] text-sm font-semibold text-slate-500">เฉพาะเจ้าหน้าที่เท่านั้นที่สามารถส่งออกใบอนุญาตได้</div>;
  }

  if (businessQuery.isLoading) {
    return <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB] text-sm font-semibold text-slate-500">กำลังโหลดข้อมูลสถานประกอบการ...</div>;
  }

  if (businessQuery.isError || !businessQuery.data) {
    return <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB] text-sm font-semibold text-slate-500">ไม่พบข้อมูลสถานประกอบการ</div>;
  }

  const business = businessQuery.data;
  const data: BusinessDetailData = {
    companyName: business.nameTh,
    businessName: business.nameTh,
    address: business.address,
    latitude: business.latitude === null ? null : Number(business.latitude),
    longitude: business.longitude === null ? null : Number(business.longitude),
    phoneNumber: business.phone || "-",
    email: business.email || "-",
    businessType: business.licenses[0]?.licenseType.nameTh || "โรงงาน",
    registrationId: business.ownership?.registrationId || null,
    documents: business.licenses.map((license) => ({
      id: license.id,
      title: license.licenseType.nameTh,
      licenseNumber: license.licenseNo || license.licenseNumber,
      status: toDocStatus(license.status, license.expiresAt),
      issuedAt: dayjs(license.issuedAt).format("D ม.ค. BBBB"),
      expiresAt: license.expiresAt ? dayjs(license.expiresAt).format("D ม.ค. BBBB") : "ไม่มีวันหมดอายุ",
      agencyId: license.licenseType.agencyId,
      previewUrl: license.previewUrl,
    })),
  };

  return <BusinessLicenseExportPage businessId={businessId} data={data} from={searchParams.get("from")} />;
}

export default function BusinessExportPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = use(params);
  return <BusinessExportContent businessId={businessId} />;
}
