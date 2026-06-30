"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ChevronLeft, 
  ChevronRight,
  Upload, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  Map, 
  ClipboardList, 
  Wind, 
  Volume2, 
  FileText, 
  AlertTriangle, 
  MoreHorizontal, 
  FilePenLine, 
  Image as ImageIcon, 
  ImagePlus,
  Send,
  Check,
  X
} from "lucide-react";
import { toast } from "sonner";
import heroRightImage from "@/assets/hero/hero-right.png";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// DECISION: Premium stylized new complaints form with custom icons, layout, and visual fidelity matching the mockup image.
export default function NewComplaintPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [selectedChips, setSelectedChips] = useState<string[]>(["odor_smoke", "loud_noise"]);
  const [detail, setDetail] = useState("พบกลิ่นสารเคมีช่วงกลางคืนจากบริเวณคลังสินค้าใกล้ชุมชน");
  const [files, setFiles] = useState<File[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const uploaded = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...uploaded]);
      toast.success("แนบไฟล์รูปภาพเรียบร้อย");
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // MOCK: simulate pinning a location on the map
  const handlePinLocation = () => {
    if (locationAddress) {
      setLocationAddress("");
      toast.success("ยกเลิกการปักหมุด");
    } else {
      setLocationAddress("บริเวณคลังสินค้าหลัก เลขที่ 42/1 ต.มาบตาพุด อ.เมืองระยอง จ.ระยอง");
      toast.success("ปักหมุดตำแหน่งเกิดเหตุเรียบร้อย");
    }
  };

  const toggleChip = (id: string) => {
    if (selectedChips.includes(id)) {
      setSelectedChips(selectedChips.filter((x) => x !== id));
    } else {
      setSelectedChips([...selectedChips, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!locationAddress) {
      toast.error("กรุณาระบุตำแหน่ง/ที่อยู่เกิดเหตุโดยการปักหมุดบนแผนที่");
      return;
    }

    if (selectedChips.length === 0) {
      toast.error("กรุณาเลือกหัวข้อสิ่งที่พบอย่างน้อย 1 หัวข้อ");
      return;
    }

    if (files.length === 0) {
      // MOCK: Auto-attach a dummy file if the user hasn't selected any, to ease testing
      toast.info("แนบรูปภาพอัตโนมัติสำหรับการสาธิต");
      const dummyFile = new File(["dummy content"], "evidence_image.png", { type: "image/png" });
      setFiles([dummyFile]);
    }

    // MOCK: Generate a ticket ID and trigger success popup
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const mockTicketId = `CP-2569-${randomNum}`;
    setTicketId(mockTicketId);
    setIsSuccess(true);
    toast.success("ส่งเรื่องร้องเรียนเรียบร้อย");
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-[#f4f5f7] px-4 py-8 flex items-center justify-center text-slate-900">
        <div className="w-full max-w-[430px] bg-white rounded-[32px] p-8 text-center border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-[#0c604c]">
              <CheckCircle2 className="h-10 w-10" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800">ส่งเรื่องร้องเรียนสำเร็จ</h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed px-4">
              เรื่องร้องเรียนของคุณได้รับการบันทึกเข้าสู่ระบบแล้ว เจ้าหน้าที่จะดำเนินการตรวจสอบข้อมูลเบื้องต้น
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">หมายเลขติดตามเรื่อง (Ticket ID)</p>
            <p className="text-lg font-extrabold text-[#0c604c] mt-1 select-all">{ticketId}</p>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              type="button"
              onClick={() => router.push(`/complaints/track?q=${ticketId}`)}
              className="w-full rounded-2xl bg-[#0c604c] hover:bg-[#084235] text-white h-11 text-xs font-bold transition-colors cursor-pointer border-0"
            >
              ติดตามสถานะของเรื่องนี้
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/home")}
              className="w-full rounded-2xl border-slate-200 text-slate-600 bg-white hover:bg-slate-50 h-11 text-xs font-bold transition-colors cursor-pointer"
            >
              กลับสู่หน้าหลัก
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7] px-4 py-4 pb-24 text-slate-900 text-left">
      <div className="mx-auto max-w-[430px] space-y-4">
        {/* Back Button */}
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:opacity-80 transition-opacity cursor-pointer py-1"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
            <span>ย้อนกลับ</span>
          </button>
        </div>

        {/* Top Green Illustration Banner */}
        <div className="relative overflow-hidden bg-[#0c604c] text-white rounded-[28px] p-6 h-[115px] flex items-center justify-between shadow-[0_8px_30px_rgba(12,96,76,0.06)]">
          <div className="space-y-0.5 z-10">
            <h1 className="text-[20px] font-bold leading-tight">แจ้งเรื่องร้องเรียน</h1>
            <p className="text-[11px] text-emerald-100/90 font-medium">ปัญหาที่พบให้กับหน่วยงาน</p>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-[160px] z-0">
            <Image
              src={heroRightImage}
              alt="Illustration"
              fill
              className="object-contain object-bottom scale-110 translate-y-1"
              priority
            />
          </div>
        </div>

        {/* White Form Card */}
        <Card className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Field 1: ชื่อสถานประกอบการ / เลขใบอนุญาต */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#0c604c]" />
                <label className="text-[13px] font-bold text-slate-800">
                  ชื่อสถานประกอบการ / เลขใบอนุญาต
                </label>
              </div>
              <input
                type="text"
                placeholder="ระบุเลขที่ใบอนุญาต หรือชื่อสถานประกอบการ"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0c604c] focus:border-[#0c604c] shadow-sm font-semibold h-11"
              />
            </div>

            {/* Field 2: ตำแหน่ง/ที่อยู่เกิดเหตุ */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#0c604c]" />
                <label className="text-[13px] font-bold text-slate-800">
                  ตำแหน่ง/ที่อยู่เกิดเหตุ <span className="text-rose-500">*</span>
                </label>
              </div>
              
              <button
                type="button"
                onClick={handlePinLocation}
                className="w-full border border-slate-200 rounded-2xl px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-all text-left bg-white shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <Map className="h-4.5 w-4.5 text-[#0c604c] shrink-0" />
                  <span className="text-xs font-semibold text-slate-700 truncate">
                    {locationAddress || "ปักหมุดบนแผนที่"}
                  </span>
                </div>
                <ChevronRight className="h-4.5 w-4.5 text-slate-400 shrink-0" />
              </button>
            </div>

            {/* Field 3: สิ่งที่พบ */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-[#0c604c]" />
                <label className="text-[13px] font-bold text-slate-800">
                  สิ่งที่พบ <span className="text-rose-500">*</span>
                </label>
              </div>
              
              <div className="flex flex-wrap gap-2 pt-1">
                {/* Chip 1 */}
                <button
                  type="button"
                  onClick={() => toggleChip("odor_smoke")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all text-xs font-semibold ${
                    selectedChips.includes("odor_smoke")
                      ? "border-[#0c604c] bg-[#eef8f6] text-[#0c604c] shadow-[0_2px_8px_rgba(12,96,76,0.04)]"
                      : "border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Wind className="h-3.5 w-3.5" />
                  <span>กลิ่น/ควันผิดปกติ</span>
                  {selectedChips.includes("odor_smoke") && (
                    <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#0c604c] text-white shrink-0 ml-0.5">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </span>
                  )}
                </button>

                {/* Chip 2 */}
                <button
                  type="button"
                  onClick={() => toggleChip("loud_noise")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all text-xs font-semibold ${
                    selectedChips.includes("loud_noise")
                      ? "border-[#0c604c] bg-[#eef8f6] text-[#0c604c] shadow-[0_2px_8px_rgba(12,96,76,0.04)]"
                      : "border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>เสียงดัง</span>
                  {selectedChips.includes("loud_noise") && (
                    <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#0c604c] text-white shrink-0 ml-0.5">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </span>
                  )}
                </button>

                {/* Chip 3 */}
                <button
                  type="button"
                  onClick={() => toggleChip("no_license")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all text-xs font-semibold ${
                    selectedChips.includes("no_license")
                      ? "border-[#0c604c] bg-[#eef8f6] text-[#0c604c] shadow-[0_2px_8px_rgba(12,96,76,0.04)]"
                      : "border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>สงสัยไม่มีใบอนุญาต</span>
                  {selectedChips.includes("no_license") && (
                    <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#0c604c] text-white shrink-0 ml-0.5">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </span>
                  )}
                </button>

                {/* Chip 4 */}
                <button
                  type="button"
                  onClick={() => toggleChip("hazardous")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all text-xs font-semibold ${
                    selectedChips.includes("hazardous")
                      ? "border-[#0c604c] bg-[#eef8f6] text-[#0c604c] shadow-[0_2px_8px_rgba(12,96,76,0.04)]"
                      : "border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>วัตถุอันตราย</span>
                  {selectedChips.includes("hazardous") && (
                    <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#0c604c] text-white shrink-0 ml-0.5">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </span>
                  )}
                </button>

                {/* Chip 5 */}
                <button
                  type="button"
                  onClick={() => toggleChip("other")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all text-xs font-semibold ${
                    selectedChips.includes("other")
                      ? "border-[#0c604c] bg-[#eef8f6] text-[#0c604c] shadow-[0_2px_8px_rgba(12,96,76,0.04)]"
                      : "border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                  <span>อื่น ๆ</span>
                  {selectedChips.includes("other") && (
                    <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#0c604c] text-white shrink-0 ml-0.5">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Field 4: รายละเอียดเพิ่มเติม */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FilePenLine className="h-5 w-5 text-[#0c604c]" />
                <label className="text-[13px] font-bold text-slate-800">
                  รายละเอียดเพิ่มเติม
                </label>
              </div>
              <div className="relative">
                <textarea
                  rows={4}
                  maxLength={500}
                  placeholder="ระบุรายละเอียดเพิ่มเติม หรือเบาะแสที่ต้องการแจ้งเจ้าหน้าที่..."
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  className="w-full px-4 py-3 pb-8 rounded-2xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0c604c] focus:border-[#0c604c] shadow-sm font-semibold resize-none text-left"
                />
                <div className="absolute bottom-2.5 right-4 text-[10px] text-slate-400 font-bold">
                  {detail.length}/500
                </div>
              </div>
            </div>

            {/* Field 5: รูปภาพประกอบ */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-[#0c604c]" />
                <label className="text-[13px] font-bold text-slate-800">
                  รูปภาพประกอบ <span className="text-rose-500">*</span>
                </label>
              </div>
              
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full border border-dashed border-slate-200/80 bg-slate-50/40 hover:bg-slate-50/80 rounded-2xl cursor-pointer p-6 transition-all shadow-sm">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <ImagePlus className="h-8 w-8 text-slate-400" />
                    <span className="text-xs text-slate-500 font-bold">
                      แนบรูปภาพจากกล้อง/คลังภาพ
                    </span>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {/* Show attached files */}
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {files.map((file, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200 text-[10px] font-bold text-slate-600"
                    >
                      <span className="truncate max-w-[120px]">{file.name}</span>
                      <button 
                        type="button" 
                        onClick={() => removeFile(idx)}
                        className="text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full rounded-2xl bg-[#0c604c] hover:bg-[#084235] text-white h-12 text-xs font-bold transition-all shadow-[0_4px_12px_rgba(12,96,76,0.15)] flex items-center justify-center gap-2 cursor-pointer border-0 pt-0.5"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
              <span>ส่งเรื่องร้องเรียน</span>
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}

