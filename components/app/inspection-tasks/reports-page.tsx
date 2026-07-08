"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Search,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";

import { AppBreadcrumb } from "@/components/shared/app-breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { BusinessCategory } from "@/components/app/businesses/business-filter-panel";
import { cn } from "@/lib/utils";

dayjs.extend(buddhistEra);

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
  updatedAt: string; // ISO date string for grouping and filtering
  itemCount?: number;
};

type ReportsPageViewProps = {
  reports: ReportItem[];
};

export function ReportsPageView({ reports }: ReportsPageViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo = searchParams.get("dateTo") ?? "";

  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(dateFrom);
  const [endDate, setEndDate] = useState(dateTo);

  const updateUrlParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("_rsc");
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    updateUrlParams({ dateFrom: val || null });
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    updateUrlParams({ dateTo: val || null });
  };

  // Filter reports on client side
  const filteredReports = useMemo(() => {
    const activeQuery = searchQuery.trim().toLowerCase();
    return reports.filter((report) => {
      const matchesQuery =
        !activeQuery ||
        report.companyName.toLowerCase().includes(activeQuery) ||
        report.businessType.toLowerCase().includes(activeQuery) ||
        report.inspectorName.toLowerCase().includes(activeQuery);

      const taskDate = dayjs(report.updatedAt);
      const matchesDateFrom =
        !dateFrom ||
        taskDate.isAfter(dayjs(dateFrom).startOf("day")) ||
        taskDate.isSame(dayjs(dateFrom).startOf("day"), "day");

      const matchesDateTo =
        !dateTo ||
        taskDate.isBefore(dayjs(dateTo).endOf("day")) ||
        taskDate.isSame(dayjs(dateTo).endOf("day"), "day");

      return matchesQuery && matchesDateFrom && matchesDateTo;
    });
  }, [searchQuery, reports, dateFrom, dateTo]);

  // Group reports by date groups
  const groupedReports = useMemo(() => {
    const groups: Record<string, ReportItem[]> = {
      "วันนี้": [],
      "เมื่อวานนี้": [],
      "7 วันที่ผ่านมา": [],
      "ก่อนหน้านี้": [],
    };

    filteredReports.forEach((report) => {
      const date = dayjs(report.updatedAt);
      const today = dayjs();
      const yesterday = dayjs().subtract(1, "day");
      const sevenDaysAgo = dayjs().subtract(7, "day");

      if (date.isSame(today, "day")) {
        groups["วันนี้"].push(report);
      } else if (date.isSame(yesterday, "day")) {
        groups["เมื่อวานนี้"].push(report);
      } else if (date.isAfter(sevenDaysAgo.startOf("day"))) {
        groups["7 วันที่ผ่านมา"].push(report);
      } else {
        groups["ก่อนหน้านี้"].push(report);
      }
    });

    return Object.entries(groups).filter(([, items]) => items.length > 0);
  }, [filteredReports]);

  return (
    <main className="min-h-screen bg-[#F9FAFB] pb-24 text-left">
      <div className="mx-auto max-w-md px-4 py-4 space-y-4">
        {/* Breadcrumb matches mockup */}
        <AppBreadcrumb
          items={[
            { label: "หน้าแรก", href: "/home" },
            { label: "รายการตรวจสอบ" },
          ]}
          variant="dark"
        />

        {/* Page Title with Export All button aligned to right */}
        <div className="flex items-center justify-between my-4">
          <h2 className="text-[20px] font-bold text-slate-800 tracking-wide">
            รายการตรวจสอบ
          </h2>
          <Button
            type="button"
            className="h-10 rounded-xl bg-[#0c403d] hover:bg-[#082c2a] text-white text-xs font-bold px-4 flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(12,64,61,0.15)] cursor-pointer"
          >
            <span>ส่งออกทั้งหมด</span>
            <ChevronDown className="h-4 w-4 text-white" />
          </Button>
        </div>

        {/* Search Filters Card */}
        <Card className="rounded-[20px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
          <CardContent className="p-0 space-y-4">
            <h3 className="text-[13px] font-bold text-slate-800">
              ตัวกรองการค้นหา
            </h3>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="ค้นหาสถานประกอบการ"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2.5 h-11 w-full rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 placeholder-slate-400 focus-visible:ring-1 focus-visible:ring-[#145b57] focus-visible:border-[#145b57]"
              />
            </div>

            {/* Date Pickers Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500">
                  เริ่มวันที่
                </label>
                <ReportDatePicker
                  value={startDate}
                  onChange={handleStartDateChange}
                  placeholder="เลือกวันที่"
                />
              </div>

              {/* End Date */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500">
                  ถึงวันที่
                </label>
                <ReportDatePicker
                  value={endDate}
                  onChange={handleEndDateChange}
                  placeholder="เลือกวันที่"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grouped Reports List */}
        {groupedReports.length > 0 ? (
          <div className="space-y-6 pt-2">
            {groupedReports.map(([groupName, items]) => (
              <div key={groupName} className="space-y-3">
                {/* Group Heading */}
                <h4 className="text-[14px] font-bold text-slate-800 text-left">
                  {groupName}
                </h4>
                
                {/* Cards inside Group */}
                <div className="space-y-4">
                  {items.map((report) => (
                    <ReportTaskCard key={report.id} report={report} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="rounded-[20px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] text-center text-xs font-semibold text-slate-500">
            ไม่พบข้อมูลรายการตรวจสอบ หรือลองปรับแต่งตัวกรอง
          </Card>
        )}
      </div>
    </main>
  );
}

function ReportDatePicker({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const selectedDate = value ? dayjs(value) : null;
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    selectedDate?.isValid()
      ? selectedDate.startOf("month")
      : dayjs().startOf("month"),
  );

  const calendarDays = useMemo(() => {
    const start = visibleMonth.startOf("month").startOf("week");
    return Array.from({ length: 42 }, (_, index) => start.add(index, "day"));
  }, [visibleMonth]);

  const displayValue =
    selectedDate?.isValid() ? selectedDate.format("DD/MM/BBBB") : placeholder;

  const selectDate = (date: dayjs.Dayjs) => {
    onChange(date.format("YYYY-MM-DD"));
    setOpen(false);
  };

  const clearDate = () => {
    onChange("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-11 w-full justify-start rounded-xl border-slate-200 bg-white px-3.5 text-left text-xs font-semibold shadow-none hover:bg-slate-50",
            !selectedDate?.isValid() && "text-slate-400",
          )}
        >
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="min-w-0 truncate">{displayValue}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[292px] rounded-2xl border-slate-200 bg-white p-3 shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
      >
        <div className="mb-3 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-full text-slate-500 hover:bg-slate-100"
            onClick={() =>
              setVisibleMonth((month) => month.subtract(1, "month"))
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-[13px] font-bold text-slate-800">
            {visibleMonth.format("MMMM BBBB")}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-full text-slate-500 hover:bg-slate-100"
            onClick={() => setVisibleMonth((month) => month.add(1, "month"))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400">
          {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {calendarDays.map((date) => {
            const isSelected =
              selectedDate?.isValid() && date.isSame(selectedDate, "day");
            const isToday = date.isSame(dayjs(), "day");
            const isCurrentMonth = date.isSame(visibleMonth, "month");

            return (
              <button
                key={date.format("YYYY-MM-DD")}
                type="button"
                onClick={() => selectDate(date)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold transition-colors",
                  isCurrentMonth ? "text-slate-700" : "text-slate-300",
                  isToday && "ring-1 ring-[#145b57]",
                  isSelected
                    ? "bg-[#0c403d] text-white ring-0 hover:bg-[#082c2a]"
                    : "hover:bg-slate-100",
                )}
              >
                {date.date()}
              </button>
            );
          })}
        </div>

        {value ? (
          <Button
            type="button"
            variant="ghost"
            className="mt-3 h-9 w-full rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
            onClick={clearDate}
          >
            ล้างวันที่
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

function ReportTaskCard({ report }: { report: ReportItem }) {
  const router = useRouter();

  // Format date in Buddhist Era for visual output
  const formattedDate = useMemo(() => {
    return dayjs(report.updatedAt).format("DD/MM/BBBB");
  }, [report.updatedAt]);

  return (
    <Card className="rounded-[20px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
      <CardContent className="p-0 space-y-3">
        {/* Company Title */}
        <h3 className="text-[14px] font-bold text-slate-800 leading-snug text-left">
          {report.companyName}
        </h3>

        {/* Gray separator line */}
        <div className="border-b border-slate-100 w-full" />

        {/* Meta Info Row */}
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-[12px] font-semibold text-slate-500">
              {formattedDate}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-slate-400" />
            <span className="text-[12px] font-semibold text-slate-500">
              ใบอนุญาต {report.itemCount ?? 1} รายการ
            </span>
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            type="button"
            onClick={() => router.push(report.detailsHref)}
            className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center cursor-pointer"
          >
            ดูรายละเอียด
          </button>
          <button
            type="button"
            onClick={() => {
              if (report.exportHref) window.open(report.exportHref, "_blank", "noopener,noreferrer");
            }}
            className="w-full py-2.5 rounded-xl bg-[#0c403d] hover:bg-[#082c2a] text-white font-bold text-xs transition-colors flex items-center justify-center cursor-pointer"
          >
            ส่งออก
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
