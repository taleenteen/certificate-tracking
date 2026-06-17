'use client';

import { use } from "react";
import { notFound } from "next/navigation";
import { LicenseDetailPageView } from "@/components/back-office/license-detail-page";
import { useLicense } from "@/hooks/useLicense";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import type { StatusBadgeStatus } from "@/components/shared/StatusBadge";
import type { LicenseDetailData } from "@/components/back-office/license-data";

dayjs.extend(buddhistEra);
dayjs.locale("th");

function formatDate(iso: string | null): string {
  if (!iso) return "ไม่มีวันหมดอายุ (ชำระค่าธรรมเนียมรายปี)"; // RNG4 rule
  return dayjs(iso).format("D MMM BBBB");
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
  )
    return "expiringSoon";
  return "active";
}

function LicenseDetailContent({ id }: { id: string }) {
  const { data, isLoading, isError } = useLicense(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB]">
        <p className="text-slate-500 animate-pulse">กำลังโหลดข้อมูลใบอนุญาต...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB]">
        <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-sm mx-4">
          <p className="text-destructive font-semibold mb-2">เกิดข้อผิดพลาด</p>
          <p className="text-sm text-slate-500">ไม่พบข้อมูลใบอนุญาต กรุณาลองใหม่อีกครั้ง</p>
        </div>
      </div>
    );
  }

  const detail: LicenseDetailData = {
    id: data.id,
    slug: data.id,
    licenseNumber: data.licenseNumber,
    licenseName: data.licenseType.nameTh,
    purpose: data.licenseType.nameTh,
    status: toUiStatus(data.status, data.expiresAt),
    issuedAt: formatDate(data.issuedAt),
    expiresAt: formatDate(data.expiresAt),
    previewType: "document",
    businessName: data.business.nameTh,
    businessType: data.licenseType.nameTh,
    address: data.business.address,
    // TODO(api-gap): owner contact details not in GET /licenses/{id} response
    ownerName: "-",
    phoneNumber: "-",
    email: "-",
    // TODO(api-gap): inspection history not in GET /licenses/{id} response
    inspectionDate: "-",
    inspectorName: "-",
    timeline: [],
  };

  if (data.status === "SUSPENDED" && data.suspensionReason) {
    // Surface suspension reason in the purpose field
    detail.purpose = `${data.licenseType.nameTh} — ถูกระงับ: ${data.suspensionReason}`;
  }

  return <LicenseDetailPageView data={detail} />;
}

export default function MyLicenseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  if (!slug) notFound();

  return <LicenseDetailContent id={slug} />;
}
