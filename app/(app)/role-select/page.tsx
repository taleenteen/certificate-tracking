"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";
import publicUserIcon from "@/assets/icon/public-user.svg";
import officerUserIcon from "@/assets/icon/officer-user.svg";

export default function RoleSelectPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setActivePortalMode = useAuthStore((s) => s.setActivePortalMode);
  const roles = useMemo(() => user?.roles ?? [], [user?.roles]);
  const canUseOfficerMode = roles.includes("officer");
  const [selected, setSelected] = useState<"public" | "officer" | null>(null);

  useEffect(() => {
    if (!user) return;
    if (roles.includes("super_admin")) {
      setActivePortalMode(null);
      router.replace("/super-admin/dashboard");
      return;
    }
    if (roles.includes("admin")) {
      setActivePortalMode(null);
      router.replace("/agency-admin/inspections");
      return;
    }
    if (!canUseOfficerMode) {
      setActivePortalMode("public");
      router.replace("/home?entry=public");
    }
  }, [canUseOfficerMode, roles, router, setActivePortalMode, user]);

  const handleStart = () => {
    if (!selected) return;
    setActivePortalMode(selected);
    router.push(`/home?entry=${selected}`);
  };

  if (!user || !canUseOfficerMode) return null;

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f4f5f7] px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-[430px] space-y-8 text-center">
        {/* Title Section */}
        <div className="space-y-2">
          <h1 className="text-[26px] font-bold text-[#114e4b] tracking-tight">
            เลือกประเภทการเข้าใช้งาน
          </h1>
          <p className="text-[14px] font-semibold text-slate-500">
            กรุณาเลือกประเภทผู้ใช้งาน เพื่อเข้าใช้งาน
          </p>
        </div>

        {/* Selection Cards */}
        <div className="space-y-4">
          {/* Card 1: Citizen (บุคคลธรรมดา) */}
          <div
            onClick={() => setSelected("public")}
            className={`group relative flex items-center justify-between gap-4 p-5 rounded-[24px] border-[1.5px] bg-white cursor-pointer select-none transition-all duration-300 ease-in-out ${
              selected === "public"
                ? "border-[#114e4b] shadow-[0_12px_30px_rgba(17,78,75,0.08)] bg-[#114e4b]/[0.01]"
                : "border-slate-100 hover:border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.015)]"
            }`}
          >
            {/* Left Image & Middle Text */}
            <div className="flex items-center gap-4 flex-1">
              <div
                className={`relative w-[100px] h-[80px] shrink-0 transition-all duration-300 ease-in-out ${
                  selected === "public" ? "grayscale-0 opacity-100" : "grayscale opacity-60"
                }`}
              >
                <Image
                  src={publicUserIcon}
                  alt="บุคคลธรรมดา"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="text-left space-y-1">
                <h2
                  className={`text-[18px] font-bold transition-colors duration-300 ${
                    selected === "public" ? "text-[#114e4b]" : "text-slate-700"
                  }`}
                >
                  บุคคลธรรมดา
                </h2>
                <p className="text-[12px] font-medium text-slate-400 leading-normal max-w-[200px]">
                  สำหรับประชาชน/ผู้ประกอบการ ในการเข้าใช้บริการ
                </p>
              </div>
            </div>

            {/* Right Radio Indicator */}
            <div className="relative shrink-0 flex items-center justify-center">
              <div
                className={`w-[26px] h-[26px] rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                  selected === "public"
                    ? "border-[#114e4b] bg-[#114e4b]"
                    : "border-slate-200 bg-white"
                }`}
              >
                {selected === "public" && (
                  <div className="w-[8px] h-[8px] rounded-full bg-white scale-100 transition-all duration-300" />
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Officer (เจ้าหน้าที่) */}
          <div
            onClick={() => setSelected("officer")}
            className={`group relative flex items-center justify-between gap-4 p-5 rounded-[24px] border-[1.5px] bg-white cursor-pointer select-none transition-all duration-300 ease-in-out ${
              selected === "officer"
                ? "border-[#114e4b] shadow-[0_12px_30px_rgba(17,78,75,0.08)] bg-[#114e4b]/[0.01]"
                : "border-slate-100 hover:border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.015)]"
            }`}
          >
            {/* Left Image & Middle Text */}
            <div className="flex items-center gap-4 flex-1">
              <div
                className={`relative w-[100px] h-[80px] shrink-0 transition-all duration-300 ease-in-out ${
                  selected === "officer" ? "grayscale-0 opacity-100" : "grayscale opacity-60"
                }`}
              >
                <Image
                  src={officerUserIcon}
                  alt="เจ้าหน้าที่"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="text-left space-y-1">
                <h2
                  className={`text-[18px] font-bold transition-colors duration-300 ${
                    selected === "officer" ? "text-[#114e4b]" : "text-slate-700"
                  }`}
                >
                  เจ้าหน้าที่
                </h2>
                <p className="text-[12px] font-medium text-slate-400 leading-normal max-w-[200px]">
                  สำหรับเจ้าหน้าที่ที่ได้รับอนุญาต ในการตรวจสอบ
                </p>
              </div>
            </div>

            {/* Right Radio Indicator */}
            <div className="relative shrink-0 flex items-center justify-center">
              <div
                className={`w-[26px] h-[26px] rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                  selected === "officer"
                    ? "border-[#114e4b] bg-[#114e4b]"
                    : "border-slate-200 bg-white"
                }`}
              >
                {selected === "officer" && (
                  <div className="w-[8px] h-[8px] rounded-full bg-white scale-100 transition-all duration-300" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="button"
            onClick={handleStart}
            disabled={!selected}
            className={`group w-full h-[52px] rounded-[16px] text-[16px] font-bold shadow-sm transition-all duration-300 ease-in-out border cursor-pointer flex items-center justify-center gap-3.5 ${
              selected
                ? "bg-[#252525] hover:bg-[#1a1a1a] text-white border-[#252525] hover:border-[#1a1a1a]"
                : "bg-[#969696] hover:bg-[#969696] text-white opacity-80 cursor-not-allowed border-transparent"
            }`}
          >
            {/* Left Chevrons */}
            <div
              className={`flex items-center transition-all duration-300 ease-out ${
                selected ? "group-hover:translate-x-1.5 group-active:translate-x-2.5 text-white/50" : "text-white/30"
              }`}
            >
              <ChevronRight className="h-4 w-4 -mr-2.5 opacity-40" />
              <ChevronRight className="h-4 w-4 -mr-2.5 opacity-70" />
              <ChevronRight className="h-4 w-4 opacity-100" />
            </div>

            <span>เริ่มใช้บริการ</span>

            {/* Right Chevrons */}
            <div
              className={`flex items-center transition-all duration-300 ease-out ${
                selected ? "group-hover:-translate-x-1.5 group-active:-translate-x-2.5 text-white/50" : "text-white/30"
              }`}
            >
              <ChevronLeft className="h-4 w-4 opacity-100" />
              <ChevronLeft className="h-4 w-4 -ml-2.5 opacity-70" />
              <ChevronLeft className="h-4 w-4 -ml-2.5 opacity-40" />
            </div>
          </Button>
        </div>
      </div>
    </main>
  );
}
