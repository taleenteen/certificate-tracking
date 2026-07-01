"use client";

import { useRouter } from "next/navigation";
import { HomeHeroSearch } from "./home-hero-search";
import { HomeServiceList } from "./home-service-list";

type HomepageServiceProps = {
  role?: string;
  onLicenseScanClick: () => void;
  onOfficerScanClick: () => void;
  onComplaintsClick: () => void;
};

export function HomepageService({
  role,
  onLicenseScanClick,
  onOfficerScanClick,
  onComplaintsClick,
}: HomepageServiceProps) {
  const router = useRouter();

  const handleSearchSubmit = (q: string, licenseNumber: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (licenseNumber) params.set("licenseNumber", licenseNumber);
    router.push(`/license-search?${params.toString()}`);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-[430px] overflow-x-hidden bg-[#f4f5f7] text-left text-slate-900 md:max-w-none">
      {/* Top Hero Banner & Search Form */}
      <HomeHeroSearch
        onSearchSubmit={handleSearchSubmit}
        onLicenseScanClick={onLicenseScanClick}
      />

      {/* Services List shortcuts */}
      <HomeServiceList
        role={role}
        onOfficerScanClick={onOfficerScanClick}
        onComplaintsClick={onComplaintsClick}
      />
    </main>
  );
}
