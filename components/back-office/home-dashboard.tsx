"use client";

import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ChartConfig } from "@/components/ui/chart";
import { Building2, Map, ScanSearch, Search } from "lucide-react";
import heroRightImage from "@/assets/hero/hero-right.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { AnimatedFolder } from "../shared/animated-folder";

const summaryStats = [
  { label: "ปกติ", value: 20, color: "bg-emerald-500" },
  { label: "ใกล้หมดอายุ", value: 12, color: "bg-amber-400" },
  { label: "หมดอายุ", value: 18, color: "bg-rose-400" },
  { label: "ถูกระงับ", value: 10, color: "bg-violet-500" },
];

const totalSummaryStats = summaryStats.reduce(
  (total, item) => total + item.value,
  0,
);

const issueBars = [
  { label: "เอกสารไม่ครบ", value: 74, color: "bg-[#6f7cf6]" },
  { label: "หมดอายุแล้ว", value: 58, color: "bg-[#5db4dd]" },
  { label: "สถานที่ไม่ตรง", value: 49, color: "bg-[#e56ed9]" },
  { label: "ป้ายไม่ถูกต้อง", value: 31, color: "bg-[#c96ef1]" },
  { label: "ไม่มีวันหมดอายุ", value: 20, color: "bg-[#e47b9b]" },
];

const inspectionTrendData = {
  day: [
    { label: "จ.", inspections: 8 },
    { label: "อ.", inspections: 12 },
    { label: "พ.", inspections: 10 },
    { label: "พฤ.", inspections: 14 },
    { label: "ศ.", inspections: 18 },
    { label: "ส.", inspections: 9 },
    { label: "อา.", inspections: 6 },
  ],
  month: [
    { label: "ม.ค.", inspections: 48 },
    { label: "ก.พ.", inspections: 31 },
    { label: "มี.ค.", inspections: 29 },
    { label: "เม.ย.", inspections: 41 },
    { label: "พ.ค.", inspections: 53 },
    { label: "มิ.ย.", inspections: 49 },
    { label: "ก.ค.", inspections: 36 },
    { label: "ส.ค.", inspections: 41 },
    { label: "ก.ย.", inspections: 34 },
    { label: "ต.ค.", inspections: 28 },
    { label: "พ.ย.", inspections: 22 },
    { label: "ธ.ค.", inspections: 39 },
  ],
  year: [
    { label: "2563", inspections: 220 },
    { label: "2564", inspections: 264 },
    { label: "2565", inspections: 318 },
    { label: "2566", inspections: 352 },
    { label: "2567", inspections: 401 },
  ],
} as const;

const trendRanges = [
  { value: "day", label: "วัน" },
  { value: "month", label: "เดือน" },
  { value: "year", label: "ปี" },
] as const;

const issueScaleTicks = [20, 40, 60, 80] as const;
const issueScalePositions = ["25%", "50%", "75%", "100%"] as const;

const inspectionTrendConfig = {
  inspections: {
    label: "การตรวจสอบ",
    color: "#145b57",
  },
} satisfies ChartConfig;

export function HomeDashboard() {
  const [selectedTrendRange, setSelectedTrendRange] =
    useState<(typeof trendRanges)[number]["value"]>("month");

  const activeInspectionTrendData = useMemo(
    () => [...inspectionTrendData[selectedTrendRange]],
    [selectedTrendRange],
  );

  const trendLabelPrefix = useMemo(() => {
    if (selectedTrendRange === "day") return "วัน";
    if (selectedTrendRange === "year") return "ปี";
    return "เดือน";
  }, [selectedTrendRange]);

  // const [testValue, setTestValue] = useState(0);

  return (
    <main className="mx-auto w-full max-w-[430px] overflow-x-hidden bg-[#f4f5f7] text-slate-900 md:max-w-none">
      <section className="bg-[#114e4b] px-4 pb-6 pt-5 text-white sm:px-6">
        {/* <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xl font-semibold leading-tight">
              ยินดีต้อนรับ, คุณสมชาย
            </p>
            <p className="mt-1 text-sm text-white/70">เจ้าหน้าที่</p>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <div className="rounded-full border border-white/15 bg-white/5 p-2">
              <Search className="h-4 w-4" />
            </div>
          </div>
        </div> */}

        <div className="space-y-3">
          <Link
            href="/license-search"
            className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-slate-700 shadow-sm"
          >
            <Search className="h-4 w-4 text-slate-400" />
            <span className="flex-1 text-sm text-slate-400">ค้นหาใบอนุญาต</span>
            <div className="rounded-full border border-[#1b6964]/20 p-1 text-[#1b6964]">
              <ScanSearch className="h-4 w-4" />
            </div>
          </Link>

          <div className="flex w-full h-[50px] items-stretch rounded-2xl bg-white p-1 shadow-sm">
            <QuickActionButton
              href="/e-map"
              icon={Map}
              label="แผนที่ (E-Map)"
            />

            {/* เส้นคั่นกลาง */}
            <div className="mx-1 my-auto h-full w-px shrink-0 bg-slate-100" />

            <QuickActionButton
              href="/establishment"
              icon={Building2}
              label="สถานประกอบการ"
            />
          </div>
        </div>

        <div className="mt-5 overflow-hidden">
          <div className="grid grid-cols-[1.4fr_1fr] items-center gap-2">
            <div>
              <p className="max-w-[180px] text-xl font-semibold leading-8">
                ตรวจสอบใบอนุญาต ได้อย่างมั่นใจ
              </p>
              <p className="mt-3 text-sm leading-5 text-white/75">
                ค้นหา และดูสถานะใบอนุญาตทุกฉบับ สถานประกอบการได้ง่ายและรวดเร็ว
              </p>
            </div>

            <div className="relative h-[168px] w-full">
              <Image
                src={heroRightImage}
                alt="ภาพประกอบการตรวจสอบใบอนุญาต"
                fill
                className="object-contain object-center"
                sizes="(min-width: 768px) 220px, 40vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-t-[28px] bg-[#f4f5f7] px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MiniTile
            title="ใบอนุญาตของฉัน"
            description="3 รายการ"
            href="/my-licenses"
            isActive
            currentState={3}
          />
          <MiniTile
            title="ใบอนุญาตหมดอายุ"
            description="2 รายการ"
            href="/expired-licenses"
            currentState={2}
          />
        </div>
        {/* <Button onClick={() => setTestValue(testValue + 1)}>click</Button> */}

        <div className="mt-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold leading-7 text-slate-950 sm:text-[28px] sm:leading-8 lg:text-[32px] lg:leading-9">
              ภาพรวมการตรวจสอบ
            </h2>
          </div>
          <Button
            asChild
            variant="link"
            className="h-auto p-0 text-sm font-medium text-[#145b57]"
          >
            <Link href="/reports">รายงานทั้งหมด</Link>
          </Button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr_0.9fr]">
          <Card className="min-w-0 rounded-[24px] border-0 py-0 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <CardContent className="space-y-5 p-4">
              <div>
                <h3 className="text-lg font-semibold text-[#145b57]">
                  สถานะใบอนุญาตที่ตรวจ
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  <span className="text-3xl font-semibold text-slate-900">
                    60
                  </span>{" "}
                  ใบอนุญาต
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {summaryStats.map((item) => (
                  <div
                    key={item.label}
                    className={`h-2 rounded-full ${item.color}`}
                    style={{
                      width: `${(item.value / totalSummaryStats) * 100}%`,
                      minWidth: "1.5rem",
                    }}
                    aria-label={`${item.label} ${item.value}`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2 text-sm">
                {summaryStats.map((item) => (
                  <div key={item.label} className="min-w-0 space-y-1">
                    <p className="text-base font-semibold text-slate-900 sm:text-lg">
                      {item.value}
                    </p>
                    <div className="flex items-start gap-1.5 text-slate-500">
                      <span
                        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.color}`}
                      />
                      <span className="text-[11px] leading-4 sm:text-xs">
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0 rounded-[24px] border-0 py-0 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <CardContent className="p-4">
              <div className="min-w-0 rounded-[20px] bg-[#fbfbfb] p-4">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex justify-between items-center">
                    <h4 className="font-semibold text-[#145b57]">
                      สถิติการตรวจสอบ
                    </h4>
                    <div className="flex rounded-md bg-slate-100 border border-slate-300 text-xs text-slate-500">
                      {trendRanges.map((range) => (
                        <button
                          key={range.value}
                          type="button"
                          onClick={() => setSelectedTrendRange(range.value)}
                          className={`${
                            range.value === selectedTrendRange
                              ? "bg-white font-medium text-[#145b57]"
                              : ""
                          } rounded-lg px-3 py-1 text-xs`}
                          aria-pressed={range.value === selectedTrendRange}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="min-w-0 overflow-hidden rounded-[18px] bg-[linear-gradient(180deg,#e7f0ef_0%,#ffffff_100%)]">
                  <ChartContainer
                    config={inspectionTrendConfig}
                    className="h-[180px] min-w-0 w-full px-1 pt-4"
                  >
                    <AreaChart
                      accessibilityLayer
                      data={activeInspectionTrendData}
                      margin={{ left: 0, right: 0, top: 8, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="fillInspections"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="var(--color-inspections)"
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="100%"
                            stopColor="var(--color-inspections)"
                            stopOpacity={0.04}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            indicator="dot"
                            labelFormatter={(label) =>
                              `${trendLabelPrefix} ${label}`
                            }
                          />
                        }
                      />
                      <Area
                        type="natural"
                        dataKey="inspections"
                        stroke="var(--color-inspections)"
                        strokeWidth={2}
                        fill="url(#fillInspections)"
                        dot={{
                          r: 0,
                          fill: "var(--color-inspections)",
                        }}
                        activeDot={{
                          r: 4,
                          fill: "var(--color-inspections)",
                          stroke: "#f4f5f7",
                          strokeWidth: 2,
                        }}
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0 rounded-[24px] border-0 py-0 mb-4 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-[#145b57]">
                ปัญหาที่พบบ่อย
              </h3>
              <div className="mt-6">
                <div className="grid grid-cols-[80px_1fr] items-start gap-x-2 gap-y-3">
                  {issueBars.map((item) => (
                    <div key={item.label} className="contents">
                      <p className="text-sm leading-6 text-slate-600">
                        {item.label}
                      </p>
                      <div className="relative flex h-8 items-center">
                        <div className="absolute inset-y-0 left-0 right-0">
                          {issueScalePositions.map((position, index) => (
                            <div
                              key={`${item.label}-${issueScaleTicks[index]}`}
                              className="absolute inset-y-0 border-l border-dashed border-slate-200"
                              style={{ left: position }}
                            />
                          ))}
                        </div>
                        <div
                          className={`relative h-4 rounded-full ${item.color}`}
                          style={{ width: `${(item.value / 80) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-2 grid grid-cols-[80px_1fr] gap-3">
                  <div />
                  <div className="relative h-4 text-[11px] text-slate-400">
                    {issueScaleTicks.map((tick, index) => (
                      <span
                        key={tick}
                        className="absolute top-0 text-left"
                        style={{
                          left: issueScalePositions[index],
                          transform:
                            index === 0
                              ? "translateX(0)"
                              : index === issueScaleTicks.length - 1
                                ? "translateX(-100%)"
                                : "translateX(0)",
                        }}
                      >
                        {tick}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* <Button
                variant="ghost"
                className="mt-6 h-11 w-full justify-between rounded-2xl border border-dashed border-[#145b57]/20 bg-[#f7fbfb] px-4 text-[#145b57] hover:bg-[#edf8f7]"
              >
                ดูรายการทั้งหมด
                <ChevronRight className="h-4 w-4" />
              </Button> */}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

function QuickActionButton({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
}) {
  return (
    <Button
      asChild
      variant="ghost"
      className="h-auto flex-1 items-center justify-center gap-2.5 rounded-[14px] p-3 whitespace-normal hover:bg-slate-50"
    >
      <Link href={href}>
        <div className="flex shrink-0 items-center justify-center rounded-full text-[#014C4A]">
          <Icon className="h-16 w-16" />
        </div>

        <span className="text-center text-sm font-medium leading-tight text-slate-700">
          {label}
        </span>
      </Link>
    </Button>
  );
}

function MiniTile({
  title,
  description,
  href,
  isActive,
  currentState,
}: {
  title: string;
  description: string;
  href?: string;
  isActive?: boolean;
  currentState: number;
}) {
  const content = (
    <Card className="rounded-[22px] border-0 p-0 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <CardContent className="p-4">
        <div className={`mb-4 flex rounded-xl p-3 justify-center`}>
          <AnimatedFolder isActive={isActive} state={currentState} />
        </div>
        <p className="text-md font-semibold leading-6 text-slate-900">
          {title}
        </p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
