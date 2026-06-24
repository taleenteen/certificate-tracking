"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, ShieldCheck, QrCode, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyOfficerPage() {
  const router = useRouter();
  const [officerId, setOfficerId] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    if (officerId.trim() === "OFFICER-779" || officerId.trim() === "0000" || officerId.trim() === "") {
      setSearchResult({
        name: "นายสมเกียรติ มั่นคง",
        position: "เจ้าหน้าที่ตรวจการ/ชำนาญการพิเศษ",
        agency: "กรมโรงงานอุตสาหกรรม",
        status: "ACTIVE",
        statusText: "ได้รับการแต่งตั้ง (ปฏิบัติงานอยู่)",
        cardId: "OF-2569-041",
      });
    } else {
      setSearchResult(null);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[430px] min-h-screen bg-[#f4f5f7] pb-10 text-slate-900 md:max-w-none">
      {/* Header bar */}
      <div className="sticky top-0 z-30 flex items-center bg-white border-b border-slate-100 px-4 py-3">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="ย้อนกลับ"
          onClick={() => router.back()}
          className="h-10 w-10 rounded-full text-slate-700 hover:bg-slate-100 shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="flex-1 text-center pr-10 text-base font-bold text-slate-800">
          ตรวจสอบเจ้าหน้าที่
        </h1>
      </div>

      <div className="p-4 space-y-5 text-left">
        {/* Search Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#145b57]">
              ระบุรหัสประจำตัวเจ้าหน้าที่
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              ใส่รหัสพนักงานหรือรหัสการแต่งตั้งเพื่อตรวจสอบความถูกต้องของสิทธิการตรวจสอบ
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="เช่น OFFICER-779"
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#145b57]"
              />
            </div>
            <Button
              type="submit"
              className="rounded-2xl bg-[#145b57] hover:bg-[#0c3e3c] text-white px-4 border-0 font-semibold"
            >
              ค้นหา
            </Button>
          </form>

          <div className="flex items-center justify-center py-2">
            <span className="text-xs text-slate-400 font-bold px-2 bg-white z-10">หรือ</span>
            <div className="absolute w-[calc(100%-80px)] h-px bg-slate-100 z-0" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-2xl border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 h-12 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <QrCode className="h-5 w-5 text-[#145b57]" />
            สแกนรหัสบัตร/คิวอาร์โค้ด
          </Button>
        </div>

        {/* Search Results */}
        {searched && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
              ผลการตรวจสอบ
            </h3>

            {searchResult ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4 relative overflow-hidden">
                {/* Background graphic */}
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-[#e8f2ef] opacity-50 z-0 pointer-events-none">
                  <ClipboardCheck className="h-32 w-32" />
                </div>

                <div className="flex items-start gap-4 z-10 relative">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e8f2ef] text-[#145b57]">
                    <ShieldCheck className="h-8 w-8" />
                  </span>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-800 leading-tight">
                      {searchResult.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold">
                      {searchResult.position}
                    </p>
                    <p className="text-[11px] text-[#145b57] font-bold">
                      {searchResult.agency}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-2 text-xs pt-1">
                  <span className="text-slate-400 font-semibold">รหัสบัตรปฏิบัติการ:</span>
                  <span className="text-slate-800 font-bold">{searchResult.cardId}</span>

                  <span className="text-slate-400 font-semibold">สถานะบัตรเจ้าหน้าที่:</span>
                  <span className="text-[#1e7c75] font-extrabold flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#1e7c75] inline-block animate-pulse" />
                    {searchResult.statusText}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-center space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-slate-800">ไม่พบข้อมูลเจ้าหน้าที่</h4>
                <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
                  ไม่พบพนักงานในระบบ หรือบัตรแต่งตั้งนี้อาจจะหมดอายุหรือยกเลิกสิทธิการใช้งานแล้ว
                </p>
              </div>
            )}
          </div>
        )}

        {/* Note / Tip */}
        <div className="bg-[#e8f2ef]/40 border border-[#d2eae6]/60 rounded-3xl p-5 space-y-2">
          <h4 className="text-xs font-bold text-[#145b57] flex items-center gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#145b57] text-white text-[10px]">i</span>
            ข้อแนะนำการตรวจสอบ
          </h4>
          <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
            เจ้าหน้าที่ฝ่ายตรวจสอบทุกคนจากส่วนกลาง จะต้องมีบัตรระบุตัวตน E-License เสมอ หากมีข้อสงสัยหรือไม่พบข้อมูล กรุณาติดต่อหน่วยงานสายด่วน กรมโรงงานอุตสาหกรรม โทร. 1564
          </p>
        </div>
      </div>
    </main>
  );
}
