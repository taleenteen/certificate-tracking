"use client";

import type { StatusBadgeStatus } from "@/components/shared/StatusBadge";
import { SectionCard } from "@/components/shared/SectionCard";
import { NavigationFooter } from "@/components/shared/NavigationFooter";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ClipboardCheck, Map, Navigation } from "lucide-react";
import { useIsStaff } from "@/hooks/useIsStaff";
import heroRightImage from "@/assets/hero/hero-right.png";
import {
  MdOutlineDescription,
  MdOutlineEmail,
  MdOutlineHomeWork,
  MdOutlinePerson,
  MdOutlinePhone,
} from "react-icons/md";
import { AppBreadcrumb } from "@/components/shared/app-breadcrumb";
import {
  LicenseCertificateCard,
  type LicenseCardItem,
} from "@/components/app/licenses/license-certificate-card";

export type BusinessDocument = {
  id: string;
  title: string;
  licenseNumber: string;
  status: StatusBadgeStatus;
  issuedAt: string;
  expiresAt: string;
};

export type BusinessDetailData = {
  companyName: string;
  businessName: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phoneNumber: string;
  email: string;
  documents: BusinessDocument[];
};

type BusinessesPageDetailViewProps = {
  data: BusinessDetailData;
};

export function BusinessesPageDetailView({
  data,
}: BusinessesPageDetailViewProps) {
  const searchParams = useSearchParams();
  const params = useParams();
  const businessId = params.businessId as string;
  const isStaff = useIsStaff();

  const fromParam = searchParams.get("from");
  const fromContext = getSourceContext(fromParam);
  const directionsUrl =
    data.latitude !== null && data.longitude !== null
      ? `https://www.google.com/maps/dir/?api=1&destination=${data.latitude},${data.longitude}`
      : null;
  const mapHref = businessId ? `/e-map?selected=${businessId}` : "/e-map";

  return (
    <>
      <main className="min-h-[calc(100vh-57px)] bg-[#F9FAFB] px-6 py-6 text-left">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Breadcrumb matching mockup layout */}
          <AppBreadcrumb
            items={[
              { label: "หน้าแรก", href: "/home" },
              { label: fromContext.label, href: fromContext.href },
              { label: data.businessName },
            ]}
            variant="dark"
          />

          {/* Officer Inspection Banner */}
          {isStaff && businessId && (
            <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-[#17524e] to-[#256e69] p-5 text-white flex items-center justify-between shadow-[0_10px_25px_rgba(20,91,87,0.12)] gap-4 select-none">
              {/* Left illustration */}
              <div className="flex items-center gap-3">
                <div className="relative w-[75px] h-[75px] shrink-0">
                  <Image
                    src={heroRightImage}
                    alt="Officer illustration"
                    fill
                    className="object-contain object-bottom scale-[1.3] origin-bottom -translate-y-1"
                    priority
                  />
                </div>
                <div className="hidden sm:block">
                  <p className="text-[15px] font-bold text-white leading-tight">
                    เจ้าหน้าที่ตรวจสอบ
                  </p>
                  <p className="text-xs text-teal-100 mt-1">
                    สามารถบันทึกรายงานผลการตรวจหน้างานแบบรวมกลุ่มได้ทันที
                  </p>
                </div>
              </div>

              {/* Right inspection button */}
              <Link
                href={`/businesses/${businessId}/inspect`}
                className="flex items-center gap-2 px-4 py-3 bg-[#0d423e] hover:bg-[#082e2c] border border-[#1a5550] rounded-xl text-[13px] font-bold text-white transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] shrink-0 cursor-pointer"
              >
                <ClipboardCheck className="h-4.5 w-4.5 text-white" />
                <span>บันทึกผลการตรวจสอบ</span>
              </Link>
            </div>
          )}

          {/* Centered Page Title */}
          <h2 className="text-[20px] font-bold text-slate-800 text-center tracking-wide my-4">
            {data.businessName}
          </h2>

          <SectionCard
            icon={<MdOutlineHomeWork className="h-5 w-5 text-slate-700" />}
            title="ข้อมูลสถานประกอบการ"
          >
            <p className="text-sm text-gray-600">
              ชื่อสถานประกอบการ
              <br />
              <span className="text-base text-slate-800 font-bold">
                {data.businessName}
              </span>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              ที่ตั้ง
              <br />
              <span className="text-base text-slate-800 font-semibold">
                {data.address}
              </span>
            </p>
          </SectionCard>

          <SectionCard
            icon={<MdOutlineDescription className="h-5 w-5 text-slate-700" />}
            title="ข้อมูลใบอนุญาต"
          >
            <div className="flex justify-between px-1 text-[13px] font-semibold text-slate-500 mb-2">
              <p>ใบอนุญาตสาธารณะ ทั้งหมด</p>
              <p>{data.documents.length} รายการ</p>
            </div>
            <div className="space-y-5">
              {data.documents.map((document) => {
                const cardItem: LicenseCardItem = {
                  id: document.id,
                  holderName: data.businessName,
                  licenseName: document.title,
                  licenseNumber: document.licenseNumber,
                  status: document.status,
                  issuedAt: document.issuedAt,
                  expiresAt: document.expiresAt,
                  detailsHref: `/licenses/${document.id}?from=${fromContext.key}`,
                };
                return (
                  <LicenseCertificateCard
                    key={document.id}
                    item={cardItem}
                  />
                );
              })}
            </div>
          </SectionCard>

          <SectionCard
            icon={<MdOutlinePerson className="h-5 w-5 text-slate-700" />}
            title="ข้อมูลเจ้าของกิจการ"
          >
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 font-medium">เบอร์โทรศัพท์</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <MdOutlinePhone className="h-4 w-4 text-slate-700" />
                  <span className="text-base text-slate-800 font-semibold">
                    {data.phoneNumber}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-medium">อีเมล</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <MdOutlineEmail className="h-4 w-4 text-slate-700" />
                  <span className="text-base text-slate-800 font-semibold">
                    {data.email}
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </main>
      <footer>
        <NavigationFooter
          actions={[
            {
              label: "นำทาง",
              onClick: () => {
                if (directionsUrl) {
                  window.open(directionsUrl, "_blank", "noopener,noreferrer");
                }
              },
              icon: <Navigation className="h-5 w-5" />,
              variant: "secondary",
            },
            {
              label: "ดูแผนที่",
              href: mapHref,
              icon: <Map className="h-5 w-5" />,
              variant: "primary",
            },
          ]}
        />
      </footer>
    </>
  );
}

function getSourceContext(source: string | null) {
  if (source === "search") {
    return { key: "search", label: "ค้นหาใบอนุญาต...", href: "/license-search" };
  }
  if (source === "e-map") {
    return { key: "e-map", label: "e-map", href: "/e-map" };
  }
  return { key: "my-licenses", label: "ใบอนุญาตของฉัน", href: "/licenses" };
}
