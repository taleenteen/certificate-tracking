"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import logo1111 from "@/assets/icon/1111-logo.svg";
import eMapIcon from "@/assets/hero/e-map-icon.svg";
import myLicenseIcon from "@/assets/hero/my-license-icon.svg";
import verifyOfficerIcon from "@/assets/hero/verify-officer-icon.svg";
import officerCardIcon from "@/assets/hero/officer-card-icon.svg";

interface HomeServiceListProps {
  role?: string;
  onOfficerScanClick: () => void;
  onComplaintsClick: () => void;
}

export function HomeServiceList({
  role,
  onOfficerScanClick,
  onComplaintsClick,
}: HomeServiceListProps) {
  const isOfficer = role === "officer";

  return (
    <section className="bg-[#f4f5f7] px-6 pb-12 pt-8 text-center lg:px-10 lg:py-10">
      <div className="mx-auto max-w-md lg:max-w-none">
        {/* ใบอนุญาตของฉัน (Citizen banner at the top) */}
        {!isOfficer && (
          <Link
            href="/licenses"
            style={{ background: "linear-gradient(180deg, #539375 -90.12%, #004224 123.26%)" }}
            className="mb-6 flex items-center justify-between rounded-2xl border border-[#004224]/10 p-5 text-left shadow-[0_8px_30px_rgba(20,91,87,0.08)] transition-all group cursor-pointer hover:opacity-95 lg:max-w-3xl"
          >
            <div className="flex items-center gap-4">
              <Image
                src={myLicenseIcon}
                alt="ใบอนุญาตของฉัน"
                width={56}
                height={56}
                className="shrink-0 object-contain"
              />
              <div>
                <h3 className="text-[17px] font-bold text-white leading-snug">
                  ใบอนุญาตของฉัน
                </h3>
                <p className="text-[12px] text-slate-100/90 font-medium mt-1">
                  ดูรายการใบอนุญาตที่เกี่ยวข้องกับคุณ
                </p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6 text-white group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>
        )}

        {/* Title with green underline indicator */}
        <div className="inline-block text-center mb-6">
          <h2 className="text-[20px] font-extrabold text-slate-900 tracking-tight">
            บริการของเรา
          </h2>
          <div className="w-10 h-1.5 bg-[#145b57] rounded-full mx-auto mt-1.5" />
        </div>

        {/* Services List stacked vertically */}
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          {isOfficer ? (
            <>
              {/* e-Map */}
              <Link
                href="/e-map"
                className="flex items-center justify-between p-4 bg-white border border-slate-100/60 rounded-lg shadow-[0_8px_30px_rgba(15,23,42,0.03)] hover:bg-slate-50 transition-colors group cursor-pointer text-left"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={eMapIcon}
                    alt="e-Map"
                    width={44}
                    height={44}
                    className="shrink-0 object-contain"
                  />
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-[#145b57] transition-colors leading-snug">
                      e-Map
                    </h3>
                    <p className="text-[12px] text-slate-500 font-semibold mt-0.5">
                      ค้นหาสถานประกอบการบนแผนที่
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* QR Code เพื่อยืนยันตัวตนเจ้าหน้าที่ */}
              <Link
                href="/officer-card"
                className="flex items-center justify-between p-4 bg-white border border-slate-100/60 rounded-lg shadow-[0_8px_30px_rgba(15,23,42,0.03)] hover:bg-slate-50 transition-colors group cursor-pointer text-left"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={officerCardIcon}
                    alt="QR Code เพื่อยืนยันตัวตนเจ้าหน้าที่"
                    width={44}
                    height={44}
                    className="shrink-0 object-contain"
                  />
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-[#145b57] transition-colors leading-snug">
                      QR Code เพื่อยืนยันตัวตนเจ้าหน้าที่
                    </h3>
                    <p className="text-[12px] text-slate-500 font-semibold mt-0.5">
                      ยืนยันตัวตนการเป็นเจ้าหน้าที่
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </>
          ) : (
            <>
              {/* e-Map */}
              <Link
                href="/e-map"
                className="flex items-center justify-between p-4 bg-white border border-slate-100/60 rounded-lg shadow-[0_8px_30px_rgba(15,23,42,0.03)] hover:bg-slate-50 transition-colors group cursor-pointer text-left"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={eMapIcon}
                    alt="e-Map"
                    width={44}
                    height={44}
                    className="shrink-0 object-contain"
                  />
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-[#145b57] transition-colors leading-snug">
                      e-Map
                    </h3>
                    <p className="text-[12px] text-slate-500 font-semibold mt-0.5">
                      ค้นหาสถานประกอบการบนแผนที่
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* ยืนยันตัวตนเจ้าหน้าที่ */}
              <button
                type="button"
                onClick={onOfficerScanClick}
                className="w-full flex items-center justify-between p-4 bg-white border border-slate-100/60 rounded-lg shadow-[0_8px_30px_rgba(15,23,42,0.03)] hover:bg-slate-50 transition-colors group cursor-pointer text-left border-0"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={verifyOfficerIcon}
                    alt="ยืนยันตัวตนเจ้าหน้าที่"
                    width={44}
                    height={44}
                    className="shrink-0 object-contain"
                  />
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-[#145b57] transition-colors leading-snug">
                      ยืนยันตัวตนเจ้าหน้าที่
                    </h3>
                    <p className="text-[12px] text-slate-500 font-semibold mt-0.5">
                      ยืนยันตัวตนเจ้าหน้าที่ด้วย QR Code
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* แจ้งร้องเรียน 1111 */}
              <a
                href="https://www.1111.go.th/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-4 bg-white border border-slate-100/60 rounded-lg shadow-[0_8px_30px_rgba(15,23,42,0.03)] hover:bg-slate-50 transition-colors group cursor-pointer text-left border-0"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={logo1111}
                    alt="1111 Logo"
                    width={44}
                    height={44}
                    className="shrink-0 object-contain"
                  />
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-[#145b57] transition-colors leading-snug">
                      แจ้งร้องเรียน 1111
                    </h3>
                    <p className="text-[12px] text-slate-500 font-semibold mt-0.5">
                      พบเห็นสิ่งผิดปกติหรือมีข้อร้องเรียน
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
