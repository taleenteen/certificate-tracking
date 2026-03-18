"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import notFoundImage from "@/assets/search/not-found.png";
import preparePageImage from "@/assets/search/prepare-page.png";
import type { LicenseCardItem } from "@/components/back-office/license-certificate-card";
import { LicenseCertificateCard } from "@/components/back-office/license-certificate-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type LicenseSearchPageViewProps = {
  items: LicenseCardItem[];
};

export function LicenseSearchPageView({
  items,
}: LicenseSearchPageViewProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const [settledQuery, setSettledQuery] = useState(query);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSettledQuery(query);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [query]);

  const isLoading = Boolean(query) && query !== settledQuery;

  const results = useMemo(() => {
    if (!query) return [];

    const lowerQuery = query.toLowerCase();

    return items.filter((item) =>
      [item.holderName, item.licenseName, item.licenseNumber]
        .join(" ")
        .toLowerCase()
        .includes(lowerQuery),
    );
  }, [items, query]);

  if (!query) {
    return (
      <main className="flex min-h-[calc(100vh-57px)] justify-center bg-[#F9FAFB] px-4">
        <div className="flex max-w-sm flex-col items-center gap-3 p-6 text-center">
          <Image
            src={preparePageImage}
            alt="เตรียมค้นหาใบอนุญาต"
            className="mx-auto mt-4"
          />
          <p className="mt-6 text-xl text-black/80">ค้นหาใบอนุญาต</p>
          <p className="text-sm text-black/60">
            พิมพ์เลขใบอนุญาต หรือชื่อผู้ถือใบอนุญาตเพื่อค้นหา
          </p>
        </div>
      </main>
    );
  }

  if (!isLoading && results.length === 0) {
    return (
      <main className="flex min-h-[calc(100vh-57px)] justify-center bg-[#F9FAFB] px-4">
        <div className="flex max-w-sm flex-col items-center gap-3 p-6 text-center">
          <Image
            src={notFoundImage}
            alt="ไม่พบข้อมูลใบอนุญาต"
            className="mx-auto mt-4"
          />
          <p className="mt-6 text-xl text-black/80">ไม่พบข้อมูลใบอนุญาต</p>
          <p className="text-sm text-black/60">
            ลองค้นหาด้วยเลขใบอนุญาต หรือข้อมูลอื่นอีกครั้ง
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-57px)] bg-[#F9FAFB] px-4 py-4">
      <div className="mx-auto max-w-md space-y-3">
        <div className="px-1 space-x-1">
          <span className="text-sm text-slate-500">พบ</span>
          <span className="text-sm font-semibold text-slate-900">
            {results.length}
          </span>
          <span className="text-sm text-slate-500">รายการ</span>
        </div>

        {isLoading
          ? Array.from({ length: 1 }).map((_, index) => (
              <Card
                key={`loading-${index}`}
                className="rounded-3xl border-0 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
              >
                <CardContent className="space-y-4 p-4">
                  <div className="grid grid-cols-[118px_1fr] gap-3">
                    <Skeleton className="h-[170px] rounded-2xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-px w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-4/5" />
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full rounded-xl" />
                </CardContent>
              </Card>
            ))
          : results.map((item) => (
              <LicenseCertificateCard key={item.id} item={item} />
            ))}
      </div>
    </main>
  );
}
