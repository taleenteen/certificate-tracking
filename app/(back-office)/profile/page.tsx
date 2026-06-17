"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { useMyProfile } from "@/hooks/useMyProfile";
import { useAgencies } from "@/hooks/useAgencies";
import { useBusiness } from "@/hooks/useBusinesses";
import { useLogout } from "@/hooks/useAuth";
import {
  User,
  ShieldCheck,
  Building2,
  KeyRound,
  ChevronRight,
  Fingerprint,
  ArrowLeft,
  LogOut,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// DECISION: Map role names to Thai readable labels with styled border/text colors
const ROLE_MAP: Record<string, { label: string; class: string }> = {
  super_admin: { label: "ผู้ดูแลระบบสูงสุด", class: "bg-red-50 text-red-700 border-red-200" },
  admin: { label: "ผู้ดูแลระบบ", class: "bg-amber-50 text-amber-700 border-amber-200" },
  officer: { label: "เจ้าหน้าที่", class: "bg-teal-50 text-teal-700 border-teal-200" },
  public: { label: "ผู้ประกอบการ / ประชาชน", class: "bg-slate-50 text-slate-700 border-slate-200" },
};

export default function ProfilePage() {
  const router = useRouter();
  const logout = useLogout();
  const activeJuristicId = useAuthStore((s) => s.activeJuristicId);

  const { data: profile, isLoading: isProfileLoading, error: profileError } = useMyProfile();
  const { data: agencies = [] } = useAgencies();
  const { data: business, isLoading: isBusinessLoading } = useBusiness(activeJuristicId || "");

  // Resolve user agency name
  const userAgency = agencies.find((a) => a.id === profile?.agencyId);
  const agencyName = userAgency?.nameTh;

  // Resolve primary role label
  const primaryRole = profile?.roles?.[0] || "public";
  const roleStyle = ROLE_MAP[primaryRole] || ROLE_MAP.public;

  // Mask citizen ID to show only last 4 digits: e.g. x-xxxx-xxxxx-12-4
  const formatCitizenId = (last4: string | null) => {
    if (!last4 || last4.length < 4) return "x-xxxx-xxxxx-xx-x";
    const part4 = last4.slice(0, 2);
    const part5 = last4.slice(2, 4);
    return `x-xxxx-xxxxx-${part4}-${part5}`;
  };

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        router.push("/auth/login");
      },
    });
  };

  if (profileError) {
    return (
      <main className="mx-auto w-full max-w-[430px] bg-[#f4f5f7] min-h-[calc(100vh-120px)] px-4 py-6 flex flex-col justify-center items-center text-center">
        <AlertCircle className="size-12 text-rose-500 mb-2" />
        <h3 className="text-base font-bold text-slate-800">เกิดข้อผิดพลาดในการโหลดข้อมูล</h3>
        <p className="text-xs text-slate-500 mt-1">กรุณาลองใหม่อีกครั้งภายหลัง</p>
        <Button className="mt-4 bg-[#145b57] text-white hover:bg-[#114e4b] rounded-xl" onClick={() => window.location.reload()}>
          โหลดใหม่
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[430px] overflow-x-hidden bg-[#f4f5f7] text-slate-900 md:max-w-none text-left">
      
      {/* Upper Navigation Header */}
      <section className="bg-white px-4 py-4 flex items-center gap-3 border-b border-slate-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="size-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="text-[16px] font-bold text-slate-950">โปรไฟล์ของฉัน</h1>
      </section>

      {/* Profile Info Header Panel */}
      <section className="px-4 py-6">
        <div className="rounded-[24px] bg-gradient-to-br from-[#145b57] to-[#1e7c75] p-5 text-white shadow-[0_12px_32px_rgba(20,91,87,0.15)] relative overflow-hidden">
          {/* Subtle design highlight rings in background */}
          <div className="absolute -right-10 -bottom-10 size-36 rounded-full border border-white/5 bg-white/5 pointer-events-none" />
          <div className="absolute -left-10 -top-10 size-28 rounded-full border border-white/5 bg-white/5 pointer-events-none" />
          
          <div className="flex items-center gap-4 relative z-10">
            {isProfileLoading ? (
              <Skeleton className="size-16 rounded-[20px] bg-white/10 shrink-0" />
            ) : (
              <div className="size-16 rounded-[20px] bg-white flex items-center justify-center text-[#145b57] text-xl font-bold border-2 border-white/30 shadow-md">
                {profile?.displayName
                  ? profile.displayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "?"}
              </div>
            )}

            <div className="space-y-1 min-w-0 flex-1">
              {isProfileLoading ? (
                <>
                  <Skeleton className="h-5 w-32 bg-white/10" />
                  <Skeleton className="h-4 w-24 bg-white/10" />
                </>
              ) : (
                <>
                  <h2 className="text-[17px] font-bold leading-tight truncate">
                    {profile?.displayName || "ผู้เข้าใช้งาน"}
                  </h2>
                  <div className="flex flex-wrap gap-1.5 pt-1.5 items-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${roleStyle.class} border-white/20 bg-white/10 text-white`}>
                      {roleStyle.label}
                    </span>
                    {agencyName && (
                      <span className="text-[10px] font-semibold text-teal-100 truncate flex items-center gap-1">
                        <Briefcase className="size-3" />
                        {agencyName}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Settings/Details List */}
      <section className="px-4 pb-8 space-y-4">
        
        {/* Card 1: Personal Details */}
        <Card className="rounded-[24px] border-0 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] overflow-hidden">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="size-4.5 text-[#145b57]" />
              <h3 className="text-[14px] font-bold text-slate-800">ข้อมูลผู้ใช้งาน</h3>
            </div>

            <div className="space-y-3.5">
              <div>
                <p className="text-[10px] font-semibold text-slate-400">ชื่อผู้ใช้งาน</p>
                {isProfileLoading ? (
                  <Skeleton className="h-4 w-40 mt-1" />
                ) : (
                  <p className="text-[13px] font-bold text-slate-800 mt-0.5">
                    {profile?.displayName || "—"}
                  </p>
                )}
              </div>

              <div>
                <p className="text-[10px] font-semibold text-slate-400">เลขประจำตัวประชาชน</p>
                {isProfileLoading ? (
                  <Skeleton className="h-4 w-36 mt-1" />
                ) : (
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[13px] font-bold text-slate-800 font-mono">
                      {formatCitizenId(profile?.citizenIdLast4 || null)}
                    </p>
                    {profile?.citizenIdVerified ? (
                      <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <ShieldCheck className="size-3" />
                        ยืนยันแล้ว
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                        ยังไม่ยืนยัน
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <p className="text-[10px] font-semibold text-slate-400">ช่องทางการเชื่อมต่อ</p>
                {isProfileLoading ? (
                  <Skeleton className="h-4 w-28 mt-1" />
                ) : (
                  <p className="text-[13px] font-bold text-slate-800 mt-0.5">
                    {profile?.primaryChannel === "tang_rat" 
                      ? "ยืนยันตัวตนผ่านแอปพลิเคชัน ทางรัฐ" 
                      : "บัญชีผู้ใช้ระบบ (Username/Password)"}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Active Juristic Context (Operator only) */}
        {activeJuristicId && (
          <Card className="rounded-[24px] border-0 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] overflow-hidden">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Building2 className="size-4.5 text-[#145b57]" />
                <h3 className="text-[14px] font-bold text-slate-800">นิติบุคคลที่เข้าใช้งาน</h3>
              </div>

              {isBusinessLoading ? (
                <div className="space-y-2.5">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : business ? (
                <div className="space-y-3.5">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400">ชื่อนิติบุคคล / สถานประกอบการ</p>
                    <p className="text-[13px] font-bold text-slate-800 mt-0.5">
                      {business.nameTh}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-slate-400">ที่ตั้งสถานประกอบการ</p>
                    <p className="text-[12px] font-medium text-slate-600 mt-0.5 leading-relaxed">
                      {business.address} {business.province ? `จ. ${business.province}` : ""}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-slate-400">จำนวนใบอนุญาตภายใต้สิทธิ์</p>
                    <p className="text-[13px] font-bold text-[#145b57] mt-0.5">
                      {business.licenses?.length || 0} รายการ
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-[12px] text-slate-400 py-2">ไม่พบรายละเอียดนิติบุคคล</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Card 3: Security & Actions */}
        <Card className="rounded-[24px] border-0 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] overflow-hidden">
          <CardContent className="p-3 space-y-0.5">
            {profile?.primaryChannel !== "tang_rat" && (
              <Link
                href="/auth/change-password"
                className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#145b57]/10 text-[#145b57]">
                    <KeyRound className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-[13px] font-bold text-slate-800">เปลี่ยนรหัสผ่าน</span>
                </div>
                <ChevronRight className="size-4 text-slate-400" />
              </Link>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-rose-600 hover:bg-rose-50/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                  <LogOut className="h-4.5 w-4.5" />
                </div>
                <span className="text-[13px] font-bold">ออกจากระบบ</span>
              </div>
              <ChevronRight className="size-4 text-rose-400" />
            </button>
          </CardContent>
        </Card>

      </section>
    </main>
  );
}
