"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  CheckCircle2, 
  AlertCircle, 
  IdCard, 
  Building2, 
  MapPin, 
  Calendar, 
  FileText,
  Check
} from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrScannerDialog } from "@/components/app-shell/qr-scanner-dialog";
import { useVerifyOfficer } from "@/hooks/useOfficer";
import { useNativeQrScanner } from "@/hooks/useNativeQrScanner";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

dayjs.extend(buddhistEra);
dayjs.locale("th");

// DECISION: Custom high-fidelity scanner viewfinder target icon
const ScanIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="shrink-0"
  >
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <path d="M7 12h10" />
  </svg>
);

// DECISION: Dual-state premium layout — valid/invalid based on live API response from GET /api/public/officers/verify/:token
export default function VerifyOfficerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { data: verifyData, isLoading: isVerifyLoading } = useVerifyOfficer(token);

  // Determine active states
  const hasToken = !!token;
  const isSuccess = hasToken ? (verifyData?.valid === true) : false;

  const handleScan = useCallback((value: string) => {
    // Extract token from scanned URL (supports both /verify-officer?token=... and raw token)
    try {
      const url = new URL(value);
      const extractedToken = url.searchParams.get("token");
      if (extractedToken) {
        router.replace(`/verify-officer?token=${encodeURIComponent(extractedToken)}`);
        return;
      }
    } catch {
      // Not a valid URL — treat raw value as token if it looks like one
      if (value && !value.includes(" ")) {
        router.replace(`/verify-officer?token=${encodeURIComponent(value)}`);
        return;
      }
    }
    toast.error("ไม่สามารถอ่าน QR Code ของเจ้าหน้าที่ได้ กรุณาลองใหม่");
  }, [router]);
  const {
    isBrowserScannerOpen,
    setIsBrowserScannerOpen,
    startScanner,
  } = useNativeQrScanner(handleScan);

  const handleConfirm = () => {
    toast.success("ยืนยันตัวตนเจ้าหน้าที่เรียบร้อยแล้ว");
    router.push("/home");
  };

  const officerName = hasToken
    ? (verifyData?.valid ? verifyData.officer.fullName : "—")
    : "นายสมชาย ใจดี";

  const officerAgency = hasToken
    ? (verifyData?.valid ? verifyData.officer.agency.nameTh : "—")
    : "กรมโรงงานอุตสาหกรรม";

  const officerArea = hasToken
    ? (verifyData?.valid ? `ขอบเขตปฏิบัติงานทั่วประเทศ (${verifyData.officer.agency.code})` : "—")
    : "จังหวัดสมุทรปราการ";

  const scannedTime = hasToken
    ? (verifyData ? dayjs(verifyData.scannedAt).format("DD/MM/BBBB HH:mm") : "—")
    : "21/06/2569 16:45";

  // Permissions: new spec returns array of {agencyCode, agencyNameTh, licenseTypeCode, licenseTypeNameTh}
  const officerPermissionsList: string[] = hasToken && verifyData?.valid
    ? verifyData.officer.permissions.map((p) => {
        // Support both old and current API permission payloads.
        const permission = p as unknown as {
          licenseTypeNameTh?: string;
          labelTh?: string;
          licenseTypeCodes?: string[];
          agencyCode?: string;
          agency?: string;
        };
        const label = permission.licenseTypeNameTh
          || permission.labelTh
          || permission.licenseTypeCodes?.join(", ")
          || "";
        const agencyCode = permission.agencyCode || permission.agency || "";
        return agencyCode ? `${label} (${agencyCode})` : label;
      }).filter(Boolean)
    : [];

  // Mapped failure message
  const rawReason = hasToken && !verifyData?.valid ? verifyData?.reason : "";
  const failMessage = rawReason === "INVALID_TOKEN"
    ? "รหัสโทเคนอ้างอิงไม่ถูกต้อง หรือไม่พบข้อมูลเจ้าหน้าที่ในฐานข้อมูลระบบ"
    : rawReason === "EXPIRED_TOKEN"
      ? "QR Code ของเจ้าหน้าที่หมดอายุแล้ว (อายุการใช้งานรหัสจำกัดที่ 60 วินาที)"
      : rawReason === "NOT_OFFICER"
        ? "บัญชีผู้ใช้ที่สแกนไม่มีบทบาทเป็นเจ้าหน้าที่ปฏิบัติงาน"
        : rawReason === "OFFICER_NOT_ACTIVE"
          ? "บัญชีเจ้าหน้าที่ถูกสั่งระงับการปฏิบัติหน้าที่ชั่วคราว"
          : "ไม่สามารถยืนยันตัวตนเจ้าหน้าที่ได้ กรุณาลองใหม่อีกครั้ง";

  if (hasToken && isVerifyLoading) {
    return (
      <main className="min-h-screen bg-[#f4f5f7] px-4 py-4 pb-24 text-slate-900 text-left flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0c604c] mx-auto"></div>
          <p className="text-xs text-slate-500 font-semibold">กำลังตรวจสอบข้อมูลเจ้าหน้าที่...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7] px-4 py-4 pb-24 text-slate-900 text-left">
      <div className="mx-auto max-w-[430px] space-y-4">
        {/* Main Card */}
        <Card className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between min-h-[460px]">
          
          {/* Top Banner Status */}
          <div className="text-center pt-4 pb-6 space-y-3">
            {isSuccess ? (
              <>
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-[#0c604c]">
                    <CheckCircle2 className="h-12 w-12 stroke-[2.2]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h1 className="text-[20px] font-extrabold text-[#0c604c] tracking-tight">
                    เป็นเจ้าหน้าที่ที่ได้รับอนุญาต
                  </h1>
                  <p className="text-[12px] text-slate-400 font-semibold">
                    ข้อมูลยืนยันจากระบบแบบ Real-time
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                    <AlertCircle className="h-12 w-12 stroke-[2.2]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h1 className="text-[20px] font-extrabold text-rose-600 tracking-tight">
                    ไม่พบข้อมูลของเจ้าหน้าที่
                  </h1>
                  <p className="text-[12px] text-slate-400 font-semibold px-4 leading-normal mt-0.5">
                    {failMessage}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Details Section */}
          <div className="flex-1 space-y-4 py-4">
            {isSuccess ? (
              <>
                {/* Row 1: ชื่อเจ้าหน้าที่ */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 text-slate-500 font-bold">
                      <IdCard className="h-4.5 w-4.5 text-[#0c604c] shrink-0" />
                      <span>ชื่อเจ้าหน้าที่</span>
                    </div>
                    <span className="font-extrabold text-slate-800 text-right">
                      {officerName}
                    </span>
                  </div>
                  <div className="border-b border-dashed border-slate-200/80 w-full" />
                </div>

                {/* Row 2: หน่วยงาน */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 text-slate-500 font-bold">
                      <Building2 className="h-4.5 w-4.5 text-[#0c604c] shrink-0" />
                      <span>หน่วยงาน</span>
                    </div>
                    <span className="font-extrabold text-slate-800 text-right">
                      {officerAgency}
                    </span>
                  </div>
                  <div className="border-b border-dashed border-slate-200/80 w-full" />
                </div>

                {/* Row 3: พื้นที่รับผิดชอบ */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 text-slate-500 font-bold">
                      <MapPin className="h-4.5 w-4.5 text-[#0c604c] shrink-0" />
                      <span>พื้นที่รับผิดชอบ</span>
                    </div>
                    <span className="font-extrabold text-slate-800 text-right">
                      {officerArea}
                    </span>
                  </div>
                  <div className="border-b border-dashed border-slate-200/80 w-full" />
                </div>

                {/* Row 4: ตรวจสอบเมื่อ */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 text-slate-500 font-bold">
                      <Calendar className="h-4.5 w-4.5 text-[#0c604c] shrink-0" />
                      <span>ตรวจสอบเมื่อ</span>
                    </div>
                    <span className="font-extrabold text-slate-800 text-right font-mono">
                      {scannedTime}
                    </span>
                  </div>
                  <div className="border-b border-dashed border-slate-200/80 w-full" />
                </div>

                {/* Row 5: สิทธิ์ของเจ้าหน้าที่ */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 text-xs">
                    <div className="flex items-center gap-2.5 text-slate-500 font-bold shrink-0 pt-0.5">
                      <FileText className="h-4.5 w-4.5 text-[#0c604c] shrink-0" />
                      <span>สิทธิ์ตรวจสอบ</span>
                    </div>
                  </div>
                  {officerPermissionsList.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {officerPermissionsList.map((perm, i) => (
                        <span
                          key={i}
                          className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-lg"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 font-semibold pl-7">ไม่มีสิทธิ์ที่กำหนด</p>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Row 1: ชื่อเจ้าหน้าที่ */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 text-slate-500 font-bold">
                      <IdCard className="h-4.5 w-4.5 text-[#0c604c] shrink-0" />
                      <span>ชื่อเจ้าหน้าที่</span>
                    </div>
                    <span className="font-extrabold text-slate-400 text-right">
                      -
                    </span>
                  </div>
                  <div className="border-b border-dashed border-slate-200/80 w-full" />
                </div>

                {/* Row 2: หน่วยงาน */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 text-slate-500 font-bold">
                      <Building2 className="h-4.5 w-4.5 text-[#0c604c] shrink-0" />
                      <span>หน่วยงาน</span>
                    </div>
                    <span className="font-extrabold text-slate-400 text-right">
                      -
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Area */}
          <div className="pt-8">
            {isSuccess ? (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void startScanner()}
                  className="rounded-2xl border-[#0c604c] text-[#0c604c] hover:bg-slate-50 h-12 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <ScanIcon />
                  <span>สแกนใหม่</span>
                </Button>
                
                <Button
                  type="button"
                  onClick={handleConfirm}
                  className="rounded-2xl bg-[#0c604c] hover:bg-[#084235] text-white h-12 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_12px_rgba(12,96,76,0.15)] border-0 pt-0.5"
                >
                  <Check className="h-4.5 w-4.5 stroke-[2.5]" />
                  <span>ยืนยัน</span>
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => void startScanner()}
                className="w-full rounded-2xl border-[#0c604c] text-[#0c604c] hover:bg-slate-50 h-12 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <ScanIcon />
                <span>สแกนใหม่</span>
              </Button>
            )}
          </div>

        </Card>
      </div>

      {/* Local Page camera QR Scanner Dialog */}
      <QrScannerDialog
        open={isBrowserScannerOpen}
        onOpenChange={setIsBrowserScannerOpen}
        onScanMock={handleScan}
        id="verify-officer-scanner"
        title="สแกนคิวอาร์โค้ดบัตรเจ้าหน้าที่"
        description="วางคิวอาร์โค้ดบัตรเจ้าหน้าที่ให้อยู่ภายในกรอบเพื่อดำเนินการ"
      />
    </main>
  );
}
