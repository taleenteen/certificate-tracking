"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import holderPin from "@/assets/establishment/holding.png";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { InspectionTaskCard } from "@/components/shared/inspection-task-card";

const mockEstablishments = [
  {
    id: "1",
    companyName: "บริษัท เอส.เค.ดี จำกัด",
    businessType: "โรงงานผลิตอาหาร",
    certificateNumber: 19,
  },
  {
    id: "2",
    companyName: "บริษัท เอส.เค.ดี จำกัด",
    businessType: "โรงงานผลิตอาหาร",
    certificateNumber: 19,
  },
];

export function EstablishmentPageView() {
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
    return mockEstablishments;
  }, [query]);

  if (!query) {
    return (
      <main className="flex min-h-[calc(100vh-57px)] justify-center bg-[#F9FAFB] px-4">
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
    <main className="min-h-[calc(100vh-57px)] bg-[#F9FAFB] px-4 py-4">
      <div className="mx-auto max-w-md space-y-3">
        <div className="px-1 space-x-1">
          <span className="text-sm text-slate-500">พบ</span>
          <span className="text-sm font-semibold text-slate-900">
            {mockEstablishments.length}
          </span>
          <span className="text-sm text-slate-500">รายการ</span>

          {/* <p className="text-sm text-slate-500">ผลการค้นหา</p>
          <h1 className="text-xl font-semibold text-slate-900">“{query}”</h1> */}
        </div>

        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
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
            ))
          : results.map((item) => (
              <InspectionTaskCard
                key={item.id}
                companyName={item.companyName}
                businessType={item.businessType}
                certificateNumber={item.certificateNumber}
                detailsHref={`/establishment/${item.id}`}
                onSubmitClick={() => console.log("submit", item.id)}
                secondaryAction={{
                  label: "นำทาง",
                  href: "/map",
                  variant: "secondary",
                }}
                primaryAction={{
                  label: "ดูรายละเอียด",
                  href: "/establishment/1",
                  variant: "primary",
                }}
              />
            ))}
      </div>
    </main>
  );
}
