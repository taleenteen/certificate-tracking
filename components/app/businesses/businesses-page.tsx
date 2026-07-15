"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import holderPin from "@/assets/businesses/holding.png";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { InspectionTaskCard } from "@/components/shared/inspection-task-card";
import { useBusinesses } from "@/hooks/useBusinesses";
import { MOCK_BUSINESSES } from "@/constants/mock-businesses";

type BusinessLicenseSummary = {
  licenseType: {
    code: string;
    nameTh: string;
  };
};

// Helper to determine category from licenses list
const getCategoryFromLicenses = (licenses: BusinessLicenseSummary[]) => {
  for (const lic of licenses) {
    const code = lic.licenseType.code.toLowerCase();
    const name = lic.licenseType.nameTh.toLowerCase();
    if (name.includes("โรงแรม") || code.includes("hotel")) return "hotel";
    if (
      name.includes("โรงพยาบาล") ||
      name.includes("แพทย์") ||
      name.includes("รักษาพยาบาล") ||
      code.includes("hospital") ||
      code.includes("medical")
    )
      return "hospital";
    if (
      name.includes("โรงงาน") ||
      name.includes("การผลิต") ||
      code.includes("factory") ||
      code.includes("diw") ||
      code.includes("ร.ง.")
    )
      return "factory";
    if (
      name.includes("โรงเรียน") ||
      name.includes("สถานศึกษา") ||
      name.includes("ศึกษา") ||
      code.includes("school") ||
      code.includes("education") ||
      code.includes("university")
    )
      return "education";
  }
  return "";
};

export function BusinessesPageView() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  const categoriesParam = searchParams.get("categories") ?? "";
  const regionFilter = searchParams.get("region") ?? "";

  const categoriesList = useMemo(() => {
    return categoriesParam.split(",").filter(Boolean);
  }, [categoriesParam]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 400);
    return () => window.clearTimeout(timer);
  }, [query]);

  // Hook enabled when search query OR filters are active
  const hasFilters = categoriesList.length > 0 || !!regionFilter;
  const { data, isLoading } = useBusinesses(debouncedQuery, hasFilters);
  const results = data?.data ?? [];
  const isDebouncing = Boolean(query) && query !== debouncedQuery;

  // Filter businesses (combine real backend data with mock list for full category & province coverage)
  const filteredResults = useMemo(() => {
    // 1. Map backend data to unified schema
    const backendItems = results.map((item) => ({
      id: item.id,
      nameTh: item.nameTh,
      address: item.address,
      province: item.province,
      category: getCategoryFromLicenses(item.licenses),
      businessType: item.licenses[0]?.licenseType.nameTh ?? "-",
      licenseCount: item.licenses.length,
      latitude: item.latitude,
      longitude: item.longitude,
    }));

    // 2. Map static mock list to unified schema
    const mockItems = MOCK_BUSINESSES.map((item) => ({
      id: item.id,
      nameTh: item.nameTh,
      address: item.address,
      province: item.province,
      category: item.category,
      businessType: item.businessType,
      licenseCount: 1,
      latitude: item.latitude,
      longitude: item.longitude,
    }));

    // 3. Combine and de-duplicate by ID (in case backend already returned some mock IDs)
    const combined = [...backendItems, ...mockItems];
    const unique = combined.filter(
      (item, idx, self) => self.findIndex((t) => t.id === item.id) === idx,
    );

    // 4. Apply filters
    return unique.filter((item) => {
      // A. Category Filter
      if (categoriesList.length > 0) {
        if (!item.category || !categoriesList.includes(item.category)) {
          return false;
        }
      }

      // B. Region/Province Filter
      if (regionFilter) {
        if (item.province !== regionFilter) {
          return false;
        }
      }

      // C. Search query filter (ignore if query is "ตัวอย่าง" to act as general list)
      if (debouncedQuery && debouncedQuery !== "ตัวอย่าง") {
        const qLower = debouncedQuery.toLowerCase();
        const matchesName = item.nameTh.toLowerCase().includes(qLower);
        const matchesAddress = item.address.toLowerCase().includes(qLower);
        if (!matchesName && !matchesAddress) return false;
      }

      return true;
    });
  }, [results, categoriesList, regionFilter, debouncedQuery]);

  // Show placeholder page only if no search term and no filters are selected
  if (!query && categoriesList.length === 0 && !regionFilter) {
    return (
      <main className="flex min-h-[calc(100vh-57px)] justify-center bg-[#F9FAFB] px-4 lg:items-center">
        <div className="flex max-w-sm flex-col items-center gap-3 p-6 text-center">
          <Image src={holderPin} alt="Holder Pin" className="mx-auto mt-4" />
          <p className="mt-6 text-xl text-black/80">ค้นหาสถานประกอบการ</p>
          <p className="text-sm text-black/60">
            พิมพ์ชื่อสถานประกอบการ หรือใช้ตัวกรองเพื่อค้นหา
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-57px)] bg-[#F9FAFB] px-4 py-4 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-md space-y-3 lg:max-w-none">
        <div className="px-1 space-x-1">
          <span className="text-sm text-slate-500">พบ</span>
          <span className="text-sm font-semibold text-slate-900">
            {isLoading || isDebouncing ? "..." : filteredResults.length}
          </span>
          <span className="text-sm text-slate-500">รายการ</span>
        </div>

        {isLoading || isDebouncing ? (
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card
              key={`loading-${index}`}
              className="rounded-3xl border-0 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
            >
              <CardContent className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-28" />
              </CardContent>
            </Card>
          ))}
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-sm">ไม่พบสถานประกอบการที่ค้นหา</p>
          </div>
        ) : (
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 xl:grid-cols-3">
          {filteredResults.map((item) => (
            <InspectionTaskCard
              key={item.id}
              companyName={item.nameTh}
              businessType={item.businessType}
              certificateNumber={item.licenseCount}
              detailsHref={`/businesses/${item.id}?from=search`}
              onSubmitClick={() => {}}
              secondaryAction={{
                label: "นำทาง",
                href:
                  item.latitude && item.longitude
                    ? `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`
                    : "/e-map",
                variant: "secondary",
              }}
              primaryAction={{
                label: "ดูสถานประกอบการ",
                href: `/businesses/${item.id}?from=search`,
                variant: "primary",
              }}
            />
          ))}
          </div>
        )}
      </div>
    </main>
  );
}
