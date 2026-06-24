"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Building2 } from "lucide-react";
import { toast } from "sonner";

import notFoundImage from "@/assets/search/not-found.png";
import preparePageImage from "@/assets/search/prepare-page.png";
import type { LicenseCardItem } from "@/components/app/licenses/license-certificate-card";
import { LicenseCertificateCard } from "@/components/app/licenses/license-certificate-card";
import { QrScannerDialog } from "@/components/app-shell/qr-scanner-dialog";
import { QrScannerIcon } from "@/components/icons/AppIcons";
import { http } from "@/lib/http";

type LicenseSearchPageViewProps = {
  items: LicenseCardItem[];
};

// Helper for escaping regex characters
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Helper to highlight matching text
function highlightText(text: string, search: string) {
  if (!search.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${escapeRegExp(search)})`, "gi");
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <strong key={i} className="font-bold text-slate-900 bg-teal-50 px-0.5 rounded">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

export function LicenseSearchPageView({ items }: LicenseSearchPageViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";

  const [searchQuery, setSearchQuery] = useState(query);
  const [isFocused, setIsFocused] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sync state if URL query changes externally
  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  // Handle click outside to close autocomplete popover
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFocused(false);
    updateUrlParams(searchQuery.trim() || null);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchQuery("");
    updateUrlParams(null);
  };

  // Search autocomplete logic (max 5 items)
  const autocompleteSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerQuery = searchQuery.toLowerCase().trim();
    return items
      .filter((item) =>
        [item.holderName, item.licenseName, item.licenseNumber]
          .join(" ")
          .toLowerCase()
          .includes(lowerQuery)
      )
      .slice(0, 5);
  }, [items, searchQuery]);

  // Main filtered search results
  const results = useMemo(() => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return items.filter((item) =>
      [item.holderName, item.licenseName, item.licenseNumber]
        .join(" ")
        .toLowerCase()
        .includes(lowerQuery)
    );
  }, [items, query]);

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

  const updateUrlParams = (q: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    
    const nextUrl = params.toString() ? `/license-search?${params.toString()}` : `/license-search`;
    router.replace(nextUrl, { scroll: false });
  };

  return (
    <main className="min-h-screen bg-[#f4f5f7] pb-12 text-slate-900">
      <div className="mx-auto max-w-[430px] bg-[#f4f5f7] min-h-screen text-left shadow-sm">
        {/* Animated Expanding Hero Banner */}
        <motion.div
          initial={{ height: 120 }}
          animate={{ height: 210 }}
          transition={{ type: "spring", stiffness: 90, damping: 14 }}
          className="relative bg-slate-950 flex flex-col justify-end p-4 pb-6 select-none z-20"
        >
          {/* Background decorations container wrapper to constrain visual elements without cutting off dropdown */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Background image pattern overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0f2e2b] via-[#1a3834] to-[#121212] opacity-90" />
            {/* Subtle design circles */}
            <div className="absolute right-[-20px] top-[-20px] w-48 h-48 rounded-full border border-white/5" />
          </div>

          {/* Banner Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="z-10 text-[20px] font-bold text-white leading-tight mb-4 pr-6 text-left"
          >
            ค้นหาใบอนุญาต <br />
            และสถานประกอบการ
          </motion.h2>

          {/* Search form inside banner */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative z-10 w-full"
          >
            <div ref={searchContainerRef} className="relative flex items-center">
              <Search className="absolute left-4 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="ระบุเลขที่ใบอนุญาต หรือชื่อสถานประกอบการ"
                value={searchQuery}
                onFocus={() => setIsFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsFocused(true);
                }}
                className="w-full pl-11 pr-24 py-3.5 rounded-2xl border-0 bg-white text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none shadow-md transition-all font-semibold"
              />
              
              {/* Reset/Clear button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-18 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* QR scanner / Search button toggle */}
              <div className="absolute right-2 flex items-center gap-1.5">
                <AnimatePresence mode="wait">
                  {!searchQuery.trim() ? (
                    <motion.button
                      key="qr-button"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsQrScannerOpen(true);
                      }}
                      className="text-[#145b57] hover:opacity-80 transition-opacity cursor-pointer p-1.5 flex items-center justify-center z-10"
                      aria-label="Scan QR Code"
                    >
                      <QrScannerIcon size={20} />
                    </motion.button>
                  ) : (
                    <motion.button
                      key="search-button"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      type="submit"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="h-9 px-3.5 bg-[#145b57] text-white rounded-xl flex items-center justify-center cursor-pointer shadow-sm hover:bg-[#0c403d] transition-colors"
                    >
                      <Search className="h-4 w-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Autocomplete suggestions dropdown popover */}
              <AnimatePresence>
                {isFocused && searchQuery.trim() !== "" && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-[0_12px_32px_rgba(0,0,0,0.08)] overflow-hidden z-30"
                  >
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        ผลการค้นหาแนะนำ
                      </p>
                    </div>

                    {autocompleteSuggestions.length > 0 ? (
                      <ul className="divide-y divide-slate-50">
                        {autocompleteSuggestions.map((item) => (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setIsFocused(false);
                                router.push(`/licenses/${item.id}`);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-slate-50/80 transition-colors flex items-start gap-3 cursor-pointer group"
                            >
                              <Building2 className="h-4 w-4 text-slate-400 mt-0.5 group-hover:text-[#145b57] transition-colors" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-800 truncate leading-snug">
                                  {highlightText(item.holderName, searchQuery)}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500 font-semibold">
                                  <span className="truncate">
                                    {highlightText(item.licenseName, searchQuery)}
                                  </span>
                                  <span className="h-1 w-1 bg-slate-300 rounded-full" />
                                  <span className="text-[#2d57bb] underline">
                                    {highlightText(item.licenseNumber, searchQuery)}
                                  </span>
                                </div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400 font-semibold">
                        ไม่พบข้อมูลแนะนำที่สอดคล้องกับคำค้นหา
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>
        </motion.div>

        {/* Search Results Display Area */}
        <div className="px-4 py-6">
          {!query ? (
            /* Prepare/Ready to search page state */
            <div className="flex flex-col items-center gap-3 p-6 text-center select-none bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] mt-4">
              <Image
                src={preparePageImage}
                alt="เตรียมค้นหาใบอนุญาต"
                width={120}
                height={120}
                className="mx-auto"
                priority
              />
              <p className="mt-4 text-[16px] font-bold text-slate-800">ค้นหาใบอนุญาตและร้านค้า</p>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                พิมพ์หมายเลขใบอนุญาต หรือชื่อผู้ประกอบการด้านบน <br />
                เพื่อตรวจสอบข้อมูลสถานะในระบบ
              </p>
            </div>
          ) : results.length > 0 ? (
            /* Active Results Populated List */
            <div className="space-y-4">
              <div className="px-1 flex items-center gap-1">
                <span className="text-xs text-slate-500 font-semibold">พบ</span>
                <span className="text-xs font-extrabold text-slate-900">
                  {results.length}
                </span>
                <span className="text-xs text-slate-500 font-semibold">รายการ</span>
              </div>

              <div className="space-y-4">
                {results.map((item) => (
                  <LicenseCertificateCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ) : (
            /* Search Not Found empty state */
            <div className="flex flex-col items-center gap-3 p-8 text-center select-none bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)] mt-4">
              <Image
                src={notFoundImage}
                alt="ไม่พบข้อมูลใบอนุญาต"
                width={120}
                height={120}
                className="mx-auto"
                priority
              />
              <p className="mt-4 text-[16px] font-bold text-slate-800">ไม่พบข้อมูลใบอนุญาต</p>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                ลองตรวจสอบตัวสะกด ชื่อร้านค้า หรือระบุเลขที่ <br />
                ใบอนุญาตใหม่อีกครั้งเพื่อค้นหา
              </p>
            </div>
          )}
        </div>
      </div>

      <QrScannerDialog
        open={isQrScannerOpen}
        onOpenChange={setIsQrScannerOpen}
        onScanMock={handleScanMock}
        id="license-search-page-qr-scanner"
      />
    </main>
  );
}
