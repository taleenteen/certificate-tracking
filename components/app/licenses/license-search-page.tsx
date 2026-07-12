"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import notFoundImage from "@/assets/search/not-found.png";
import preparePageImage from "@/assets/search/prepare-page.png";
import { LicenseCertificateCard } from "@/components/app/licenses/license-certificate-card";
import { QrScannerDialog } from "@/components/app-shell/qr-scanner-dialog";
import { QrScannerIcon } from "@/components/icons/AppIcons";
import { http } from "@/lib/http";
import type { GroupedBusinessItem } from "@/app/(app)/license-search/page";

type LicenseSearchPageViewProps = {
  items: GroupedBusinessItem[];
};

export function LicenseSearchPageView({ items }: LicenseSearchPageViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryQ = searchParams.get("q")?.trim() ?? "";
  const queryNumber = searchParams.get("licenseNumber")?.trim() ?? "";

  const [searchQueryQ, setSearchQueryQ] = useState(queryQ);
  const [searchQueryNumber, setSearchQueryNumber] = useState(queryNumber);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [expandedBusinesses, setExpandedBusinesses] = useState<
    Record<string, boolean>
  >({});

  const toggleBusiness = (businessId: string) => {
    setExpandedBusinesses((prev) => ({
      ...prev,
      [businessId]: !prev[businessId],
    }));
  };

  // Sync state if URL query changes externally
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchQueryQ(queryQ);
    setSearchQueryNumber(queryNumber);
  }, [queryQ, queryNumber]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams(
      searchQueryQ.trim() || null,
      searchQueryNumber.trim() || null,
    );
  };

  const extractIdFromScannedValue = (scannedText: string): string => {
    try {
      if (
        scannedText.startsWith("http://") ||
        scannedText.startsWith("https://")
      ) {
        const url = new URL(scannedText);
        const parts = url.pathname.split("/").filter(Boolean);
        const idx = parts.findIndex(
          (p) => p === "my-licenses" || p === "licenses",
        );
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
      router.push(`/licenses/${cleanValue}?hideVerify=true&from=search`);
    } catch {
      if (items.length > 0) {
        const fallbackId = items[0].id;
        toast.info("ไม่พบรหัสใบอนุญาตนี้ในระบบ จึงแสดงใบอนุญาตตัวอย่างแทน");
        router.push(`/licenses/${fallbackId}?hideVerify=true&from=search`);
      } else {
        toast.error("ไม่พบใบอนุญาตนี้ และไม่มีข้อมูลตัวอย่างในระบบ");
      }
    }
  };

  const updateUrlParams = (q: string | null, licenseNo: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("_rsc");
    if (q) params.set("q", q);
    else params.delete("q");

    if (licenseNo) params.set("licenseNumber", licenseNo);
    else params.delete("licenseNumber");

    const nextUrl = params.toString()
      ? `/license-search?${params.toString()}`
      : `/license-search`;
    router.replace(nextUrl, { scroll: false });
  };

  const hasSearched = !!(queryQ || queryNumber);

  return (
    <main className="min-h-screen bg-[#f4f5f7] pb-12 text-slate-900">
      <div className="mx-auto max-w-[430px] bg-[#f4f5f7] min-h-screen text-left shadow-sm">
        {/* Banner with 2-field search card design */}
        <div
          className="text-white pt-10 pb-16 px-6 shadow-[0_10px_30px_rgba(20,91,87,0.1)] relative z-20"
          style={{
            background:
              "radial-gradient(660.85% 601.5% at 53.98% -46.94%, #004D34 0%, #D8F3E1 100%)",
          }}
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-2xl font-bold tracking-tight text-white leading-8">
              ค้นหาใบอนุญาตและสถานประกอบการ
            </h1>
          </div>

          {/* Search Card Container */}
          <div className="mx-auto w-full bg-white rounded-lg border border-slate-100 shadow-[0_15px_45px_rgba(0,0,0,0.1)] p-5 sm:p-6 text-slate-800">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              {/* Name Search Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="business-name-input"
                  className="block text-[12px] font-bold text-slate-500 text-left"
                >
                  ค้นหาใบอนุญาตของสถานประกอบการ
                </label>
                <div className="relative flex items-center">
                  <input
                    id="business-name-input"
                    type="text"
                    placeholder="เช่น สถานประกอบการตัวอย่าง"
                    value={searchQueryQ}
                    onChange={(e) => setSearchQueryQ(e.target.value)}
                    className="w-full pl-4 pr-24 py-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#145b57] focus:border-[#145b57] h-[46px]"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 h-[36px] px-3.5 bg-[#145b57] hover:bg-[#0c403d] text-white text-[12px] font-bold rounded-[9px] flex items-center gap-1 cursor-pointer transition-colors shadow-sm border-0"
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span>ค้นหา</span>
                  </button>
                </div>
              </div>

              {/* License Number Search Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="license-number-input"
                  className="block text-[12px] font-bold text-slate-500 text-left"
                >
                  เลขที่ใบอนุญาตของสถานประกอบการ
                </label>
                <input
                  id="license-number-input"
                  type="text"
                  placeholder="เช่น RNG4-00001"
                  value={searchQueryNumber}
                  onChange={(e) => setSearchQueryNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-0 bg-slate-100/90 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#145b57] h-[46px]"
                />
              </div>
            </form>

            {/* QR Scan Button */}
            <button
              type="button"
              onClick={() => setIsQrScannerOpen(true)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-[#145b57] bg-white text-[#145b57] hover:bg-emerald-50/30 text-xs font-bold transition-colors cursor-pointer h-[46px]"
            >
              <QrScannerIcon size={18} />
              <span>สแกน QR Code ใบอนุญาต</span>
            </button>
          </div>
        </div>

        {/* Search Results Display Area */}
        <div className="px-4 py-6">
          {!hasSearched ? (
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
              <p className="mt-4 text-[16px] font-bold text-slate-800">
                ค้นหาใบอนุญาตและร้านค้า
              </p>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                ลองพิมพ์ เช่น{" "}
                <span className="text-slate-600">สถานประกอบการตัวอย่าง</span>
                <br />
                หรือเลขใบอนุญาต เช่น{" "}
                <span className="text-slate-600">RNG4-00001</span>
              </p>
            </div>
          ) : items.length > 0 ? (
            /* Active Results Populated List */
            <div className="space-y-4">
              <div className="px-1 flex items-center gap-1">
                <span className="text-xs text-slate-500 font-semibold">พบ</span>
                <span className="text-xs font-extrabold text-slate-900">
                  {items.length}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  รายการ
                </span>
              </div>

              <div className="space-y-4">
                {items.map((business) => (
                  <div
                    key={business.id}
                    className="bg-white border border-slate-100/60 rounded-3xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.02)] space-y-4 text-left"
                  >
                    <div className="space-y-1">
                      <h3 className="text-[15px] font-bold text-slate-800 leading-snug">
                        {business.nameTh}
                      </h3>
                      {business.registrationId ? (
                        <p className="text-[12px] font-semibold text-slate-500">
                          เลขนิติบุคคล : {business.registrationId}
                        </p>
                      ) : (
                        <p className="text-[12px] font-semibold text-slate-500">
                          จังหวัด: {business.province}
                        </p>
                      )}
                      {business.businessType && (
                        <p className="text-[12px] font-semibold text-slate-500">
                          ประเภทธุรกิจ : {business.businessType}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Link
                        href={`/businesses/${business.id}?from=search`}
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
                          <div className="space-y-4 pt-4 border-t border-slate-100 mt-3">
                            <h4 className="text-[13px] font-bold text-[#145b57]">
                              ใบอนุญาต ({business.licenseCount})
                            </h4>
                            <div className="space-y-4">
                              {business.licenses.length > 0 ? (
                                business.licenses.map((lib) => {
                                  const cardItem = {
                                    id: lib.id,
                                    holderName: business.nameTh,
                                    licenseName: lib.licenseType.nameTh,
                                    licenseNumber: lib.licenseNumber,
                                    status: lib.status,
                                    issuedAt: lib.issuedAt,
                                    expiresAt: lib.expiresAt || "ไม่มีวันหมดอายุ",
                                    previewUrl: lib.previewUrl,
                                    detailsHref: `/licenses/${lib.id}?from=search`,
                                  };
                                  return (
                                    <LicenseCertificateCard
                                      key={lib.id}
                                      item={cardItem}
                                    />
                                  );
                                })
                              ) : (
                                <div className="p-3 text-center text-xs text-slate-400 font-semibold bg-slate-50 rounded-xl border border-slate-100">
                                  ไม่มีข้อมูลใบอนุญาตภายใต้สถานประกอบการนี้
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
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
              <p className="mt-4 text-[16px] font-bold text-slate-800">
                ไม่พบข้อมูลใบอนุญาต
              </p>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                ลองคำค้นที่สั้นกว่า เช่น{" "}
                <span className="text-slate-600">สถานประกอบการตัวอย่าง</span>
                <br />
                หรือ <span className="text-slate-600">RNG4</span> /{" "}
                <span className="text-slate-600">ตัวอย่าง</span>
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
