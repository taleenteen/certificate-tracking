import { Suspense } from "react";
import VerifyOfficerContent from "@/components/app/officer/verify-officer-content";

export const metadata = {
  title: "ตรวจสอบเจ้าหน้าที่ | E-License Verification Platform",
  description: "ระบบตรวจสอบข้อมูลและสถานะการได้รับอนุญาตของเจ้าหน้าที่ตรวจสอบใบอนุญาต",
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// DECISION: Next.js Server Component page wrapping client UI with dynamic search parameter resolved values.
export default async function VerifyOfficerPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const stateParam = typeof resolvedSearchParams.state === "string" ? resolvedSearchParams.state : "success";

  return (
    <Suspense fallback={<div className="p-6 text-center text-xs text-slate-500 font-semibold">กำลังโหลดข้อมูล...</div>}>
      <VerifyOfficerContent initialState={stateParam} />
    </Suspense>
  );
}
