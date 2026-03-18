import {
  EXPIRED_LICENSE_TABS,
  LicenseListPageView,
} from "@/components/back-office/license-list-page";
import type { LicenseCardItem } from "@/components/back-office/license-certificate-card";

const mockExpiredLicenses: LicenseCardItem[] = [
  {
    id: "expired-1",
    holderName: "นายสมชาย ใจดี",
    licenseName: "ใบอนุญาตประกอบกิจการร้านอาหาร",
    licenseNumber: "5621-17/965",
    status: "suspended",
    issuedAt: "15 ม.ค. 2567",
    expiresAt: "14 ม.ค. 2570",
    previewType: "document",
    detailsHref: "/expired-licenses/1",
  },
  {
    id: "expired-2",
    holderName: "บริษัท ไทยรุ่งอุตสาหกรรมอาหาร จำกัด",
    licenseName: "ใบอนุญาตผลิตอาหารเพื่อการจำหน่าย",
    licenseNumber: "อย.11-2566-04567",
    status: "expired",
    issuedAt: "1 ก.ค. 2564",
    expiresAt: "30 มิ.ย. 2568",
    previewType: "seal",
    detailsHref: "/expired-licenses/2",
  },
  {
    id: "expired-3",
    holderName: "โรงแรมริเวอร์ไซด์",
    licenseName: "ใบอนุญาตประกอบกิจการโรงแรม",
    licenseNumber: "รม-2564-1123",
    status: "expired",
    issuedAt: "2 มี.ค. 2564",
    expiresAt: "1 มี.ค. 2567",
    previewType: "document",
    detailsHref: "/expired-licenses/3",
  },
];

export default function ExpiredLicensesPage() {
  return (
    <LicenseListPageView
      items={mockExpiredLicenses}
      defaultTab="all"
      tabs={EXPIRED_LICENSE_TABS}
    />
  );
}
