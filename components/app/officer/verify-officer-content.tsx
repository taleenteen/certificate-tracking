"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ChevronLeft, 
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

type VerifyOfficerContentProps = {
  initialState: string;
};

// DECISION: Dual-state premium layout reproducing mockup screens exactly (Authorized check vs Red Alert warning block)
export default function VerifyOfficerContent({ initialState }: VerifyOfficerContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Sync state from query parameters, fallback to initialState prop
  const state = searchParams.get("state") || initialState;

  const handleScanMock = (value: string) => {
    setIsScannerOpen(false);
    if (value.includes("fail") || value === "error") {
      router.push("/verify-officer?state=failed");
      toast.error("ตรวจสอบไม่สำเร็จ: ไม่พบข้อมูลเจ้าหน้าที่ในระบบ");
    } else {
      router.push("/verify-officer?state=success");
      toast.success("ตรวจสอบสำเร็จ: ยืนยันตัวตนเจ้าหน้าที่เรียบร้อย");
    }
  };

  const handleConfirm = () => {
    toast.success("ยืนยันตัวตนเจ้าหน้าที่เรียบร้อยแล้ว");
    router.push("/home");
  };

  return (
    <main className="min-h-screen bg-[#f4f5f7] px-4 py-4 pb-24 text-slate-900 text-left">
      {/* Dev Switcher Controls (Toggle mockup states for demo/review) */}
      <div className="mx-auto max-w-[430px] mb-4 p-2.5 bg-[#e2e8f0] rounded-2xl flex items-center justify-between text-[11px] font-bold text-slate-700 shadow-sm">
        <span>Dev State Switcher:</span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => router.push("/verify-officer?state=success")}
            className={`px-3 py-1.5 rounded-xl transition-all shadow-sm ${
              state === "success"
                ? "bg-[#0c604c] text-white"
                : "bg-white text-[#0c604c] hover:bg-slate-50"
            }`}
          >
            ได้รับอนุญาต (State 1)
          </button>
          <button
            type="button"
            onClick={() => router.push("/verify-officer?state=failed")}
            className={`px-3 py-1.5 rounded-xl transition-all shadow-sm ${
              state === "failed"
                ? "bg-rose-600 text-white"
                : "bg-white text-rose-600 hover:bg-slate-50"
            }`}
          >
            ไม่พบข้อมูล (State 2)
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[430px] space-y-4">
        {/* Back Button */}
        <div className="flex items-center">
          <button
            onClick={() => router.push("/home")}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:opacity-80 transition-opacity cursor-pointer py-1"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
            <span>ย้อนกลับ</span>
          </button>
        </div>

        {/* Main Card */}
        <Card className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between min-h-[460px]">
          
          {/* Top Banner Status */}
          <div className="text-center pt-4 pb-6 space-y-3">
            {state === "success" ? (
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
                  <p className="text-[12px] text-slate-400 font-semibold px-4">
                    ไม่สามารถยืนยันตัวตนเจ้าหน้าที่ได้ กรุณาลองใหม่อีกครั้ง
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Details Section */}
          <div className="flex-1 space-y-4 py-4">
            {state === "success" ? (
              <>
                {/* Row 1: ชื่อเจ้าหน้าที่ */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 text-slate-500 font-bold">
                      <IdCard className="h-4.5 w-4.5 text-[#0c604c] shrink-0" />
                      <span>ชื่อเจ้าหน้าที่</span>
                    </div>
                    <span className="font-extrabold text-slate-800 text-right">
                      นายสมชาย ใจดี
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
                      กรมโรงงานอุตสาหกรรม
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
                      จังหวัดสมุทรปราการ
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
                    <span className="font-extrabold text-slate-800 text-right">
                      21/06/2569 16:45
                    </span>
                  </div>
                  <div className="border-b border-dashed border-slate-200/80 w-full" />
                </div>

                {/* Row 5: สิทธิ์ของเจ้าหน้าที่ */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 text-slate-500 font-bold">
                      <FileText className="h-4.5 w-4.5 text-[#0c604c] shrink-0" />
                      <span>สิทธิ์ของเจ้าหน้าที่</span>
                    </div>
                    <span className="font-extrabold text-slate-800 text-right">
                      ร.ง.4 ,วอ.8
                    </span>
                  </div>
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
            {state === "success" ? (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsScannerOpen(true)}
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
                onClick={() => setIsScannerOpen(true)}
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
        open={isScannerOpen}
        onOpenChange={setIsScannerOpen}
        onScanMock={handleScanMock}
        id="verify-officer-scanner"
      />
    </main>
  );
}
