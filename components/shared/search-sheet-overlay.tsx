"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Search, X, ArrowLeft, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

import { useLicenses, type LicenseResponse } from "@/hooks/useLicenses";
import { QrScannerDialog } from "@/components/app-shell/qr-scanner-dialog";
import { QrScannerIcon } from "@/components/icons/AppIcons";
import { http } from "@/lib/http";

interface SearchSheetOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text: string, search: string) {
  if (!search.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${escapeRegExp(search)})`, "gi");
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <strong key={i} className="font-extrabold text-slate-900 bg-teal-50 px-0.5 rounded">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

export function SearchSheetOverlay({
  isOpen,
  onClose,
  initialQuery = "",
}: SearchSheetOverlayProps) {
  const router = useRouter();
  const { data: licenses = [] } = useLicenses();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state and autofocus input on open
  useEffect(() => {
    if (isOpen) {
      setSearchQuery(initialQuery);
      // Small timeout to allow slide-up animation to complete before keyboard autofocus pops up
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onClose();
      router.push(`/license-search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  // Filter autocomplete list based on Master licenses query
  const autocompleteSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerQuery = searchQuery.toLowerCase().trim();
    return licenses
      .filter((lib: LicenseResponse) =>
        [lib.business.nameTh, lib.licenseType.nameTh, lib.licenseNumber]
          .join(" ")
          .toLowerCase()
          .includes(lowerQuery)
      )
      .slice(0, 5);
  }, [licenses, searchQuery]);

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
      onClose();
      router.push(`/licenses/${cleanValue}?hideVerify=true`);
    } catch {
      if (licenses.length > 0) {
        const fallbackId = licenses[0].id;
        toast.info("ไม่พบรหัสใบอนุญาตนี้ในระบบ จึงแสดงใบอนุญาตตัวอย่างแทน");
        onClose();
        router.push(`/licenses/${fallbackId}?hideVerify=true`);
      } else {
        toast.error("ไม่พบใบอนุญาตนี้ และไม่มีข้อมูลตัวอย่างในระบบ");
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: "100vh" }}
            animate={{ y: 0 }}
            exit={{ y: "100vh" }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="fixed inset-0 bg-[#f4f5f7] z-50 overflow-y-auto px-4 pt-4 pb-12 flex justify-center text-left"
          >
            <div className="w-full max-w-[430px] bg-[#f4f5f7] min-h-screen">
              {/* Top Search Input Bar with Back Button */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-slate-200/60 shadow-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                  aria-label="Back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <form onSubmit={handleSearchSubmit} className="relative flex-1 flex items-center">
                  <Search className="absolute left-4 h-4.5 w-4.5 text-slate-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="ค้นหาเลขใบอนุญาต หรือชื่อร้านค้า..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-24 py-3 rounded-2xl border border-slate-200 bg-white text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#145b57] focus:border-[#145b57] shadow-sm font-semibold h-11"
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

                  {/* Scanner / Green Search submit toggle */}
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
                          className="text-[#145b57] hover:opacity-80 transition-opacity cursor-pointer p-1.5 flex items-center justify-center"
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
                          className="h-8 px-3 bg-[#145b57] text-white rounded-xl flex items-center justify-center cursor-pointer shadow-sm hover:bg-[#0c403d] transition-colors"
                        >
                          <Search className="h-3.5 w-3.5" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </form>
              </div>

              {/* Autocomplete Suggestions Container */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                <div className="p-3.5 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {searchQuery.trim() ? "ผลการค้นหาแนะนำ" : "ค้นหาใบอนุญาตของคุณ"}
                  </p>
                </div>

                {searchQuery.trim() ? (
                  autocompleteSuggestions.length > 0 ? (
                    <ul className="divide-y divide-slate-50">
                      {autocompleteSuggestions.map((item) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              router.push(`/licenses/${item.id}`);
                            }}
                            className="w-full text-left px-4 py-3.5 hover:bg-slate-50/80 transition-colors flex items-start gap-3 cursor-pointer group"
                          >
                            <Building2 className="h-4.5 w-4.5 text-slate-400 mt-0.5 group-hover:text-[#145b57] transition-colors" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-800 truncate leading-snug">
                                {highlightText(item.business.nameTh, searchQuery)}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500 font-semibold">
                                <span className="truncate">
                                  {highlightText(item.licenseType.nameTh, searchQuery)}
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
                    <div className="p-6 text-center text-xs text-slate-400 font-semibold leading-relaxed">
                      ไม่พบคำแนะนำที่สอดคล้องกับคำค้นหา
                    </div>
                  )
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 font-semibold leading-relaxed">
                    พิมพ์หมายเลขใบอนุญาต หรือชื่อผู้ประกอบการ <br />
                    ระบบจะแสดงผลการจับคู่ข้อมูลใบอนุญาตทันที
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <QrScannerDialog
        open={isQrScannerOpen}
        onOpenChange={setIsQrScannerOpen}
        onScanMock={handleScanMock}
        id="sheet-overlay-qr-scanner"
      />
    </>
  );
}
