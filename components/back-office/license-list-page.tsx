"use client";

import { ReactNode, useMemo, useState } from "react";

import {
  LicenseCertificateCard,
  type LicenseCardItem,
} from "@/components/back-office/license-certificate-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LicenseTab = {
  value: string;
  label: string;
  filter: (item: LicenseCardItem) => boolean;
};

type LicenseListPageViewProps = {
  items: LicenseCardItem[];
  defaultTab: string;
  tabs: LicenseTab[];
  tabActions?: Record<string, ReactNode>;
};

export function LicenseListPageView({
  items,
  defaultTab,
  tabs,
  tabActions,
}: LicenseListPageViewProps) {
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

export const MY_LICENSE_TABS: LicenseTab[] = [
  {
    value: "all",
    label: "ทั้งหมด",
    filter: () => true,
  },
  {
    value: "active",
    label: "ใช้งาน",
    filter: (item) => item.status === "active",
  },
  {
    value: "expiringSoon",
    label: "ใกล้หมดอายุ",
    filter: (item) => item.status === "expiringSoon",
  },
];

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
