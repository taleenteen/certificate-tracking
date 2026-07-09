import type { LicensePreviewType } from "./license-preview";
import type { StatusBadgeStatus } from "@/components/shared/StatusBadge";
import type { StaticImageData } from "next/image";

export type LicenseTimelineItem = {
  id: string;
  date: string;
  title: string;
  description: string;
  current?: boolean;
};

export type LicenseDetailData = {
  id: string;
  slug: string;
  licenseNumber: string;
  licenseName: string;
  purpose: string;
  status: StatusBadgeStatus;
  issuedAt: string;
  expiresAt: string;
  previewType: LicensePreviewType;
  previewImage?: StaticImageData;
  businessName: string;
  businessId?: string;
  businessType: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  ownershipType?: "INDIVIDUAL" | "JURISTIC";
  ownerName: string;
  phoneNumber: string;
  email: string;
  inspectionDate: string;
  inspectorName: string;
  timeline: LicenseTimelineItem[];
};

export const mockLicenseDetails: Record<string, LicenseDetailData> = {
  "1": {
    id: "license-1",
    slug: "1",
    licenseNumber: "5621-17/965",
    licenseName: "ใบอนุญาตประกอบกิจการร้านอาหาร",
    purpose: "ใบอนุญาตประกอบกิจการร้านอาหาร",
    status: "active",
    issuedAt: "15 ม.ค. 2567",
    expiresAt: "14 ม.ค. 2570",
    previewType: "document",
    businessName: "ร้านอาหารสมชายริมน้ำ",
    businessType: "ร้านอาหาร",
    address: "123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพมหานคร 10110",
    ownerName: "สมชาย ใจดี",
    phoneNumber: "02-123-4567",
    email: "contact@sawadee.com",
    inspectionDate: "20/02/2569",
    inspectorName: "นายสมชาย ใจดี",
    timeline: [
      {
        id: "timeline-1",
        date: "1 ก.พ. 2567",
        title: "ตรวจสอบ ผ่านตามเกณฑ์",
        description:
          "ตรวจสอบสถานประกอบการประจำปี พบว่ามีการปฏิบัติตามข้อกำหนดด้านเอกสารและสภาพแวดล้อมครบถ้วน",
        current: true,
      },
      {
        id: "timeline-2",
        date: "15 ม.ค. 2567",
        title: "ตรวจสอบ นัดหมายแล้ว",
        description:
          "ระบบบันทึกการนัดหมายตรวจสอบร่วมกับเจ้าหน้าที่ พร้อมยืนยันช่วงเวลาและผู้ประสานงานของสถานประกอบการ",
      },
      {
        id: "timeline-3",
        date: "16 ม.ค. 2566",
        title: "ตรวจสอบ เอกสารครบถ้วน",
        description:
          "ตรวจรับเอกสารคำขอครั้งแรกครบถ้วนตามเงื่อนไข สามารถดำเนินการในขั้นตอนออกใบอนุญาตต่อได้",
      },
    ],
  },
  "2": {
    id: "license-2",
    slug: "2",
    licenseNumber: "อย.11-2566-04567",
    licenseName: "ใบอนุญาตผลิตอาหารเพื่อการจำหน่าย",
    purpose: "ใบอนุญาตผลิตอาหารเพื่อการจำหน่าย",
    status: "expiringSoon",
    issuedAt: "1 ก.ค. 2564",
    expiresAt: "30 มิ.ย. 2568",
    previewType: "seal",
    businessName: "บริษัท ไทยรุ่งอุตสาหกรรมอาหาร จำกัด",
    businessType: "โรงงานผลิตอาหาร",
    address: "88/9 ถนนสุขุมวิท ตำบลบางพระ อำเภอศรีราชา ชลบุรี 20110",
    ownerName: "บริษัท ไทยรุ่งอุตสาหกรรมอาหาร จำกัด",
    phoneNumber: "038-123-456",
    email: "license@thairungfood.co.th",
    inspectionDate: "22/02/2569",
    inspectorName: "นางสาวกมลชนก พรหมมา",
    timeline: [
      {
        id: "timeline-4",
        date: "10 มิ.ย. 2568",
        title: "แจ้งเตือนใกล้หมดอายุ",
        description:
          "ระบบแจ้งเตือนใบอนุญาตใกล้ครบกำหนด พร้อมแนะนำให้ยื่นต่ออายุล่วงหน้าตามระยะเวลาที่กำหนด",
        current: true,
      },
      {
        id: "timeline-5",
        date: "15 พ.ค. 2567",
        title: "ตรวจสอบ ผ่านตามเกณฑ์",
        description:
          "เจ้าหน้าที่ตรวจประเมินสายการผลิตและสุขลักษณะ พบว่าเป็นไปตามมาตรฐานที่กำหนด",
      },
      {
        id: "timeline-6",
        date: "1 ก.ค. 2564",
        title: "ออกใบอนุญาต",
        description:
          "อนุมัติคำขอและออกใบอนุญาตให้ดำเนินกิจการผลิตอาหารเพื่อการจำหน่ายอย่างเป็นทางการ",
      },
    ],
  },
  "3": {
    id: "license-3",
    slug: "3",
    licenseNumber: "รม-2565-1288",
    licenseName: "ใบอนุญาตประกอบกิจการโรงแรม",
    purpose: "ใบอนุญาตประกอบกิจการโรงแรม",
    status: "active",
    issuedAt: "10 ต.ค. 2565",
    expiresAt: "9 ต.ค. 2568",
    previewType: "document",
    businessName: "โรงแรมสวัสดี เพลส",
    businessType: "โรงแรม",
    address: "9/11 ถนนนิมมานเหมินทร์ ตำบลสุเทพ อำเภอเมืองเชียงใหม่ เชียงใหม่ 50200",
    ownerName: "โรงแรมสวัสดี เพลส",
    phoneNumber: "053-555-999",
    email: "hello@sawadeeplace.com",
    inspectionDate: "25/02/2569",
    inspectorName: "นายปกรณ์ ศรีสุข",
    timeline: [
      {
        id: "timeline-7",
        date: "20 ก.พ. 2567",
        title: "ตรวจสอบ ผ่านตามเกณฑ์",
        description:
          "ผลตรวจล่าสุดยืนยันการดำเนินการตามมาตรฐานความปลอดภัยและเอกสารกำกับกิจการครบถ้วน",
        current: true,
      },
      {
        id: "timeline-8",
        date: "10 ต.ค. 2566",
        title: "ต่ออายุใบอนุญาต",
        description:
          "ระบบบันทึกการต่ออายุใบอนุญาตประจำรอบปีเรียบร้อย พร้อมปรับวันสิ้นสุดการอนุญาตใหม่",
      },
      {
        id: "timeline-9",
        date: "10 ต.ค. 2565",
        title: "ออกใบอนุญาต",
        description:
          "หน่วยงานอนุมัติคำขอและออกใบอนุญาตประกอบกิจการโรงแรมให้แก่ผู้ประกอบการ",
      },
    ],
  },
};

export function getMockLicenseDetail(slug: string) {
  return mockLicenseDetails[slug];
}
