'use client';

import { use } from "react";
import { notFound, useSearchParams } from "next/navigation";
import { LicenseDetailPageView } from "@/components/back-office/license-detail-page";
import { useLicense } from "@/hooks/useLicense";
import { useIsStaff } from "@/hooks/useIsStaff";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import type { StatusBadgeStatus } from "@/components/shared/StatusBadge";
import type { LicenseDetailData } from "@/components/back-office/license-data";
import licenseImg from "@/assets/license.png";

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

function LicenseDetailContent({ id, hideVerify }: { id: string; hideVerify?: boolean }) {
  const { data, isLoading, isError } = useLicense(id);
  const isStaff = useIsStaff();

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
    previewImage: licenseImg,
    businessName: data.business.nameTh,
    businessType: data.licenseType.nameTh,
    address: data.business.address,
    // MOCK: owner contact details mock data
    ownerName: "นายประสิทธิ์ ตั้งมั่น",
    phoneNumber: "081-234-5678",
    email: "prasit.t@metalworks.co.th",
    // MOCK: inspection history / comment timeline updates mock data
    inspectionDate: dayjs().format("D MMM BBBB"),
    inspectorName: "เจ้าหน้าที่อาวุโส DIW",
    timeline: [
      {
        id: "1",
        date: dayjs().format("D MMM BBBB"),
        title: "อัปเดตสถานะ: มีผลใช้งาน (ACTIVE)",
        description: "เจ้าหน้าที่เข้าตรวจสอบหน้างาน ไม่พบข้อขัดข้อง เอกสารถูกต้องตามเกณฑ์มาตรฐานโรงงานประเภท ร.ง.4",
        current: true,
      },
      {
        id: "2",
        date: dayjs().subtract(1, 'month').format("D MMM BBBB"),
        title: "อัปเดตสถานะ: ระงับชั่วคราว (SUSPENDED)",
        description: "เจ้าหน้าที่ได้ระงับการใช้งานชั่วคราวเนื่องจากค้างชำระค่าธรรมเนียมรายปี เจ้าผู้ประกอบการดำเนินการชำระเรียบร้อยแล้วเมื่อวันที่ 15 พ.ค. 2569",
        current: false,
      }
    ],
  };

  if (data.status === "SUSPENDED" && data.suspensionReason) {
    // Surface suspension reason in the purpose field
    detail.purpose = `${data.licenseType.nameTh} — ถูกระงับ: ${data.suspensionReason}`;
  }

  return <LicenseDetailPageView data={detail} isStaff={isStaff} rawApiStatus={data.status} hideVerify={hideVerify} />;
}

export default function MyLicenseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const hideVerify = searchParams.get("hideVerify") === "true";

  if (!slug) notFound();

  return <LicenseDetailContent id={slug} hideVerify={hideVerify} />;
}
