import {
  LicenseListPageView,
  MY_LICENSE_TABS,
} from "@/components/back-office/license-list-page";
import type { LicenseCardItem } from "@/components/back-office/license-certificate-card";

const mockMyLicenses: LicenseCardItem[] = [
  {
    id: "license-1",
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
    id: "license-2",
    holderName: "บริษัท ไทยรุ่งอุตสาหกรรมอาหาร จำกัด",
    licenseName: "ใบอนุญาตผลิตอาหารเพื่อการจำหน่าย",
    licenseNumber: "อย.11-2566-04567",
    status: "expiringSoon",
    issuedAt: "1 ก.ค. 2564",
    expiresAt: "30 มิ.ย. 2568",
    previewType: "seal",
    detailsHref: "/my-licenses/2",
  },
  {
    id: "license-3",
    holderName: "โรงแรมสวัสดี เพลส",
    licenseName: "ใบอนุญาตประกอบกิจการโรงแรม",
    licenseNumber: "รม-2565-1288",
    status: "active",
    issuedAt: "10 ต.ค. 2565",
    expiresAt: "9 ต.ค. 2568",
    previewType: "document",
    detailsHref: "/my-licenses/3",
  },
];

export default function MyLicensesPage() {
  return (
    <LicenseListPageView
      items={mockMyLicenses}
      defaultTab="all"
      tabs={MY_LICENSE_TABS}
    />
  );
}
