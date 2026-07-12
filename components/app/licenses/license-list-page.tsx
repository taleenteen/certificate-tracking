"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

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
import type { JuristicLicenseGroupResponse } from "@/hooks/useLicenses";
import type { StatusBadgeStatus } from "@/components/shared/StatusBadge";
import { AppBreadcrumb } from "@/components/shared/app-breadcrumb";
import { motion, AnimatePresence } from "framer-motion";

dayjs.extend(buddhistEra);
dayjs.locale("th");

interface LicenseListPageViewProps {
  personalLicenses: LicenseCardItem[];
  juristicGroups: JuristicLicenseGroupResponse[];
  activeTab: "personal" | "juristic";
  onTabChange: (tab: "personal" | "juristic") => void;
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
  personalLicenses,
  juristicGroups,
  activeTab,
  onTabChange,
  devSeedButton,
}: LicenseListPageViewProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [expandedCompanies, setExpandedCompanies] = useState<Record<string, boolean>>({});
  const [expandedBusinesses, setExpandedBusinesses] = useState<Record<string, boolean>>({});

  const toggleCompany = (juristicId: string) => {
    setExpandedCompanies((prev) => ({
      ...prev,
      [juristicId]: !prev[juristicId],
    }));
  };

  const toggleBusiness = (businessId: string) => {
    setExpandedBusinesses((prev) => ({
      ...prev,
      [businessId]: !prev[businessId],
    }));
  };

  // Helper to format raw grouped licenses into the card view model
  const formatLicenseItem = (
    lib:
      | JuristicLicenseGroupResponse["corporateLicenses"][number]
      | JuristicLicenseGroupResponse["businesses"][number]["licenses"][number],
    companyName: string
  ): LicenseCardItem => {
    let uiStatus: StatusBadgeStatus = "active";
    if (lib.status === "EXPIRED") uiStatus = "expired";
    if (lib.status === "SUSPENDED" || lib.status === "REVOKED") uiStatus = "suspended";

    const expiryDate = dayjs(lib.expiresAt);
    if (lib.status === "ACTIVE" && lib.expiresAt && expiryDate.isBefore(dayjs().add(30, "day"))) {
      uiStatus = "expiringSoon";
    }

    return {
      id: lib.id,
      holderName: companyName,
      licenseName: lib.licenseType.nameTh,
      licenseNumber: lib.licenseNumber,
      status: uiStatus,
      issuedAt: dayjs(lib.issuedAt).format("D ม.ค. BBBB"),
      expiresAt: lib.expiresAt ? dayjs(lib.expiresAt).format("D ม.ค. BBBB") : "ไม่มีวันหมดอายุ",
      previewUrl: lib.previewUrl,
      detailsHref: `/licenses/${lib.id}?from=my-licenses`,
    };
  };

  const handleScanMock = async () => {
    setIsQrScannerOpen(false);
    // Mock QR scan handler fallback
    if (personalLicenses.length > 0) {
      const fallbackId = personalLicenses[0].id;
      toast.info("จำลองสแกนใบอนุญาตสำเร็จ");
      router.push(`/licenses/${fallbackId}?hideVerify=true&from=my-licenses`);
    } else {
      toast.error("ไม่มีข้อมูลจำลองในระบบ");
    }
  };

  // Filter personal licenses
  const filteredPersonalLicenses = useMemo(() => {
    return personalLicenses.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      return true;
    });
  }, [personalLicenses, statusFilter]);

  // Filter and format juristic license groups
  const filteredJuristicGroups = useMemo(() => {
    return juristicGroups.map((group) => {
      const corporateLicenses = group.corporateLicenses ?? [];
      const filteredCorporateLicenses = corporateLicenses.filter((lib) => {
        let uiStatus: StatusBadgeStatus = "active";
        if (lib.status === "EXPIRED") uiStatus = "expired";
        if (lib.status === "SUSPENDED" || lib.status === "REVOKED") uiStatus = "suspended";
        const expiryDate = dayjs(lib.expiresAt);
        if (lib.status === "ACTIVE" && lib.expiresAt && expiryDate.isBefore(dayjs().add(30, "day"))) {
          uiStatus = "expiringSoon";
        }

        if (statusFilter !== "all" && uiStatus !== statusFilter) return false;
        return true;
      });
      const filteredBusinesses = group.businesses.map((business) => {
        const filteredLicenses = business.licenses.filter((lib) => {
          let uiStatus: StatusBadgeStatus = "active";
          if (lib.status === "EXPIRED") uiStatus = "expired";
          if (lib.status === "SUSPENDED" || lib.status === "REVOKED") uiStatus = "suspended";
          const expiryDate = dayjs(lib.expiresAt);
          if (lib.status === "ACTIVE" && lib.expiresAt && expiryDate.isBefore(dayjs().add(30, "day"))) {
            uiStatus = "expiringSoon";
          }

          if (statusFilter !== "all" && uiStatus !== statusFilter) return false;
          return true;
        });

        return {
          ...business,
          filteredLicenses,
        };
      }).filter((business) => {
        if (statusFilter !== "all") {
          return business.filteredLicenses.length > 0;
        }
        return true;
      });

      return {
        ...group,
        filteredCorporateLicenses,
        filteredBusinesses,
      };
    });
  }, [juristicGroups, statusFilter]);

  // Calculate total license counts for dynamic display
  const totalCount = useMemo(() => {
    if (activeTab === "personal") {
      return filteredPersonalLicenses.length;
    }
    return filteredJuristicGroups.reduce((acc, group) => {
      return acc + group.filteredCorporateLicenses.length;
    }, 0);
  }, [activeTab, filteredPersonalLicenses, filteredJuristicGroups]);

  return (
    <main className="min-h-screen bg-[#f4f5f7] pb-12 text-slate-900">
      <div className="mx-auto max-w-[430px] bg-[#f4f5f7] min-h-screen text-left shadow-sm">
        {/* Title banner - full width, no rounded corners, no outer padding */}
        <div className="relative overflow-hidden min-h-[150px] bg-gradient-to-b from-[#06422F] to-[#0A4D35] flex flex-col justify-between p-5 mb-6 shadow-sm">
          <AppBreadcrumb
            items={[
              { label: "หน้าแรก", href: "/home" },
              { label: "ใบอนุญาตของฉัน" }
            ]}
          />
          <h2 className="z-10 text-[24px] font-bold text-white tracking-wide text-center mb-2">
            ใบอนุญาตของฉัน
          </h2>
        </div>

        {/* Content area with horizontal padding */}
        <div className="px-4">
          {/* Customized Tabs Segment with page background color, no shadow, clean bottom border */}
          <div className="flex border-b border-slate-200 mb-6 select-none bg-transparent">
            {/* Personal Tab */}
            <button
              type="button"
              onClick={() => onTabChange("personal")}
              className={`flex-1 text-center pb-3.5 text-[14px] font-bold transition-all border-b-2 -mb-px cursor-pointer bg-transparent border-0 ${
                activeTab === "personal"
                  ? "text-[#0A4D35] border-[#0A4D35] border-b-2"
                  : "text-slate-400 border-transparent hover:text-slate-500"
              }`}
            >
              บุคคลธรรมดา
            </button>

            {/* Juristic Tab */}
            <button
              type="button"
              onClick={() => onTabChange("juristic")}
              className={`flex-1 text-center pb-3.5 text-[14px] font-bold transition-all border-b-2 -mb-px cursor-pointer bg-transparent border-0 ${
                activeTab === "juristic"
                  ? "text-[#0A4D35] border-[#0A4D35] border-b-2"
                  : "text-slate-400 border-transparent hover:text-slate-500"
              }`}
            >
              นิติบุคคล
            </button>
          </div>

          {/* Statistics & Status selection row */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-bold text-slate-500">
              พบ {totalCount} รายการ
            </p>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white rounded-xl shadow-sm text-[12px] font-bold text-slate-600 hover:bg-slate-50 cursor-pointer border-0"
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
          {activeTab === "personal" ? (
            filteredPersonalLicenses.length > 0 ? (
              <div className="space-y-4">
                {filteredPersonalLicenses.map((item) => (
                  <LicenseCertificateCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-[13px] text-slate-500 shadow-sm">
                ไม่พบข้อมูลใบอนุญาตบุคคลธรรมดา
              </div>
            )
          ) : (
            filteredJuristicGroups.length > 0 ? (
              <div className="space-y-6">
                {filteredJuristicGroups.map((group) => (
                  <div key={group.juristicId} className="space-y-4">
                    {/* Collapsible company card (styled like the mockup card) */}
                    <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] text-left space-y-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-800 leading-snug">
                          {group.nameTh}
                        </h3>
                        <p className="text-[12px] font-semibold text-slate-400 mt-1">
                          เลขนิติบุคคล : {group.registrationId}
                        </p>
                        <div className="mt-1 space-y-0.5">
                          <p className="text-[12px] font-semibold text-slate-400">
                            บทบาท : {group.myRole}
                          </p>
                          <p className="text-[12px] font-semibold text-slate-400">
                            ใบอนุญาตระดับนิติบุคคล : {group.filteredCorporateLicenses.length} รายการ
                          </p>
                          <p className="text-[12px] font-semibold text-slate-400">
                            สถานประกอบการ : {group.businessCount} แห่ง
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                        <h4 className="text-[13px] font-bold text-[#145b57]">
                          ใบอนุญาตระดับนิติบุคคล
                        </h4>
                        {group.filteredCorporateLicenses.length > 0 ? (
                          <div className="space-y-4">
                            {group.filteredCorporateLicenses.map((lib) => {
                              const cardItem = formatLicenseItem(lib, group.nameTh);
                              return <LicenseCertificateCard key={lib.id} item={cardItem} />;
                            })}
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-center text-xs font-semibold text-slate-400">
                            ยังไม่มีใบอนุญาตระดับนิติบุคคล
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleCompany(group.juristicId)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-bold text-slate-600 hover:text-slate-800 border border-slate-200/60 rounded-xl transition-all"
                      >
                        <span>{expandedCompanies[group.juristicId] ? "ซ่อนรายละเอียด" : "รายละเอียด"}</span>
                        <ChevronDown
                          className="h-4 w-4 text-slate-400 transition-transform duration-200"
                          style={{ transform: expandedCompanies[group.juristicId] ? "rotate(180deg)" : "none" }}
                        />
                      </button>

                      {/* Collapsible nested businesses list inside company card */}
                      {expandedCompanies[group.juristicId] && (
                        <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in duration-150">
                          {group.filteredBusinesses.length > 0 ? (
                            group.filteredBusinesses.map((business) => (
                              <div key={business.id} className="bg-slate-50 border border-slate-200/60 rounded-[20px] p-4 space-y-3.5">
                                <div>
                                  <h4 className="text-[14px] font-bold text-slate-700 leading-snug">
                                    {business.nameTh}
                                  </h4>
                                  <p className="text-[12px] font-semibold text-slate-400 mt-0.5">
                                    จังหวัด : {business.province}
                                  </p>
                                </div>

                                <div className="space-y-3">
                                  <Link
                                    href={`/businesses/${business.id}?from=my-licenses`}
                                    className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#0A4D35] hover:bg-[#083E2A] text-[14px] font-bold text-white transition-colors shadow-sm"
                                  >
                                    ดูรายละเอียด
                                  </Link>

                                  <div className="flex justify-center">
                                    <button
                                      type="button"
                                      onClick={() => toggleBusiness(business.id)}
                                      className="flex items-center justify-center gap-1.5 py-1 text-[13px] font-bold text-slate-800 hover:text-slate-900 cursor-pointer bg-transparent border-0"
                                    >
                                      <span>
                                        {expandedBusinesses[business.id]
                                          ? "ซ่อนรายการ"
                                          : "แสดงรายการ"}
                                      </span>
                                      <ChevronDown
                                        className="h-4 w-4 text-slate-600 transition-transform duration-200"
                                        style={{
                                          transform: expandedBusinesses[business.id]
                                            ? "rotate(180deg)"
                                            : "none",
                                        }}
                                      />
                                    </button>
                                  </div>
                                </div>

                                {/* Nested licenses list under the business */}
                                <AnimatePresence initial={false}>
                                  {expandedBusinesses[business.id] && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2, ease: "easeInOut" }}
                                      className="overflow-hidden"
                                    >
                                      <div className="space-y-4 pt-4 border-t border-slate-200/50 mt-3">
                                        <h5 className="text-[13px] font-bold text-[#145b57]">
                                          ใบอนุญาต ({business.filteredLicenses.length})
                                        </h5>
                                        <div className="space-y-4">
                                          {business.filteredLicenses.length > 0 ? (
                                            business.filteredLicenses.map((lib) => {
                                              const cardItem = formatLicenseItem(lib, business.nameTh);
                                              return <LicenseCertificateCard key={lib.id} item={cardItem} />;
                                            })
                                          ) : (
                                            <div className="p-3.5 text-center text-xs text-slate-400 font-semibold bg-white rounded-xl border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
                                              ไม่มีข้อมูลใบอนุญาตภายใต้สถานประกอบการนี้
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-xs text-slate-400 font-semibold bg-white rounded-xl border border-slate-100">
                              ไม่มีข้อมูลสถานประกอบการ
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-[13px] text-slate-500 shadow-sm">
                ไม่พบข้อมูลนิติบุคคลหรือใบอนุญาต
              </div>
            )
          )}

          {/* Developer Seeding Section */}
          {devSeedButton && (
            <div className="mt-8 text-center">{devSeedButton}</div>
          )}
        </div>
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
