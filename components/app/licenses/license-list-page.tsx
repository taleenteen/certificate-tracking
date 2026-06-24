"use client";

import { useMemo, useState } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  LicenseCertificateCard,
  type LicenseCardItem,
} from "@/components/app/licenses/license-certificate-card";
import { QrScannerDialog } from "@/components/app-shell/qr-scanner-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { http } from "@/lib/http";
import type { JuristicMembershipResponse } from "@/hooks/useLicenses";

interface LicenseListPageViewProps {
  items: LicenseCardItem[];
  activeTab: "personal" | "juristic";
  onTabChange: (tab: "personal" | "juristic") => void;
  memberships?: JuristicMembershipResponse[];
  activeJuristicId: string | null;
  onSwitchJuristicCompany: (juristicId: string | null) => void;
  isSwitching?: boolean;
  devSeedButton?: React.ReactNode;
}

const STATUS_LABELS: Record<string, string> = {
  all: "ทั้งหมด",
  active: "มีผลบังคับใช้",
  expiringSoon: "ใกล้หมดอายุ",
  expired: "หมดอายุ",
  suspended: "ถูกระงับ",
};

export function LicenseListPageView({
  items,
  activeTab,
  onTabChange,
  memberships = [],
  activeJuristicId,
  onSwitchJuristicCompany,
  isSwitching = false,
  devSeedButton,
}: LicenseListPageViewProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  // Find active company details
  const activeCompany = useMemo(() => {
    return memberships.find((m) => m.juristicId === activeJuristicId);
  }, [memberships, activeJuristicId]);

  // Extract ID helper for QR scan
  const extractIdFromScannedValue = (scannedText: string): string => {
    try {
      if (scannedText.startsWith("http://") || scannedText.startsWith("https://")) {
        const url = new URL(scannedText);
        const parts = url.pathname.split("/").filter(Boolean);
        const idx = parts.findIndex((p) => p === "my-licenses" || p === "licenses");
        if (idx !== -1 && parts[idx + 1]) {
          return parts.slice(idx + 1).join("/");
        }
        if (parts.length > 0) {
          return parts[parts.length - 1];
        }
      }
    } catch (e) {
      console.error("Failed to parse URL:", e);
    }
    return scannedText;
  };

  const handleScanMock = async (value: string) => {
    setIsQrScannerOpen(false);
    const cleanValue = extractIdFromScannedValue(value);
    try {
      await http.get(`licenses/${cleanValue}/qr-verify`);
      router.push(`/licenses/${cleanValue}?hideVerify=true`);
    } catch {
      if (items.length > 0) {
        const fallbackId = items[0].id;
        toast.info("ไม่พบรหัสใบอนุญาตนี้ในระบบ จึงแสดงใบอนุญาตตัวอย่างแทน");
        router.push(`/licenses/${fallbackId}?hideVerify=true`);
      } else {
        toast.error("ไม่พบใบอนุญาตนี้ และไม่มีข้อมูลตัวอย่างในระบบ");
      }
    }
  };

  // Local filtering logic for search query and status dropdown
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Status Filter
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      // 2. Search Query Filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.holderName.toLowerCase().includes(query);
        const matchesType = item.licenseName.toLowerCase().includes(query);
        const matchesNumber = item.licenseNumber.toLowerCase().includes(query);
        return matchesName || matchesType || matchesNumber;
      }
      return true;
    });
  }, [items, searchQuery, statusFilter]);

  return (
    <main className="min-h-screen bg-[#f4f5f7] pb-12 text-slate-900">
      <div className="mx-auto max-w-[430px] bg-[#f4f5f7] min-h-screen px-4 pt-4 text-left shadow-sm">
        {/* Search input with scan button */}
        <div className="relative flex items-center mb-4">
          <Search className="absolute left-4 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาใบอนุญาตของฉัน"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#145b57] focus:border-[#145b57] shadow-sm transition-all"
          />
          <button
            type="button"
            onClick={() => setIsQrScannerOpen(true)}
            className="absolute right-4 text-[#145b57] hover:opacity-80 transition-opacity cursor-pointer"
            aria-label="Scan QR Code"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 8V5C3 3.89543 3.89543 3 5 3H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M16 3H19C20.1046 3 21 3.89543 21 5V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M21 16V19C21 20.1046 20.1046 21 19 21H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M8 21H5C3.89543 21 3 20.1046 3 19V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
            </svg>
          </button>
        </div>

        {/* Title banner */}
        <div className="relative rounded-3xl overflow-hidden h-[120px] bg-slate-950 flex items-center justify-center mb-6 shadow-sm">
          {/* Decorative backdrop background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0f2e2b] via-[#1f3f3b] to-[#121212] opacity-85 z-0" />
          {/* Subtle line patterns or blurred card illustration mockup */}
          <div className="absolute right-0 bottom-0 opacity-10 w-1/2 h-full z-0 select-none">
            <svg width="100%" height="100%" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="20" y="20" width="160" height="80" rx="10" stroke="white" strokeWidth="4" />
              <line x1="40" y1="40" x2="160" y2="40" stroke="white" strokeWidth="2" />
              <line x1="40" y1="60" x2="120" y2="60" stroke="white" strokeWidth="2" />
            </svg>
          </div>
          <h2 className="z-10 text-[22px] font-bold text-white tracking-wide">
            ใบอนุญาตของฉัน
          </h2>
        </div>

        {/* Customized Tabs Segment */}
        <div className="flex border-b border-slate-200 mb-4 select-none">
          {/* Juristic Tab */}
          <button
            type="button"
            onClick={() => onTabChange("juristic")}
            className={`flex-1 text-center pb-3 text-[14px] font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === "juristic"
                ? "text-[#145b57] border-[#145b57]"
                : "text-slate-400 border-transparent hover:text-slate-500"
            }`}
          >
            นิติบุคคล <br />
            <span className="text-[12px] font-semibold opacity-80">(บริษัทที่เกี่ยวข้อง)</span>
          </button>

          {/* Personal Tab */}
          <button
            type="button"
            onClick={() => onTabChange("personal")}
            className={`flex-1 text-center pb-3 text-[14px] font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === "personal"
                ? "text-[#145b57] border-[#145b57]"
                : "text-slate-400 border-transparent hover:text-slate-500"
            }`}
          >
            บุคคลธรรมดา <br />
            <span className="text-[12px] font-semibold opacity-80">(ตัวฉันเอง)</span>
          </button>
        </div>

        {/* Company context selector for Juristic mode */}
        {activeTab === "juristic" && memberships.length > 0 && (
          <div className="mb-4 bg-white border border-slate-100 rounded-2xl p-3 shadow-sm">
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
              เลือกนิติบุคคลที่ต้องการตรวจสอบ
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-11 px-3 border-slate-200 rounded-xl bg-white hover:bg-slate-50 font-semibold text-slate-800 text-sm"
                >
                  <span className="truncate">
                    {activeCompany?.nameTh || "กรุณาเลือกนิติบุคคล..."}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[398px] max-h-[220px] overflow-y-auto rounded-xl">
                {memberships.map((m) => (
                  <DropdownMenuItem
                    key={m.juristicId}
                    onClick={() => onSwitchJuristicCompany(m.juristicId)}
                    className="flex justify-between items-center py-2.5 px-3 cursor-pointer text-slate-700 font-medium"
                  >
                    <span className="truncate">{m.nameTh}</span>
                    {m.juristicId === activeJuristicId && (
                      <Check className="h-4 w-4 text-[#145b57] shrink-0 ml-2" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Statistics & Status selection row */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-bold text-slate-500">
            พบ {filteredItems.length} รายการ
          </p>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white rounded-xl shadow-sm text-[12px] font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                <span>สถานะใบอนุญาต : {STATUS_LABELS[statusFilter]}</span>
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className="flex justify-between items-center py-2.5 px-3 cursor-pointer text-slate-700 font-medium text-xs"
                >
                  <span>{label}</span>
                  {statusFilter === key && (
                    <Check className="h-3 w-3 text-[#145b57] shrink-0 ml-2" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Content Area */}
        {isSwitching ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#145b57] border-t-transparent mb-2" />
            <p className="text-xs text-slate-500">กำลังสลับข้อมูล...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <LicenseCertificateCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-[13px] text-slate-500 shadow-sm">
            ไม่พบข้อมูลใบอนุญาต
            {activeTab === "juristic" && memberships.length === 0 && (
              <p className="text-[11px] text-slate-400 mt-1">ท่านยังไม่มีนิติบุคคลที่เกี่ยวข้องในระบบ</p>
            )}
          </div>
        )}

        {/* Developer Seeding Section */}
        {activeTab === "personal" && devSeedButton && (
          <div className="mt-8 text-center">{devSeedButton}</div>
        )}
      </div>

      <QrScannerDialog
        open={isQrScannerOpen}
        onOpenChange={setIsQrScannerOpen}
        onScanMock={handleScanMock}
        id="licenses-page-qr-scanner"
      />
    </main>
  );
}

// ─── Legacy view component and tabs configurations for compatibility ───────────

export type LicenseTab = {
  value: string;
  label: string;
  filter: (item: LicenseCardItem) => boolean;
};

type LegacyLicenseListPageViewProps = {
  items: LicenseCardItem[];
  defaultTab: string;
  tabs: LicenseTab[];
  tabActions?: Record<string, ReactNode>;
};

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ReactNode } from "react";

export function LegacyLicenseListPageView({
  items,
  defaultTab,
  tabs,
  tabActions,
}: LegacyLicenseListPageViewProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const filteredItems = useMemo(() => {
    const currentTab = tabs.find((tab) => tab.value === activeTab) ?? tabs[0];
    return items.filter(currentTab.filter);
  }, [activeTab, items, tabs]);

  return (
    <main className="min-h-[calc(100vh-57px)] bg-[#F9FAFB] px-4 py-4">
      <div className="mx-auto max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
          <TabsList className="grid h-10 w-full grid-cols-3 rounded-2xl bg-white p-1 shadow-[0_10px_25px_rgba(15,23,42,0.05)]">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-xl px-2 text-[13px] font-medium text-slate-500 data-[state=active]:text-[#114e4b]"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">
                พบ {filteredItems.length} รายการ
              </p>
              {tabActions?.[activeTab]}
            </div>

            {filteredItems.length > 0 ? (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <LicenseCertificateCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-[13px] text-slate-600 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
                ไม่พบข้อมูลในหมวดนี้
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

export const EXPIRED_LICENSE_TABS: LicenseTab[] = [
  {
    value: "all",
    label: "ทั้งหมด",
    filter: (item) =>
      item.status === "expired" || item.status === "suspended",
  },
  {
    value: "expired",
    label: "หมดอายุ",
    filter: (item) => item.status === "expired",
  },
  {
    value: "suspended",
    label: "ถูกระงับ",
    filter: (item) => item.status === "suspended",
  },
];

