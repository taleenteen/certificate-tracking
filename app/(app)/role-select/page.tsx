"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth";

export default function RoleSelectPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setActivePortalMode = useAuthStore((s) => s.setActivePortalMode);
  const roles = useMemo(() => user?.roles ?? [], [user?.roles]);
  const canUseOfficerMode = roles.includes("officer");

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

  const selectMode = (mode: "public" | "officer") => {
    setActivePortalMode(mode);
    router.push(`/home?entry=${mode}`);
  };

  if (!user || !canUseOfficerMode) return null;

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f4f5f7] px-4 py-6">
      <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-md flex-col justify-center">
        <div className="mb-8 space-y-3 text-center">
          <p className="text-sm font-medium text-[#114e4b]">E-License Platform</p>
          <h1 className="text-2xl font-semibold text-slate-950">
            เลือกโหมดการใช้งาน
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            คุณสามารถใช้งานระบบได้ทั้งในฐานะบุคคลธรรมดาและเจ้าหน้าที่
          </p>
        </div>

        <div className="space-y-3">
          <Card className="rounded-3xl border-slate-200 bg-white py-0 shadow-sm">
            <CardContent className="flex items-start gap-4 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f2ef] text-[#114e4b]">
                <UserRound className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-slate-950">
                  บุคคลธรรมดา
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  ตรวจสอบใบอนุญาต ดูข้อมูลธุรกิจ และใช้งานบริการสำหรับประชาชน
                </p>
                <Button
                  type="button"
                  className="mt-4 h-11 w-full rounded-2xl bg-[#114e4b] text-white hover:bg-[#0c403e]"
                  onClick={() => selectMode("public")}
                >
                  เข้าสู่โหมดบุคคลธรรมดา
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white py-0 shadow-sm">
            <CardContent className="flex items-start gap-4 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f2ef] text-[#114e4b]">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-slate-950">
                  เจ้าหน้าที่
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  ดูรายงาน ตรวจสอบสถานประกอบการ และใช้งานภาคสนาม
                </p>
                <Button
                  type="button"
                  className="mt-4 h-11 w-full rounded-2xl bg-[#114e4b] text-white hover:bg-[#0c403e]"
                  onClick={() => selectMode("officer")}
                >
                  เข้าสู่โหมดเจ้าหน้าที่
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
