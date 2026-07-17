"use client";

import { useCallback, useEffect, useState } from "react";
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
import { openExternalQrUrl } from "@/lib/external-qr-url";
import { useNativeQrScanner } from "@/hooks/useNativeQrScanner";
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
  const [expandedBusinesses, setExpandedBusinesses] = useState<
    Record<string, boolean>
  >({});
  const canEnterLicenseNumber = searchQueryQ.trim().length > 0;

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

  const handleScan = useCallback((value: string) => {
    if (!openExternalQrUrl(value)) {
      toast.error("QR Code นี้ไม่มีลิงก์เว็บไซต์ที่เปิดได้");
    }
  }, []);
  const {
    isBrowserScannerOpen,
    setIsBrowserScannerOpen,
    startScanner,
  } = useNativeQrScanner(handleScan);

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
      <div className="mx-auto min-h-screen max-w-[430px] bg-[#f4f5f7] text-left shadow-sm lg:max-w-none">
        {/* Banner with 2-field search card design */}
        <div
          className="relative z-20 px-6 pb-16 pt-10 text-white shadow-[0_10px_30px_rgba(20,91,87,0.1)] lg:grid lg:grid-cols-[minmax(0,0.8fr)_minmax(420px,0.9fr)] lg:items-center lg:gap-10 lg:px-10 lg:py-12"
          style={{
            background:
              "radial-gradient(464.78% 477.35% at 53.98% -46.94%, #004D34 0%, #D8F3E1 100%)",
          }}
        >
          <div className="mb-6 text-center lg:mb-0 lg:text-left">
            <h1 className="text-2xl sm:text-2xl font-bold tracking-tight text-white leading-8">
              ค้นหาใบอนุญาตและสถานประกอบการ
            </h1>
          </div>

          {/* Search Card Container */}
          <div className="mx-auto w-full rounded-lg border border-slate-100 bg-white p-5 text-slate-800 shadow-[0_15px_45px_rgba(0,0,0,0.1)] sm:p-6 lg:max-w-xl">
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
                    className="absolute right-1.5 flex h-[36px] items-center gap-1 rounded-[9px] border-0 bg-[#145b57] px-3.5 text-[12px] font-bold text-white shadow-sm transition-colors hover:bg-[#0c403d]"
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
                  disabled={!canEnterLicenseNumber}
                  className="h-[46px] w-full rounded-lg border-0 bg-slate-100/90 px-4 py-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#145b57] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-70"
                />
              </div>
            </form>

            {/* QR Scan Button */}
            <button
              type="button"
              onClick={() => void startScanner()}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-[#145b57] bg-white text-[#145b57] hover:bg-emerald-50/30 text-xs font-bold transition-colors cursor-pointer h-[46px]"
            >
              <QrScannerIcon size={18} />
              <span>สแกน QR Code ใบอนุญาต</span>
            </button>
          </div>
        </div>

        {/* Search Results Display Area */}
        <div className="px-4 py-6 lg:px-10 lg:py-10">
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

              <div className="space-y-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-5 lg:space-y-0 xl:grid-cols-3">
                {items.map((business) => (
                  <div
                    key={business.id}
                    className="space-y-4 rounded-3xl border border-slate-100/60 bg-white p-5 text-left shadow-[0_10px_30px_rgba(0,0,0,0.02)] lg:flex lg:min-h-[236px] lg:flex-col lg:space-y-0"
                  >
                    <div className="space-y-1 lg:min-h-[78px]">
                      <h3 className="text-[15px] font-bold leading-snug text-slate-800 lg:min-h-[40px] lg:line-clamp-2">
                        {business.nameTh}
                      </h3>
                      {business.registrationId ? (
                        <p className="text-[12px] font-semibold text-slate-500 lg:line-clamp-1">
                          เลขนิติบุคคล : {business.registrationId}
                        </p>
                      ) : (
                        <p className="text-[12px] font-semibold text-slate-500 lg:line-clamp-1">
                          จังหวัด: {business.province}
                        </p>
                      )}
                      {business.businessType && (
                        <p className="text-[12px] font-semibold text-slate-500 lg:line-clamp-1">
                          ประเภทธุรกิจ : {business.businessType}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 lg:mt-auto lg:pt-4">
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
                            <div className="space-y-4 xl:grid xl:grid-cols-2 xl:gap-4 xl:space-y-0">
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
        open={isBrowserScannerOpen}
        onOpenChange={setIsBrowserScannerOpen}
        onScanMock={handleScan}
        id="license-search-page-qr-scanner"
      />
    </main>
  );
}
