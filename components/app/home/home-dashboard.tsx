"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ChartConfig } from "@/components/ui/chart";
import { Search, ScanSearch } from "lucide-react";
import heroRightImage from "@/assets/hero/hero-right.png";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { useAuthStore } from "@/stores/auth";
import {
  useDashboard,
  effectivePrimaryRole,
  type OfficerDashboardResponse,
  type AdminDashboardResponse,
} from "@/hooks/useDashboard";
import { useLicenses } from "@/hooks/useLicenses";
import dayjs from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { http } from "@/lib/http";
import { QrScannerDialog } from "@/components/app-shell/qr-scanner-dialog";
import { openExternalQrUrl } from "@/lib/external-qr-url";
import { SearchSheetOverlay } from "@/components/shared/search-sheet-overlay";
import { HomepageService } from "@/components/app/home/homepage-service";
import { ComplaintsSheetOverlay } from "@/components/shared/complaints-sheet-overlay";

type InspectionTrendDotProps = {
  key?: string | number;
  cx?: number;
  cy?: number;
  payload?: {
    label?: string;
  };
};

// DECISION: Premium stylized custom SVG graphics to match the mockup designs
const FolderGraphic = () => (
  <svg
    width="44"
    height="44"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
  >
    <path
      d="M4 12C4 9.79086 5.79086 8 8 8H20L24 13H40C42.2091 13 44 14.7909 44 17V38C44 40.2091 42.2091 42 40 42H8C5.79086 42 4 40.2091 4 38V12Z"
      fill="#145b57"
    />
    <rect
      x="8"
      y="12"
      width="32"
      height="24"
      rx="2"
      fill="#ffffff"
      fillOpacity="0.9"
    />
    <rect
      x="12"
      y="10"
      width="24"
      height="24"
      rx="2"
      fill="#ffffff"
      fillOpacity="0.7"
    />
    <path
      d="M4 17C4 14.7909 5.79086 13 8 13H40C42.2091 13 44 14.7909 44 17V38C44 40.2091 42.2091 42 40 42H8C5.79086 42 4 40.2091 4 38V17Z"
      fill="#1e7c75"
    />
    <path
      d="M4 17C4 15.8954 4.89543 15 6 15H18L21 17H40C41.1046 17 42 17.8954 42 19V38C42 39.1046 41.1046 40 40 40H8C6.89543 40 6 39.1046 6 38V17H4Z"
      fill="#208780"
    />
  </svg>
);

const MapGraphic = () => (
  <svg
    width="44"
    height="44"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
  >
    <path d="M6 14L18 10V34L6 38V14Z" fill="#3b9c80" />
    <path d="M18 10L30 14V38L18 34V10Z" fill="#e6a86c" />
    <path d="M30 14L42 10V34L30 38V14Z" fill="#1e7c75" />
    <path d="M18 10V34" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />
    <path d="M30 10V34" stroke="#000000" strokeWidth="1" strokeOpacity="0.1" />
    <path
      d="M24 10C20.13 10 17 13.13 17 17C17 22.25 24 29 24 29C24 29 31 22.25 31 17C31 13.13 27.87 10 24 10Z"
      fill="#d26262"
    />
    <circle cx="24" cy="17" r="3.5" fill="#ffffff" />
  </svg>
);

const BuildingGraphic = () => (
  <svg
    width="44"
    height="44"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
  >
    <rect x="8" y="18" width="8" height="22" rx="1" fill="#3b9c80" />
    <rect x="18" y="10" width="12" height="30" rx="1.5" fill="#1e7c75" />
    <rect x="32" y="16" width="8" height="24" rx="1" fill="#3b9c80" />
    <rect
      x="11"
      y="22"
      width="2"
      height="2"
      rx="0.5"
      fill="#ffffff"
      fillOpacity="0.8"
    />
    <rect
      x="11"
      y="27"
      width="2"
      height="2"
      rx="0.5"
      fill="#ffffff"
      fillOpacity="0.8"
    />
    <rect
      x="11"
      y="32"
      width="2"
      height="2"
      rx="0.5"
      fill="#ffffff"
      fillOpacity="0.8"
    />
    <rect
      x="21"
      y="14"
      width="2"
      height="2"
      rx="0.5"
      fill="#ffffff"
      fillOpacity="0.8"
    />
    <rect
      x="25"
      y="14"
      width="2"
      height="2"
      rx="0.5"
      fill="#ffffff"
      fillOpacity="0.8"
    />
    <rect
      x="21"
      y="19"
      width="2"
      height="2"
      rx="0.5"
      fill="#ffffff"
      fillOpacity="0.8"
    />
    <rect
      x="25"
      y="19"
      width="2"
      height="2"
      rx="0.5"
      fill="#ffffff"
      fillOpacity="0.8"
    />
    <rect
      x="21"
      y="24"
      width="2"
      height="2"
      rx="0.5"
      fill="#ffffff"
      fillOpacity="0.8"
    />
    <rect
      x="25"
      y="24"
      width="2"
      height="2"
      rx="0.5"
      fill="#ffffff"
      fillOpacity="0.8"
    />
    <rect
      x="21"
      y="29"
      width="2"
      height="2"
      rx="0.5"
      fill="#ffffff"
      fillOpacity="0.8"
    />
    <rect
      x="25"
      y="29"
      width="2"
      height="2"
      rx="0.5"
      fill="#ffffff"
      fillOpacity="0.8"
    />
    <rect
      x="21"
      y="34"
      width="2"
      height="2"
      rx="0.5"
      fill="#ffffff"
      fillOpacity="0.8"
    />
    <rect
      x="25"
      y="34"
      width="2"
      height="2"
      rx="0.5"
      fill="#ffffff"
      fillOpacity="0.8"
    />
    <rect
      x="35"
      y="20"
      width="2"
      height="2"
      rx="0.5"
      fill="#ffffff"
      fillOpacity="0.8"
    />
    <rect
      x="35"
      y="25"
      width="2"
      height="2"
      rx="0.5"
      fill="#ffffff"
      fillOpacity="0.8"
    />
    <rect
      x="35"
      y="30"
      width="2"
      height="2"
      rx="0.5"
      fill="#ffffff"
      fillOpacity="0.8"
    />
    <rect
      x="35"
      y="35"
      width="2"
      height="2"
      rx="0.5"
      fill="#ffffff"
      fillOpacity="0.8"
    />
  </svg>
);

const issueBars = [
  { label: "เอกสารไม่ครบ", value: 74, color: "bg-[#6f7cf6]" },
  { label: "หมดอายุแล้ว", value: 58, color: "bg-[#5db4dd]" },
  { label: "สถานที่ไม่ตรง", value: 49, color: "bg-[#e56ed9]" },
  { label: "ป้ายไม่ถูกต้อง", value: 31, color: "bg-[#c96ef1]" },
  { label: "ไม่มีใบแสดงตัว", value: 24, color: "bg-[#e47b9b]" },
];

const inspectionTrendData = {
  day: [
    { label: "จ.", inspections: 8 },
    { label: "อ.", inspections: 12 },
    { label: "พ.", inspections: 10 },
    { label: "พฤ.", inspections: 14 },
    { label: "ศ.", inspections: 18 },
    { label: "ส.", inspections: 9 },
    { label: "อา.", inspections: 6 },
  ],
  month: [
    { label: "ม.ค.", inspections: 48 },
    { label: "ก.พ.", inspections: 31 },
    { label: "มี.ค.", inspections: 29 },
    { label: "เม.ย.", inspections: 41 },
    { label: "พ.ค.", inspections: 53 },
    { label: "มิ.ย.", inspections: 49 },
    { label: "ก.ค.", inspections: 36 },
    { label: "ส.ค.", inspections: 41 },
    { label: "ก.ย.", inspections: 34 },
    { label: "ต.ค.", inspections: 28 },
    { label: "พ.ย.", inspections: 22 },
    { label: "ธ.ค.", inspections: 39 },
  ],
  year: [
    { label: "2563", inspections: 220 },
    { label: "2564", inspections: 264 },
    { label: "2565", inspections: 318 },
    { label: "2566", inspections: 352 },
    { label: "2567", inspections: 401 },
  ],
} as const;

const trendRanges = [
  { value: "day", label: "วัน" },
  { value: "month", label: "เดือน" },
  { value: "year", label: "ปี" },
] as const;

const issueScaleTicks = [20, 40, 60, 80] as const;
const issueScalePositions = ["25%", "50%", "75%", "100%"] as const;

const inspectionTrendConfig = {
  inspections: {
    label: "การตรวจสอบ",
    color: "#145b57",
  },
} satisfies ChartConfig;

const extractOfficerToken = (scannedText: string): string => {
  try {
    if (
      scannedText.startsWith("http://") ||
      scannedText.startsWith("https://")
    ) {
      const url = new URL(scannedText);
      const parts = url.pathname.split("/").filter(Boolean);
      const idx = parts.findIndex((p) => p === "verify");
      if (idx !== -1 && parts[idx + 1]) {
        return parts.slice(idx + 1).join("/");
      }
      if (parts.length > 0) {
        return parts[parts.length - 1];
      }
    }
  } catch (e) {
    console.error("Failed to parse officer URL:", e);
  }
  return scannedText;
};

export function HomeDashboard() {
  const user = useAuthStore((s) => s.user);
  const activePortalMode = useAuthStore((s) => s.activePortalMode);
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlEntry = searchParams.get("entry");
  const role = effectivePrimaryRole(user?.roles ?? [], activePortalMode);
  const entry = activePortalMode ?? urlEntry ?? "public";
  const usesServiceHome = entry === "public" || entry === "officer";
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);
  const [isComplaintsSheetOpen, setIsComplaintsSheetOpen] = useState(false);
  const [selectedTrendRange, setSelectedTrendRange] =
    useState<(typeof trendRanges)[number]["value"]>("month");

  const { data: dashboardData } = useDashboard();
  const { data: licenses = [] } = useLicenses();

  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState<"license" | "officer">(
    "license",
  );

  const handleScanMock = (value: string) => {
    setIsQrScannerOpen(false);
    if (scannerMode === "officer") {
      const token = extractOfficerToken(value);
      router.push(`/verify-officer?token=${token}`);
      return;
    }
    if (!openExternalQrUrl(value)) {
      toast.error("QR Code นี้ไม่มีลิงก์เว็บไซต์ที่เปิดได้");
    }
  };

  // Summary statistics mapping for charts and indicators using real backend data
  const summaryStats = useMemo<
    { label: string; value: number; color: string }[]
  >(() => {
    // If officer, map to task counts as requested
    if (role === "officer") {
      const d = dashboardData as OfficerDashboardResponse | undefined;
      return [
        {
          label: "งานของฉัน (รอ)",
          value: d?.myPendingTasks ?? 0,
          color: "bg-[#dfa15f]",
        },
        {
          label: "กำลังตรวจ",
          value: d?.myInProgress ?? 0,
          color: "bg-[#5db4dd]",
        },
        {
          label: "ส่งคืน",
          value: d?.myReturnedToFix ?? 0,
          color: "bg-[#d26262]",
        },
        {
          label: "เสร็จเดือนนี้",
          value: d?.myCompletedThisMonth ?? 0,
          color: "bg-[#3b9c80]",
        },
      ];
    }

    // If admin
    if (role === "admin" && dashboardData) {
      const d = dashboardData as AdminDashboardResponse;
      const c = d.licenseCounts;
      return [
        { label: "มีผลบังคับใช้", value: c.ACTIVE ?? 0, color: "bg-[#3b9c80]" },
        { label: "ใกล้หมดอายุ", value: 0, color: "bg-[#e6a86c]" },
        { label: "หมดอายุ", value: c.EXPIRED ?? 0, color: "bg-[#d26262]" },
        { label: "ถูกระงับ", value: c.SUSPENDED ?? 0, color: "bg-[#717171]" },
      ];
    }

    // Public role: derive dynamically from user's active licenses (real operator metrics)
    const now = dayjs();
    return [
      {
        label: "มีผลบังคับใช้",
        value: licenses.filter(
          (l) =>
            l.status === "ACTIVE" &&
            !dayjs(l.expiresAt).isBefore(now.add(30, "day")),
        ).length,
        color: "bg-[#3b9c80]",
      },
      {
        label: "ใกล้หมดอายุ",
        value: licenses.filter(
          (l) =>
            l.status === "ACTIVE" &&
            dayjs(l.expiresAt).isBefore(now.add(30, "day")),
        ).length,
        color: "bg-[#e6a86c]",
      },
      {
        label: "หมดอายุ",
        value: licenses.filter((l) => l.status === "EXPIRED").length,
        color: "bg-[#d26262]",
      },
      {
        label: "ถูกระงับ",
        value: licenses.filter(
          (l) => l.status === "SUSPENDED" || l.status === "REVOKED",
        ).length,
        color: "bg-[#717171]",
      },
    ];
  }, [role, dashboardData, licenses]);

  const totalSummaryStats = summaryStats.reduce((t, i) => t + i.value, 0);
  const myLicensesCount = licenses.length;

  const activeInspectionTrendData = useMemo(
    () => [...inspectionTrendData[selectedTrendRange]],
    [selectedTrendRange],
  );

  const trendLabelPrefix = useMemo(() => {
    if (selectedTrendRange === "day") return "วัน";
    if (selectedTrendRange === "year") return "ปี";
    return "เดือน";
  }, [selectedTrendRange]);

  if (usesServiceHome) {
    return (
      <>
        <HomepageService
          role={role}
          onLicenseScanClick={() => {
            setScannerMode("license");
            setIsQrScannerOpen(true);
          }}
          onOfficerScanClick={() => {
            setScannerMode("officer");
            setIsQrScannerOpen(true);
          }}
          onComplaintsClick={() => setIsComplaintsSheetOpen(true)}
        />

        <QrScannerDialog
          open={isQrScannerOpen}
          onOpenChange={setIsQrScannerOpen}
          onScanMock={handleScanMock}
          id="home-qr-scanner"
          title={
            scannerMode === "officer"
              ? "สแกนคิวอาร์โค้ดบัตรเจ้าหน้าที่"
              : "สแกนคิวอาร์โค้ดใบอนุญาต"
          }
          description={
            scannerMode === "officer"
              ? "วางคิวอาร์โค้ดบัตรเจ้าหน้าที่ให้อยู่ภายในกรอบเพื่อดำเนินการ"
              : "วางคิวอาร์โค้ดให้อยู่ภายในกรอบเพื่อดำเนินการ"
          }
        />

        <SearchSheetOverlay
          isOpen={isSearchSheetOpen}
          onClose={() => setIsSearchSheetOpen(false)}
        />

        <ComplaintsSheetOverlay
          isOpen={isComplaintsSheetOpen}
          onClose={() => setIsComplaintsSheetOpen(false)}
        />
      </>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[440px] min-w-0 overflow-x-hidden bg-[#f4f5f7] text-slate-900 md:max-w-none">
      {/* Top Banner and Menu Cards Section */}
      <section className="bg-white px-4 pb-6 pt-5 text-black sm:px-6 text-left">
        {/* Welcome Header */}
        {/* <div className="flex items-center justify-between gap-4 mb-5">
          <div className="text-left">
            <h2 className="text-[16px] font-bold text-slate-900 leading-tight">
              ยินดีต้อนรับ, {user?.fullName || "คุณสมชาย"}
            </h2>
            <p className="text-[12px] text-slate-500 font-semibold mt-0.5">
              {role === "officer" ? "เจ้าหน้าที่" : "บุคคลทั่วไป"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              type="button" 
              className="relative text-slate-600 hover:text-slate-900"
            >
              <Bell className="size-6 text-slate-500" strokeWidth={1.5} />
            </button>
            <button 
              type="button" 
              className="relative text-slate-600 hover:text-slate-900"
            >
              <User className="size-7 text-slate-500 border border-slate-300 rounded-full p-0.5" strokeWidth={1.5} />
            </button>
          </div>
        </div> */}

        {/* Search row */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-slate-700 shadow-sm border border-gray-200/50">
            <Link
              href="/license-search"
              className="flex flex-1 items-center gap-2"
            >
              <Search className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">ค้นหาใบอนุญาต</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setScannerMode("license");
                setIsQrScannerOpen(true);
              }}
              className="text-[#145b57] cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="Scan QR Code"
            >
              <ScanSearch className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Hero Banner Card */}
        <div className="mt-5 rounded-2xl border border-[#d2eae6] bg-[#f2faf8] p-4 pr-1 relative overflow-hidden">
          <div className="grid grid-cols-[1.4fr_1fr] items-center gap-2">
            <div className="z-10">
              <h3 className="text-[16px] font-bold text-slate-900 leading-snug">
                ตรวจสอบใบอนุญาต <br />
                <span className="text-[#145b57] text-[18px]">
                  ได้อย่างมั่นใจ
                </span>
              </h3>
              <p className="mt-2 text-[10px] leading-relaxed text-slate-500 font-medium">
                ค้นหาและดูสถานะใบอนุญาตของ <br />
                สถานประกอบการได้ง่ายและรวดเร็ว
              </p>
            </div>

            <div className="relative h-[110px] w-full z-0">
              <Image
                src={heroRightImage}
                alt="ภาพประกอบการตรวจสอบใบอนุญาต"
                fill
                className="object-contain object-right animate-in fade-in duration-500"
                sizes="(min-width: 768px) 220px, 40vw"
                priority
              />
            </div>
          </div>
        </div>

        {/* 3 cards side-by-side (Mockup design - colored graphics directly on cards) */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {/* Card 1: ใบอนุญาตของฉัน */}
          <Link
            href="/licenses"
            className="bg-white border border-gray-200/60 rounded-[20px] p-3 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-slate-50 transition-colors flex flex-col items-center justify-center space-y-2 h-[110px]"
          >
            <FolderGraphic />
            <div className="space-y-0.5">
              <p className="text-[12px] font-bold text-slate-900 leading-tight">
                ใบอนุญาตของฉัน
              </p>
              <p className="text-[10px] text-slate-500 font-semibold leading-none">
                {myLicensesCount} รายการ
              </p>
            </div>
          </Link>

          {/* Card 2: e-Map */}
          <Link
            href="/e-map"
            className="bg-white border border-gray-200/60 rounded-[20px] p-3 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-slate-50 transition-colors flex flex-col items-center justify-center space-y-2 h-[110px]"
          >
            <MapGraphic />
            <div className="space-y-0.5">
              <p className="text-[12px] font-bold text-slate-900 leading-tight">
                e-Map
              </p>
              <p className="text-[10px] text-slate-500 font-semibold leading-none">
                ดูตำแหน่ง
              </p>
            </div>
          </Link>

          {/* Card 3: สถานประกอบการ */}
          <Link
            href="/businesses"
            className="bg-white border border-gray-200/60 rounded-[20px] p-3 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-slate-50 transition-colors flex flex-col items-center justify-center space-y-2 h-[110px]"
          >
            <BuildingGraphic />
            <div className="space-y-0.5">
              <p className="text-[12px] font-bold text-slate-900 leading-tight">
                สถานประกอบการ
              </p>
              <p className="text-[10px] text-slate-500 font-semibold leading-none font-sans">
                ค้นหาและดูข้อมูล
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Main Aggregations / Charts Content Section */}
      <section className="mt-4 rounded-t-[28px] bg-[#f4f5f7] px-4 pb-8 sm:px-6 text-left">
        {/* Header Label Conditional */}
        <div className="pt-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950 border-l-[3px] border-[#145b57] pl-2.5">
            {role === "officer" ? "ภาพรวมการตรวจสอบ" : "สัดส่วนสถานะใบอนุญาต"}
          </h2>
        </div>

        {/* Dynamic content wrapper grid */}
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr_0.9fr]">
          {/* Card 1: Status badge counts layout */}
          <Card className="min-w-0 rounded-[24px] border-0 py-0 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <CardContent className="space-y-5 p-4 text-left">
              <div>
                <h3 className="text-[15px] font-bold text-[#145b57]">
                  {role === "officer" ? "สถานะงานตรวจสอบ" : "สถานะใบอนุญาต"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  <span className="text-3xl font-bold text-slate-900">
                    {totalSummaryStats}
                  </span>{" "}
                  {role === "officer" ? "งาน" : "ใบอนุญาต"}
                </p>
              </div>

              {/* Progress split segments bar */}
              <div className="flex items-center gap-1">
                {summaryStats.map((item) => (
                  <div
                    key={item.label}
                    className={`h-2 rounded-full ${item.color}`}
                    style={{
                      width: `${totalSummaryStats > 0 ? (item.value / totalSummaryStats) * 100 : 0}%`,
                      minWidth: item.value > 0 ? "0.75rem" : "0px",
                    }}
                    aria-label={`${item.label} ${item.value}`}
                  />
                ))}
              </div>

              {/* Text labels below segments with dividers matching the mockup */}
              <div className="grid grid-cols-4 gap-0.5 text-center pt-2">
                {summaryStats.map((item, index) => (
                  <div
                    key={item.label}
                    className={`flex flex-col items-center justify-center ${index > 0 ? "border-l border-slate-200" : ""}`}
                  >
                    <p className="text-[18px] font-bold text-slate-900 leading-tight">
                      {item.value}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${item.color}`}
                      />
                      <span className="text-[10px] font-bold text-slate-500 leading-none shrink-0">
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Render charts ONLY for Officer roles */}
          {role === "officer" && (
            <>
              {/* Card 2: Spline area chart */}
              <Card className="min-w-0 rounded-[24px] border-0 py-0 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
                <CardContent className="p-4 text-left">
                  <div className="mb-3 flex justify-between items-center">
                    <h4 className="font-bold text-[14px] text-[#145b57]">
                      สถิติการตรวจสอบ
                    </h4>
                    <div className="flex rounded-md bg-slate-100 border border-slate-200 p-0.5 text-xs text-slate-500">
                      {trendRanges.map((range) => (
                        <button
                          key={range.value}
                          type="button"
                          onClick={() => setSelectedTrendRange(range.value)}
                          className={`${
                            range.value === selectedTrendRange
                              ? "bg-[#145b57] font-bold text-white shadow-sm"
                              : "text-slate-500 hover:text-slate-800"
                          } rounded-[6px] px-2.5 py-1 text-[11px] transition-colors`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="min-w-0 overflow-hidden">
                    <ChartContainer
                      id="home-inspection-trend"
                      config={inspectionTrendConfig}
                      className="h-[180px] min-w-0 w-full px-1 pt-4"
                    >
                      <AreaChart
                        accessibilityLayer
                        data={activeInspectionTrendData}
                        margin={{ left: -20, right: 10, top: 8, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="fillInspections"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="var(--color-inspections)"
                              stopOpacity={0.35}
                            />
                            <stop
                              offset="100%"
                              stopColor="var(--color-inspections)"
                              stopOpacity={0.04}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          vertical={false}
                          strokeDasharray="3 3"
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          fontSize={10}
                          width={30}
                          ticks={[0, 20, 40, 60, 80]}
                          domain={[0, 80]}
                          stroke="#94a3b8"
                        />
                        <ReferenceLine
                          x="ก.ย."
                          stroke="#94a3b8"
                          strokeDasharray="3 3"
                        />
                        <ChartTooltip
                          cursor={false}
                          content={
                            <ChartTooltipContent
                              indicator="dot"
                              labelFormatter={(label) =>
                                `${trendLabelPrefix} ${label}`
                              }
                            />
                          }
                        />
                        <Area
                          type="natural"
                          dataKey="inspections"
                          stroke="var(--color-inspections)"
                          strokeWidth={2}
                          fill="url(#fillInspections)"
                          dot={(props: InspectionTrendDotProps) => {
                            if (
                              props.payload?.label === "ก.ย." &&
                              typeof props.cx === "number" &&
                              typeof props.cy === "number"
                            ) {
                              return (
                                <circle
                                  key={props.key}
                                  cx={props.cx}
                                  cy={props.cy}
                                  r={4.5}
                                  fill="#145b57"
                                  stroke="#ffffff"
                                  strokeWidth={2}
                                />
                              );
                            }
                            return <g key={props.key} />;
                          }}
                          activeDot={{
                            r: 4,
                            fill: "var(--color-inspections)",
                            stroke: "#f4f5f7",
                            strokeWidth: 2,
                          }}
                        />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Common problems horizontal chart */}
              <Card className="min-w-0 rounded-[24px] border-0 py-0 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
                <CardContent className="p-4 text-left">
                  <h3 className="text-[15px] font-bold text-[#145b57] pb-2 border-b border-gray-100 mb-4">
                    ปัญหาที่พบบ่อย
                  </h3>
                  <div>
                    <div className="grid grid-cols-[90px_1fr] items-start gap-x-2 gap-y-3.5">
                      {issueBars.map((item) => (
                        <div key={item.label} className="contents">
                          <p className="text-[12px] font-medium leading-6 text-slate-600">
                            {item.label}
                          </p>
                          <div className="relative flex h-8 items-center">
                            <div className="absolute inset-y-0 left-0 right-0">
                              {issueScalePositions.map((position, index) => (
                                <div
                                  key={`${item.label}-${issueScaleTicks[index]}`}
                                  className="absolute inset-y-0 border-l border-dashed border-slate-200"
                                  style={{ left: position }}
                                />
                              ))}
                            </div>
                            <div
                              className={`relative h-4 rounded-full ${item.color} shadow-sm`}
                              style={{ width: `${(item.value / 80) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-2 grid grid-cols-[90px_1fr] gap-3">
                      <div />
                      <div className="relative h-4 text-[10px] text-slate-400 font-mono">
                        {issueScaleTicks.map((tick, index) => (
                          <span
                            key={tick}
                            className="absolute top-0 text-left"
                            style={{
                              left: issueScalePositions[index],
                              transform:
                                index === 0
                                  ? "translateX(0)"
                                  : index === issueScaleTicks.length - 1
                                    ? "translateX(-100%)"
                                    : "translateX(0)",
                            }}
                          >
                            {tick}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>

      <QrScannerDialog
        open={isQrScannerOpen}
        onOpenChange={setIsQrScannerOpen}
        onScanMock={handleScanMock}
        id="home-qr-scanner"
        title={
          scannerMode === "officer"
            ? "สแกนคิวอาร์โค้ดบัตรเจ้าหน้าที่"
            : "สแกนคิวอาร์โค้ดใบอนุญาต"
        }
        description={
          scannerMode === "officer"
            ? "วางคิวอาร์โค้ดบัตรเจ้าหน้าที่ให้อยู่ภายในกรอบเพื่อดำเนินการ"
            : "วางคิวอาร์โค้ดให้อยู่ภายในกรอบเพื่อดำเนินการ"
        }
      />
    </main>
  );
}
