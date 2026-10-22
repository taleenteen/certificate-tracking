"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import {
  BusinessesPageDetailView,
  type BusinessDetailData,
} from "@/components/app/businesses/business-detail-page";
import { useBusiness } from "@/hooks/useBusinesses";
import { MOCK_BUSINESSES } from "@/constants/mock-businesses";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import type { StatusBadgeStatus } from "@/components/shared/StatusBadge";

dayjs.extend(buddhistEra);
dayjs.locale("th");

function toDocStatus(
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

function BusinessDetailContent({ id }: { id: string }) {
  const isMock = id.startsWith("mock-est-");
  const mockItem = isMock ? MOCK_BUSINESSES.find((m) => m.id === id) : null;

  const publicQuery = useBusiness(isMock ? "" : id);

  if (isMock && mockItem) {
    const detail: BusinessDetailData = {
      companyName: mockItem.nameTh,
      businessName: mockItem.nameTh,
      address: mockItem.address,
      latitude: mockItem.latitude,
      longitude: mockItem.longitude,
      phoneNumber: "02-123-4567",
      email: `contact@${mockItem.id.split("-").pop() || "business"}.com`,
      documents: [
        {
          id: mockItem.id + "-lic-1",
          title: mockItem.businessType,
          licenseNumber: "ก 1234-56/789",
          status: "active",
          issuedAt: "1 ม.ค. 2568",
          expiresAt: "31 ธ.ค. 2570",
          agencyId: null,
        },
      ],
    };
    return <BusinessesPageDetailView data={detail} />;
  }

  const isLoading = !isMock && publicQuery.isLoading;
  const isError = !isMock && publicQuery.isError;
  const activeData = publicQuery.data;

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB]">
        <p className="text-slate-500 animate-pulse">
          กำลังโหลดข้อมูลสถานประกอบการ...
        </p>
      </div>
    );
  }

  if (isError || !activeData) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#F9FAFB]">
        <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-sm mx-4">
          <p className="text-destructive font-semibold mb-2">เกิดข้อผิดพลาด</p>
          <p className="text-sm text-slate-500">
            ไม่พบข้อมูลสถานประกอบการ กรุณาลองใหม่อีกครั้ง
          </p>
        </div>
      </div>
    );
  }

  const companyName = activeData.nameTh;
  const businessName = activeData.nameTh;
  const phoneNumber = activeData.phone || "-";
  const email = activeData.email || "-";

  const detail: BusinessDetailData = {
    companyName,
    businessName,
    address: activeData.address,
    latitude: activeData.latitude === null ? null : Number(activeData.latitude),
    longitude:
      activeData.longitude === null ? null : Number(activeData.longitude),
    phoneNumber,
    email,
    documents: activeData.licenses.map((lic) => ({
      id: lic.id,
      title: lic.licenseType.nameTh,
      licenseNumber: lic.licenseNumber,
      status: toDocStatus(lic.status, lic.expiresAt),
      issuedAt: dayjs(lic.issuedAt).format("D ม.ค. BBBB"),
      expiresAt: lic.expiresAt
        ? dayjs(lic.expiresAt).format("D ม.ค. BBBB")
        : "ไม่มีวันหมดอายุ",
      agencyId: lic.licenseType.agencyId,
      previewUrl: lic.previewUrl,
    })),
  };

  return <BusinessesPageDetailView data={detail} />;
}

export default function BusinessDetailPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = use(params);

  if (!businessId) notFound();

  return <BusinessDetailContent id={businessId} />;
}
