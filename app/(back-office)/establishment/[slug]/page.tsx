'use client';

import { use } from "react";
import { notFound } from "next/navigation";
import { EstablishmentPageDetailView, type EstablishmentDetailData } from "@/components/back-office/establishment-detail-page";
import { useBusiness } from "@/hooks/useBusinesses";
import { MOCK_ESTABLISHMENTS } from "@/constants/mock-establishments";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import type { StatusBadgeStatus } from "@/components/shared/StatusBadge";

dayjs.extend(buddhistEra);
dayjs.locale("th");

function toDocStatus(status: string, expiresAt: string | null): StatusBadgeStatus {
  if (status === "EXPIRED") return "expired";
  if (status === "SUSPENDED" || status === "REVOKED") return "suspended";
  if (status === "ACTIVE" && expiresAt && dayjs(expiresAt).isBefore(dayjs().add(30, "day")))
    return "expiringSoon";
  return "active";
}

function EstablishmentDetailContent({ id }: { id: string }) {
  const isMock = id.startsWith("mock-est-");
  const mockItem = isMock ? MOCK_ESTABLISHMENTS.find((m) => m.id === id) : null;

  const { data, isLoading, isError } = useBusiness(isMock ? "" : id);

  if (isMock && mockItem) {
    const detail: EstablishmentDetailData = {
      companyName: mockItem.nameTh,
      establishmentName: mockItem.nameTh,
      address: mockItem.address,
      phoneNumber: "02-123-4567",
      email: `contact@${mockItem.id.split("-").pop() || "business"}.com`,
      documents: [
        {
          id: mockItem.id + "-lic-1",
          title: mockItem.businessType,
          status: "active",
          expireDate: "31 ธ.ค. 2570",
        },
      ],
    };
    return <EstablishmentPageDetailView data={detail} />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB]">
        <p className="text-slate-500 animate-pulse">กำลังโหลดข้อมูลสถานประกอบการ...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB]">
        <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-sm mx-4">
          <p className="text-destructive font-semibold mb-2">เกิดข้อผิดพลาด</p>
          <p className="text-sm text-slate-500">ไม่พบข้อมูลสถานประกอบการ กรุณาลองใหม่อีกครั้ง</p>
        </div>
      </div>
    );
  }

  const detail: EstablishmentDetailData = {
    companyName: data.nameTh,
    establishmentName: data.nameTh,
    address: data.address,
    // TODO(api-gap): phone/email not in GET /businesses/{id} response
    phoneNumber: "-",
    email: "-",
    documents: data.licenses.map((lic) => ({
      id: lic.id,
      title: lic.licenseType.nameTh,
      status: toDocStatus(lic.status, lic.expiresAt),
      expireDate: lic.expiresAt ? dayjs(lic.expiresAt).format("D MMM BBBB") : "ไม่มีวันหมดอายุ",
    })),
  };

  return <EstablishmentPageDetailView data={detail} />;
}

export default function EstablishmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  if (!slug) notFound();

  return <EstablishmentDetailContent id={slug} />;
}
