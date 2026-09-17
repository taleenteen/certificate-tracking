"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMyProfile } from "@/hooks/useMyProfile";
import { useAgencies } from "@/hooks/useAgencies";
import { useOfficerQrProfile } from "@/hooks/useOfficer";
import { useLicenseTypes } from "@/hooks/useLicenseTypes";
import { QrCodeImage } from "@/components/shared/qr-code-image";
import { officerVerifyPath } from "@/lib/officer-qr-token";
import { AppBreadcrumb } from "@/components/shared/app-breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, AlertCircle, RefreshCw, User } from "lucide-react";
import { toast } from "sonner";

export default function OfficerCardPage() {
  const router = useRouter();
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useMyProfile();
  const { data: agencies = [] } = useAgencies();
  const { data: licenseTypes = [] } = useLicenseTypes();

  const [timeLeft, setTimeLeft] = useState(120); // 120 seconds fallback matching mockup 01:59

  // Enable QR queries if user is an officer
  const isOfficer = profile?.roles?.includes("officer");
  const {
    data: qrData,
    isLoading: isQrLoading,
    error: qrError,
    refetch,
  } = useOfficerQrProfile(profile?.id || "", !!isOfficer);

  // Sync countdown timer from API expiresAt or fallback countdown
  useEffect(() => {
    if (!qrData?.expiresAt) {
      // Fallback local simulation of 2 minutes if no API yet (reviewer mode)
      const interval = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 120));
      }, 1000);
      return () => clearInterval(interval);
    }

    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.round((new Date(qrData.expiresAt).getTime() - Date.now()) / 1000),
      );
      setTimeLeft(remaining);
      if (remaining <= 0) {
        refetch();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [qrData, refetch]);

  // Resolved on the client only: the origin the officer loaded the app from is
  // by definition reachable by the citizen's phone scanning the code.
  const [verifyOrigin, setVerifyOrigin] = useState("");
  useEffect(() => {
    // Reading window is only possible after mount; this syncs an external
    // platform value into React, which is what effects are for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVerifyOrigin(window.location.origin);
  }, []);

  // Resolve agency name
  const matchedAgency = agencies.find((a) => a.id === profile?.agencyId);
  const agencyName =
    matchedAgency?.nameTh || "กรมส่งเสริมการปกครองท้องถิ่น (สถ.)";

  // Format timeLeft into MM : SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m} : ${s}`;
  };

  // An officer's inspection scope is the active license types of their own
  // agency — the same set the public verify page shows to citizens. Never show
  // a placeholder list here: this screen is read as a government credential.
  const permissionsToRender = licenseTypes
    .filter((type) => type.isActive && type.agencyId === profile?.agencyId)
    .map((type) => type.nameTh);

  if (isProfileLoading) {
    return (
      <main className="mx-auto w-full max-w-[430px] bg-[#f4f5f7] min-h-[calc(100vh-120px)] px-4 py-6 space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-[500px] w-full rounded-[32px]" />
      </main>
    );
  }

  // Not authorized check
  if (profileError || !isOfficer) {
    return (
      <main className="mx-auto w-full max-w-[430px] bg-[#f4f5f7] min-h-[calc(100vh-120px)] px-4 py-6 flex flex-col justify-center items-center text-center">
        <AlertCircle className="size-12 text-rose-500 mb-2" />
        <h3 className="text-base font-bold text-slate-800">
          ไม่มีสิทธิ์เข้าถึงหน้านี้
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          เฉพาะเจ้าหน้าที่ผู้มีอำนาจตรวจสอบเท่านั้น
        </p>
        <button
          onClick={() => router.push("/home")}
          className="mt-4 bg-[#145b57] text-white hover:bg-[#114e4b] rounded-xl px-4 py-2 text-xs font-bold transition-colors cursor-pointer border-0"
        >
          กลับหน้าหลัก
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[430px] bg-[#f4f5f7] min-h-screen px-4 pb-24 text-left text-slate-900">
      {/* Breadcrumbs Section */}
      <div className="pt-4 pb-2">
        <AppBreadcrumb
          variant="dark"
          items={[
            { label: "หน้าแรก", href: "/home" },
            { label: "QR Code เพื่อยืนยันตัวตนเจ้าหน้าที่" },
          ]}
        />
      </div>

      {/* Page Title */}
      <h1 className="text-[22px] font-extrabold text-slate-800 text-center my-4 tracking-tight">
        QR Code เพื่อยืนยันตัวตนเจ้าหน้าที่
      </h1>

      <div className="space-y-4">
        {/* Card 1: ID Card Container */}
        <Card className="rounded-[32px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.03)] text-left">
          {/* Top Header Band with blue gradient and circular emblem */}
          <div className="bg-gradient-to-r from-blue-100/70 to-sky-200/70 h-28 relative rounded-[20px]">
            {/* Emblem Circle - Green circle without any text */}
            <div className="absolute right-4 top-4 size-10 rounded-full bg-emerald-600 border border-emerald-500 shadow-sm" />
          </div>

          {/* Profile Content Overlapping */}
          <div className="px-4 pb-2 pt-0 relative">
            {/* Profile Photo - Person icon */}
            <div className="absolute -top-10 left-4 size-20 rounded-2xl overflow-hidden border-[3px] border-white shadow-md bg-[#e2e8f0] flex items-center justify-center">
              <User className="size-10 text-slate-400" />
            </div>

            {/* Profile Info (Name & Agency) */}
            <div className="pt-14 space-y-1">
              <h2 className="text-[18px] font-extrabold text-slate-900 tracking-tight">
                {profile?.displayName || "นายชนรัญ เพชรวรสกุล"}
              </h2>
              <p className="text-[12px] text-slate-500 font-bold leading-normal">
                {agencyName}
              </p>
            </div>

            <div className="border-b border-slate-100 my-5" />

            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center py-2 text-center">
              {isQrLoading || !verifyOrigin ? (
                <div className="size-48 bg-slate-50 rounded-2xl flex items-center justify-center text-xs text-slate-400 font-semibold animate-pulse">
                  กำลังดาวน์โหลด QR...
                </div>
              ) : qrError || !qrData ? (
                <div className="size-48 rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 px-4 text-center">
                  <AlertCircle className="size-6 text-rose-500" />
                  <p className="text-[11px] font-semibold text-slate-500 leading-normal">
                    ยังไม่สามารถออก QR Code ได้
                  </p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#145b57] px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-[#114e4b] cursor-pointer border-0"
                  >
                    <RefreshCw className="size-3" />
                    ลองใหม่
                  </button>
                </div>
              ) : (
                // DECISION: QR encodes the frontend verify page URL (/verify-officer?token=...)
                // so citizens land on the UI page, not raw backend JSON.
                // The frontend page then calls GET /api/public/officers/verify/:token.
                // The code is drawn locally — the token must not travel to a
                // third-party QR image service.
                <div className="relative p-2 bg-white rounded-2xl border border-slate-200/80 shadow-md">
                  <QrCodeImage
                    value={`${verifyOrigin}${officerVerifyPath(qrData.qrToken)}`}
                    size={176}
                    alt="QR Code ยืนยันตัวตนเจ้าหน้าที่"
                    className="rounded-xl"
                  />
                </div>
              )}

              {/* Countdown Timer — only meaningful next to a real QR code */}
              {qrData && !qrError && (
                <div className="mt-4 space-y-1">
                  <p className="text-[12px] text-slate-500 font-bold">
                    QR Code จะหมดอายุใน
                  </p>
                  <p className="text-[26px] font-black text-slate-800 leading-none py-1">
                    {formatTime(timeLeft)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    ให้ประชาชนหรือผู้ประกอบการสแกนเพื่อตรวจสอบตัวตน
                  </p>
                </div>
              )}
            </div>

            <div className="border-b border-slate-100 my-5" />

            {/* Details Table */}
            <div className="space-y-4">
              <div className="flex items-start text-xs leading-normal">
                <span className="w-20 text-slate-500 font-bold shrink-0">
                  ตำแหน่ง :
                </span>
                <span className="text-slate-800 font-extrabold">
                  เจ้าหน้าที่ผู้มีอำนาจตรวจสอบใบอนุญาต
                </span>
              </div>
              <div className="border-b border-dashed border-slate-200/80 w-full" />
              <div className="flex items-start text-xs leading-normal">
                <span className="w-20 text-slate-500 font-bold shrink-0">
                  หน่วยงาน :
                </span>
                <span className="text-slate-800 font-extrabold">
                  {agencyName}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Card 2: Permissions Card */}
        <Card className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.03)] text-left">
          <CardContent className="p-0 space-y-3.5">
            <div>
              <h3 className="text-[14px] font-bold text-slate-800 tracking-tight">
                สิทธิ์ของเจ้าหน้าที่
              </h3>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                ที่มีสิทธิ์เข้าตรวจสอบ
              </p>
            </div>

            {permissionsToRender.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1.5">
                {permissionsToRender.map((perm: string, index: number) => (
                  <span
                    key={index}
                    className="bg-emerald-50/80 border border-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1.5 rounded-xl leading-normal shrink-0"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            ) : (
              <p className="pt-1.5 text-[11px] font-semibold text-slate-400">
                ไม่พบข้อมูลสิทธิ์การตรวจสอบของหน่วยงานนี้
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
