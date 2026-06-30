"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Search,
  Building2,
  Calendar,
  Tag,
  FileQuestion,
  Check,
  FileSearch,
  ClipboardCheck,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Type definitions to make it easy to wire to the backend later
export interface TrackedComplaint {
  ticketId: string;
  businessName: string;
  topic: string;
  date: string;
  currentStep: 1 | 2 | 3; // 1 = รับเรื่อง, 2 = กำลังตรวจสอบ, 3 = เสร็จสิ้น
}

const MOCK_COMPLAINTS: TrackedComplaint[] = [
  {
    ticketId: "CP-2596-000128",
    businessName: "บริษัท ศิริพัฒนา โฮเทล แอนด์ เซอร์วิส จำกัด",
    topic: "สงสัยไม่มีใบอนุญาต",
    date: "21/06/2569 16:45",
    currentStep: 2,
  },
  {
    ticketId: "CP-2569-4211",
    businessName: "บริษัท บิซ่า เอ็นเตอร์ไพรส์ จำกัด",
    topic: "ไม่ปฏิบัติตามมาตรฐานการผลิต/ใบอนุญาต",
    date: "10/05/2569 09:30",
    currentStep: 3,
  },
];

export default function TrackComplaintsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search parameters from URL
  const queryTicketId = searchParams.get("q")?.trim() ?? "";
  const queryBusiness = searchParams.get("b")?.trim() ?? "";

  // Input states
  const [ticketIdInput, setTicketIdInput] = useState(queryTicketId);
  const [businessInput, setBusinessInput] = useState(queryBusiness);

  // Determine if a search was performed
  const isSearched = Boolean(queryTicketId || queryBusiness);

  // Search logic supporting backend structure
  const trackingResult = useMemo<TrackedComplaint | null>(() => {
    if (!isSearched) return null;

    // 1. Try to find a match in the mock database
    const matched = MOCK_COMPLAINTS.find(
      (c) =>
        (queryTicketId && c.ticketId.toLowerCase() === queryTicketId.toLowerCase()) ||
        (queryBusiness &&
          c.businessName.toLowerCase().includes(queryBusiness.toLowerCase()))
    );

    if (matched) return matched;

    // 2. Dynamic fallback to allow testing any inputs (highly developer friendly!)
    // Generates a mock complaint based on the user's search inputs
    const generatedTicketId = queryTicketId || `CP-2569-${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedBusinessName = queryBusiness || "บริษัท ทดสอบจำกัด (ผลการค้นหาตัวอย่าง)";
    
    // Choose step dynamically based on ticket pattern to let users test all step views
    let step: 1 | 2 | 3 = 2; 
    if (generatedTicketId.endsWith("1")) step = 1;
    else if (generatedTicketId.endsWith("3")) step = 3;

    return {
      ticketId: generatedTicketId,
      businessName: generatedBusinessName,
      topic: "สงสัยไม่มีใบอนุญาต",
      date: "21/06/2569 16:45",
      currentStep: step,
    };
  }, [isSearched, queryTicketId, queryBusiness]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (ticketIdInput.trim()) params.set("q", ticketIdInput.trim());
    if (businessInput.trim()) params.set("b", businessInput.trim());
    router.replace(`/complaints/track?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[#f4f5f7] px-4 py-4 pb-24 text-slate-900 text-left">
      <div className="mx-auto max-w-[430px] space-y-4">
        {/* Back Link */}
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm font-bold text-slate-800 hover:opacity-80 transition-opacity cursor-pointer py-1"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
            <span>ย้อนกลับ</span>
          </button>
        </div>

        {/* Custom Header matching picture */}
        <div className="flex items-center gap-3.5 px-1 py-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f2ef] text-[#145b57] shrink-0 shadow-sm border border-slate-100">
            <FileSearch className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-slate-800 leading-tight">
              ติดตามสถานะเรื่องร้องเรียน
            </h1>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              ตรวจสอบความคืบหน้าเรื่องที่เคยแจ้ง
            </p>
          </div>
        </div>

        {/* Search Card */}
        <Card className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            {/* Input 1: Ticket ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                เลขอ้างอิงเรื่องร้องเรียน
              </label>
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="เช่น CP-2596-000128"
                  value={ticketIdInput}
                  onChange={(e) => setTicketIdInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#145b57] focus:border-[#145b57] shadow-sm font-semibold h-11"
                />
              </div>
            </div>

            {/* Input 2: Business/License Search */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                ค้นหาใบอนุญาต และสถานประกอบการ
              </label>
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="ระบุเลขที่ใบอนุญาต หรือชื่อสถานประกอบการ"
                  value={businessInput}
                  onChange={(e) => setBusinessInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#145b57] focus:border-[#145b57] shadow-sm font-semibold h-11"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full rounded-2xl bg-[#0c604c] hover:bg-[#094738] text-white h-11 text-xs font-bold transition-colors cursor-pointer border-0 flex items-center justify-center gap-2 shadow-sm"
            >
              <Search className="h-4 w-4" />
              ตรวจสอบสถานะ
            </Button>
          </form>
        </Card>

        {/* Results Section */}
        {isSearched && trackingResult && (
          <div className="space-y-3 pt-2">
            {/* Title section outside card */}
            <div className="px-1">
              <h3 className="text-sm font-extrabold text-slate-800">ผลการติดตาม</h3>
            </div>

            {/* Stepper & Details Card */}
            <Card className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
              {/* Stepper Progress Bar */}
              <div className="flex items-center justify-between px-3 py-2 mb-4">
                {/* Step 1: รับเรื่อง */}
                <div className="flex flex-col items-center gap-1.5 z-10">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0c604c] text-white shadow-sm">
                    <Check className="h-4.5 w-4.5" strokeWidth={2.5} />
                  </div>
                  <span className="text-[11px] font-bold text-[#0c604c]">รับเรื่อง</span>
                </div>

                {/* Line 1-2 */}
                <div className="flex-1 h-0.5 mx-1 -mt-5">
                  <div
                    className={`h-full transition-all duration-300 ${
                      trackingResult.currentStep >= 2 ? "bg-[#0c604c]" : "bg-slate-200"
                    }`}
                  />
                </div>

                {/* Step 2: กำลังตรวจสอบ */}
                <div className="flex flex-col items-center gap-1.5 z-10">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 shadow-sm ${
                      trackingResult.currentStep === 2
                        ? "border-[#0c604c] bg-[#e8f2ef] text-[#0c604c]"
                        : trackingResult.currentStep > 2
                        ? "border-[#0c604c] bg-[#0c604c] text-white"
                        : "border-slate-200 bg-slate-50 text-slate-300"
                    }`}
                  >
                    {trackingResult.currentStep > 2 ? (
                      <Check className="h-4.5 w-4.5" strokeWidth={2.5} />
                    ) : (
                      <FileSearch className="h-4.5 w-4.5" />
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-semibold transition-colors ${
                      trackingResult.currentStep >= 2 ? "text-slate-800 font-bold" : "text-slate-400"
                    }`}
                  >
                    กำลังตรวจสอบ
                  </span>
                </div>

                {/* Line 2-3 */}
                <div className="flex-1 h-0.5 mx-1 -mt-5">
                  <div
                    className={`h-full transition-all duration-300 ${
                      trackingResult.currentStep >= 3 ? "bg-[#0c604c]" : "bg-slate-200"
                    }`}
                  />
                </div>

                {/* Step 3: เสร็จสิ้น */}
                <div className="flex flex-col items-center gap-1.5 z-10">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 shadow-sm ${
                      trackingResult.currentStep === 3
                        ? "border-[#0c604c] bg-[#e8f2ef] text-[#0c604c]"
                        : "border-slate-200 bg-slate-50 text-slate-300"
                    }`}
                  >
                    <ClipboardCheck className="h-4.5 w-4.5" />
                  </div>
                  <span
                    className={`text-[11px] font-semibold transition-colors ${
                      trackingResult.currentStep >= 3 ? "text-slate-800 font-bold" : "text-slate-400"
                    }`}
                  >
                    เสร็จสิ้น
                  </span>
                </div>
              </div>

              {/* Divider Line */}
              <div className="h-px bg-slate-100/80 my-4.5" />

              {/* Info Details List */}
              <div className="space-y-4 text-left">
                {/* 1. เลขอ้างอิง */}
                <div className="flex gap-3.5 items-start">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e8f2ef] text-[#0c604c] shrink-0 mt-0.5 shadow-sm">
                    <Tag className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      เลขอ้างอิง
                    </p>
                    <p className="text-sm font-extrabold text-slate-800 mt-0.5 select-all">
                      {trackingResult.ticketId}
                    </p>
                  </div>
                </div>

                {/* 2. ชื่อสถานประกอบการ */}
                <div className="flex gap-3.5 items-start">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e8f2ef] text-[#0c604c] shrink-0 mt-0.5 shadow-sm">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      ชื่อสถานประกอบการ
                    </p>
                    <p className="text-sm font-extrabold text-slate-800 leading-snug mt-0.5">
                      {trackingResult.businessName}
                    </p>
                  </div>
                </div>

                {/* 3. ประเภทเรื่อง */}
                <div className="flex gap-3.5 items-start">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e8f2ef] text-[#0c604c] shrink-0 mt-0.5 shadow-sm">
                    <FileQuestion className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      ประเภทเรื่อง
                    </p>
                    <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                      {trackingResult.topic}
                    </p>
                  </div>
                </div>

                {/* 4. วันที่แจ้ง */}
                <div className="flex gap-3.5 items-start">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e8f2ef] text-[#0c604c] shrink-0 mt-0.5 shadow-sm">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      วันที่แจ้ง
                    </p>
                    <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                      {trackingResult.date}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
