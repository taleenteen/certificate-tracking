"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  CircleUserRound,
  ScanSearch,
  Search,
  SlidersHorizontal,
} from "lucide-react";
// import { MdOutlineSearch, MdOutlineTune } from "react-icons/md";
import {
  BusinessFilterPanel,
  type BusinessCategory,
} from "./business-filter-panel";
import { QrScannerDialog } from "./qr-scanner-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SEARCH_PAGE_CONFIG: Record<
  string,
  { placeholder: string; action: "filter" | "scan" }
> = {
  "/e-map": { placeholder: "ค้นหาในแผนที่", action: "filter" },
  "/establishment": { placeholder: "ค้นหาสถานประกอบการ", action: "filter" },
  "/reports": { placeholder: "ค้นหารายงาน", action: "filter" },
  "/license-search": { placeholder: "ค้นหาใบอนุญาต", action: "scan" },
};

const DETAIL_PAGE_TITLES: Record<string, string> = {
  "/establishment": "รายละเอียดสถานประกอบการ",
  "/my-licenses": "รายละเอียดใบอนุญาต",
};

const STANDALONE_PAGE_TITLES: Record<string, string> = {
  "/my-licenses": "ใบอนุญาตของฉัน",
  "/expired-licenses": "ใบอนุญาตหมดอายุ",
};

export function BackOfficeNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchPageConfig = SEARCH_PAGE_CONFIG[pathname];
  const searchPlaceholder = searchPageConfig?.placeholder;
  const detailPageTitle = getDetailPageTitle(pathname);
  const rawQuery = searchParams.get("q") ?? "";
  const selectedCategories = parseCategories(searchParams.get("categories"));
  const selectedRegion = searchParams.get("region") ?? "";
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  const value = useMemo(
    () => draftValues[pathname] ?? rawQuery,
    [draftValues, pathname, rawQuery],
  );
  const activeFilterCount =
    selectedCategories.length + Number(Boolean(selectedRegion));

  const updateSearch = (nextValue: string) => {
    setDraftValues((current) => ({
      ...current,
      [pathname]: nextValue,
    }));

    if (!searchPlaceholder) return;

    const trimmed = nextValue.trim();
    updateUrlParams({ q: trimmed || null });
  };

  const handleMockScan = (value: string) => {
    setDraftValues((current) => ({
      ...current,
      [pathname]: value,
    }));
    updateUrlParams({ q: value });
    setIsQrScannerOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 border-white/10 bg-[#114e4b] text-white backdrop-blur">
      <div className="relative mx-auto w-full max-w-6xl px-4 py-3 sm:px-6">
        {searchPlaceholder ? (
          <>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Go back"
                onClick={() => router.back()}
                className="h-10 w-10 rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <div className="flex flex-1 items-center gap-2 rounded-2xl bg-white px-3 py-2 text-slate-700 shadow-sm">
                <Search className="h-4 w-4 text-slate-400" />
                <Input
                  className="h-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                  placeholder={searchPlaceholder}
                  value={value}
                  onChange={(event) => updateSearch(event.target.value)}
                />
                {searchPageConfig?.action === "filter" ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Open filters"
                    onClick={() => setIsFilterOpen((current) => !current)}
                    className="relative h-9 w-9 rounded-xl text-[#114e4b] hover:bg-slate-100 hover:text-[#114e4b]"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    {activeFilterCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#114e4b] px-1 text-[10px] font-semibold text-white">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Scan QR code"
                    onClick={() => setIsQrScannerOpen(true)}
                    className="h-9 w-9 rounded-xl text-[#114e4b] hover:bg-slate-100 hover:text-[#114e4b]"
                  >
                    <ScanSearch className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {searchPageConfig?.action === "filter" && isFilterOpen && (
              <div
                aria-hidden={!isFilterOpen}
                className={[
                  "pointer-events-none absolute top-full z-40 pt-0.5 transition-all duration-300 ease-out",
                  "left-0 right-0",
                  isFilterOpen
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-3 opacity-0",
                ].join(" ")}
              >
                <div
                  className={[
                    "pointer-events-auto origin-top transition-transform duration-300 ease-out",
                    isFilterOpen ? "scale-100" : "scale-[0.98]",
                  ].join(" ")}
                >
                  <BusinessFilterPanel
                    initialValue={{
                      categories: selectedCategories,
                      region: selectedRegion || undefined,
                    }}
                    onApply={(filters) => {
                      updateUrlParams({
                        categories:
                          filters.categories && filters.categories.length > 0
                            ? filters.categories.join(",")
                            : null,
                        region: filters.region ?? null,
                      });
                      setIsFilterOpen(false);
                    }}
                    onReset={() => {
                      updateUrlParams({
                        categories: null,
                        region: null,
                      });
                      setIsFilterOpen(false);
                    }}
                  />
                </div>
              </div>
            )}
          </>
        ) : detailPageTitle ? (
          <div className="grid grid-cols-[40px_1fr_40px] items-center">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Go back"
              onClick={() => router.back()}
              className="h-10 w-10 rounded-full text-white hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <h1 className="text-center text-base font-semibold text-white sm:text-[1.125rem]">
              {detailPageTitle}
            </h1>

            <div aria-hidden="true" className="h-10 w-10" />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {/* <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/60">
                Back Office
              </p>
              <h1 className="text-sm font-semibold sm:text-base">
                Certificate Tracking
              </h1>
            </div> */}
            <div>
              <p className="text-xl font-semibold leading-tight">
                ยินดีต้อนรับ, คุณสมชาย
              </p>
              <p className="mt-1 text-sm text-white/70">เจ้าหน้าที่</p>
            </div>

            <div className="flex items-center gap-2">
              <IconButton ariaLabel="Notifications">
                <Bell className="size-5" />
              </IconButton>
              <IconButton ariaLabel="Profile">
                <CircleUserRound className="size-5" />
              </IconButton>
            </div>
          </div>
        )}
      </div>
      <QrScannerDialog
        open={isQrScannerOpen}
        onOpenChange={setIsQrScannerOpen}
        onScanMock={handleMockScan}
      />
    </header>
  );

  function updateUrlParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    const nextUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    router.replace(nextUrl, { scroll: false });
  }
}

function getDetailPageTitle(pathname: string) {
  if (STANDALONE_PAGE_TITLES[pathname]) {
    return STANDALONE_PAGE_TITLES[pathname];
  }

  const matchedPrefix = Object.keys(DETAIL_PAGE_TITLES).find(
    (prefix) => pathname.startsWith(`${prefix}/`) && pathname !== prefix,
  );

  return matchedPrefix ? DETAIL_PAGE_TITLES[matchedPrefix] : null;
}

function parseCategories(value: string | null): BusinessCategory[] {
  if (!value) return [];

  return value
    .split(",")
    .filter((category): category is BusinessCategory =>
      ["hotel", "hospital", "factory", "education"].includes(category),
    );
}

function IconButton({
  children,
  ariaLabel,
}: {
  children: ReactNode;
  ariaLabel: string;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-label={ariaLabel}
      className="h-9 w-9 text-white hover:bg-white/10 hover:text-white [&>svg]:size-5"
    >
      {children}
    </Button>
  );
}
