"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { QrScannerIcon } from "@/components/icons/AppIcons";

interface HomeHeroSearchProps {
  onSearchSubmit: (q: string, licenseNumber: string) => void;
  onLicenseScanClick: () => void;
  initialQ?: string;
  initialLicenseNumber?: string;
}

export function HomeHeroSearch({
  onSearchSubmit,
  onLicenseScanClick,
  initialQ = "",
  initialLicenseNumber = "",
}: HomeHeroSearchProps) {
  const [businessName, setBusinessName] = useState(initialQ);
  const [licenseNumber, setLicenseNumber] = useState(initialLicenseNumber);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(businessName.trim(), licenseNumber.trim());
  };

  return (
    <div
      className="text-white pt-10 pb-16 px-6 shadow-[0_10px_30px_rgba(20,91,87,0.1)] relative"
      style={{
        background:
          "radial-gradient(660.85% 601.5% at 53.98% -46.94%, #004D34 0%, #D8F3E1 100%)",
      }}
    >
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-3xl font-semibold tracking-tight text-white leading-8">
          ตรวจสอบสถานะใบอนุญาต
        </h1>
        <p className="mt-2 text-xl sm:text-xl text-white leading-[35px]">
          ของสถานประกอบการได้ง่ายและรวดเร็ว
        </p>
      </div>

      {/* Search Card Container */}
      <div className="mx-auto w-full bg-white rounded-lg border border-slate-100 shadow-[0_15px_45px_rgba(0,0,0,0.1)] p-5 sm:p-6 text-slate-800">
        <form onSubmit={handleSearch} className="space-y-4">
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
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
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
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-0 bg-slate-100/90 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#145b57] h-[46px]"
            />
          </div>
        </form>

        {/* QR Scan Button */}
        <button
          type="button"
          onClick={onLicenseScanClick}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-[#145b57] bg-white text-[#145b57] hover:bg-emerald-50/30 text-xs font-bold transition-colors cursor-pointer h-[46px]"
        >
          <QrScannerIcon size={18} />
          <span>สแกน QR Code ใบอนุญาต</span>
        </button>
      </div>
    </div>
  );
}
