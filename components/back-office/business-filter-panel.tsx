"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { MapPin } from "lucide-react";
import type { IconType } from "react-icons";
import {
  MdOutlineHotel,
  MdOutlineFactory,
  MdOutlineLocalHospital,
  MdOutlineSchool,
} from "react-icons/md";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const BUSINESS_CATEGORY_OPTIONS = [
  { value: "hotel", label: "โรงแรม", icon: MdOutlineHotel },
  { value: "hospital", label: "โรงพยาบาล", icon: MdOutlineLocalHospital },
  { value: "factory", label: "โรงงาน", icon: MdOutlineFactory },
  { value: "education", label: "สถานศึกษา", icon: MdOutlineSchool },
] as const;

const REGION_OPTIONS = [
  "กรุงเทพมหานคร",
  "เชียงใหม่",
  "ชลบุรี",
  "นครราชสีมา",
  "ภูเก็ต",
] as const;

export type BusinessCategory =
  (typeof BUSINESS_CATEGORY_OPTIONS)[number]["value"];

export type BusinessFilterValue = {
  categories?: BusinessCategory[];
  region?: string;
};

type BusinessFilterPanelProps = {
  initialValue: BusinessFilterValue;
  onApply: (value: BusinessFilterValue) => void;
  onReset: () => void;
};

export function BusinessFilterPanel({
  initialValue,
  onApply,
  onReset,
}: BusinessFilterPanelProps) {
  const [draft, setDraft] = useState<BusinessFilterValue>(initialValue);

  useEffect(() => {
    setDraft(initialValue);
  }, [initialValue]);

  return (
    <div className="bg-white p-5 text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <section>
        <h2 className="text-base font-semibold text-slate-950">
          ประเภทสถานประกอบการ
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {BUSINESS_CATEGORY_OPTIONS.map((option) => (
            <CategoryButton
              key={option.value}
              icon={option.icon}
              label={option.label}
              isActive={draft.categories?.includes(option.value) ?? false}
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  categories: current.categories?.includes(option.value)
                    ? current.categories.filter(
                        (value) => value !== option.value,
                      )
                    : [...(current.categories ?? []), option.value],
                }))
              }
            />
          ))}
        </div>
      </section>

      <section className="mt-5">
        <h2 className="text-base font-semibold text-slate-950">ภูมิภาค</h2>
        <Select
          value={draft.region}
          onValueChange={(value) =>
            setDraft((current) => ({
              ...current,
              region: value,
            }))
          }
        >
          <SelectTrigger className="mt-3 h-12 w-full rounded-2xl border-slate-200 px-4 text-left text-sm text-slate-700 shadow-none">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              <SelectValue placeholder="จังหวัด, เขต/อำเภอ, แขวง/ตำบล, รหัสไปรษณีย์" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {REGION_OPTIONS.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-2xl border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 shadow-none hover:bg-slate-100"
          onClick={() => {
            setDraft({});
            onReset();
          }}
        >
          รีเซ็ต
        </Button>
        <Button
          type="button"
          className="h-11 rounded-2xl bg-[#114e4b] text-sm font-semibold text-white hover:bg-[#0d3f3c]"
          onClick={() => onApply(draft)}
        >
          ยืนยัน
        </Button>
      </div>
    </div>
  );
}

function CategoryButton({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: IconType | LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-11 items-center gap-2.5 rounded-2xl border px-3 text-left transition-colors",
        isActive
          ? "border-[#114e4b] bg-[#e7f2f1] text-[#114e4b]"
          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="text-sm font-medium leading-none">{label}</span>
    </button>
  );
}
