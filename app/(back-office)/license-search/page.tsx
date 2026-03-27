import { Suspense } from "react";
import { LicenseSearchPageView } from "@/components/back-office/license-search-page";
import type { LicenseCardItem } from "@/components/back-office/license-certificate-card";

const mockLicenseSearchItems: LicenseCardItem[] = [
  {
    id: "search-license-1",
    holderName: "นายสมชาย ใจดี",
    licenseName: "ใบอนุญาตประกอบกิจการร้านอาหาร",
    licenseNumber: "5621-17/965",
    status: "active",
    issuedAt: "15 ม.ค. 2567",
    expiresAt: "14 ม.ค. 2570",
    previewType: "document",
    detailsHref: "/my-licenses/1",
  },
  {
    id: "search-license-2",
    holderName: "บริษัท ไทยรุ่งอุตสาหกรรมอาหาร จำกัด",
    licenseName: "ใบอนุญาตผลิตอาหารเพื่อการจำหน่าย",
    licenseNumber: "อย.11-2566-04567",
    status: "expired",
    issuedAt: "1 ก.ค. 2564",
    expiresAt: "30 มิ.ย. 2568",
    previewType: "seal",
    detailsHref: "/expired-licenses/2",
  },
];

export default function LicenseSearchPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <LicenseSearchPageView items={mockLicenseSearchItems} />
    </Suspense>
  );
}

function PageFallback() {
  return <main className="min-h-[calc(100vh-57px)] bg-[#F9FAFB] px-4 py-4" />;
}
