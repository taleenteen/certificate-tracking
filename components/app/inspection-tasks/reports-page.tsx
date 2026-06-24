"use client";

import { useMemo } from "react";
import { Download } from "lucide-react";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";

import { InspectionTaskCard } from "@/components/shared/inspection-task-card";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { BusinessCategory } from "@/components/app/businesses/business-filter-panel";

const REPORTS_PER_PAGE = 3;

export type ReportItem = {
  id: string;
  companyName: string;
  businessType: string;
  inspectionDateTime: string;
  location: string;
  inspectorName: string;
  category: BusinessCategory;
  region: string;
  detailsHref: string;
  exportHref?: string;
};

type ReportsPageViewProps = {
  reports: ReportItem[];
};

export function ReportsPageView({ reports }: ReportsPageViewProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const selectedCategories = parseCategories(searchParams.get("categories"));
  const selectedRegion = searchParams.get("region") ?? "";
  const currentPageParam = Number(searchParams.get("page") ?? "1");

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesQuery =
        !query ||
        [
          report.companyName,
          report.businessType,
          report.location,
          report.inspectorName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesCategories =
        selectedCategories.length === 0 ||
        selectedCategories.includes(report.category);

      const matchesRegion =
        !selectedRegion || report.region.includes(selectedRegion);

      return matchesQuery && matchesCategories && matchesRegion;
    });
  }, [query, reports, selectedCategories, selectedRegion]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReports.length / REPORTS_PER_PAGE),
  );
  const currentPage = Math.min(Math.max(1, currentPageParam), totalPages);
  const startIndex = (currentPage - 1) * REPORTS_PER_PAGE;
  const paginatedReports = filteredReports.slice(
    startIndex,
    startIndex + REPORTS_PER_PAGE,
  );

  return (
    <main className="min-h-[calc(100vh-57px)] bg-[#F9FAFB] px-4 py-4">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-start justify-between gap-4">
          <p className="pt-2.5 text-sm font-semibold text-slate-500">
            พบ {filteredReports.length} รายการ
          </p>

          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-2xl border-slate-200 bg-white px-4 text-sm font-medium text-[#114e4b] shadow-[0_8px_24px_rgba(15,23,42,0.06)] hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            ส่งออกข้อมูลทั้งหมด
          </Button>
        </div>

        {paginatedReports.length > 0 ? (
          <>
            <div className="space-y-4">
              {paginatedReports.map((report) => (
                <InspectionTaskCard
                  key={report.id}
                  companyName={report.companyName}
                  businessType={report.businessType}
                  inspectionDateTime={report.inspectionDateTime}
                  location={report.location}
                  inspectorName={report.inspectorName}
                  detailsHref={report.detailsHref}
                  className="rounded-2xl border-slate-200/90 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
                  secondaryAction={{
                    label: "ดูรายละเอียด",
                    href: report.detailsHref,
                    variant: "secondary",
                  }}
                  primaryAction={{
                    label: "ส่งออกข้อมูล",
                    href: report.exportHref,
                    onClick: () => console.log("export", report.id),
                    variant: "primary",
                  }}
                />
              ))}
            </div>

            <ReportsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              createPageHref={(page) => createPageHref(searchParams, page)}
            />
          </>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-[13px] text-slate-600 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            ลองปรับคำค้นหา หรือเงื่อนไขตัวกรองเพื่อดูข้อมูลเพิ่มเติม
          </div>
        )}
      </div>
    </main>
  );
}

function ReportsPagination({
  currentPage,
  totalPages,
  createPageHref,
}: {
  currentPage: number;
  totalPages: number;
  createPageHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <Pagination className="mt-6 justify-center text-sm">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={createPageHref(Math.max(1, currentPage - 1))}
            className={
              currentPage === 1 ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>

        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={createPageHref(page)}
              isActive={page === currentPage}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href={createPageHref(Math.min(totalPages, currentPage + 1))}
            className={
              currentPage === totalPages ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function createPageHref(searchParams: ReadonlyURLSearchParams, page: number) {
  const params = new URLSearchParams(searchParams.toString());

  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }

  const queryString = params.toString();

  return queryString ? `/reports?${queryString}` : "/reports";
}

function parseCategories(value: string | null): BusinessCategory[] {
  if (!value) return [];

  return value
    .split(",")
    .filter((category): category is BusinessCategory =>
      ["hotel", "hospital", "factory", "education"].includes(category),
    );
}
