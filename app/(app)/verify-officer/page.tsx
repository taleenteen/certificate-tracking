import { Suspense } from "react";
import VerifyOfficerContent from "@/components/app/officer/verify-officer-content";

export const metadata = {
  title: "ตรวจสอบเจ้าหน้าที่ | E-License Verification Platform",
  description: "ระบบตรวจสอบข้อมูลและสถานะการได้รับอนุญาตของเจ้าหน้าที่ตรวจสอบใบอนุญาต",
};

export default function VerifyOfficerPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs text-slate-500 font-semibold">กำลังโหลดข้อมูล...</div>}>
      <VerifyOfficerContent />
    </Suspense>
  );
}
