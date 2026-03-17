import React from "react";
import {
  Droplets,
  Flame,
  Video,
  Home,
  MapPin,
  Building2,
  Package,
  TreePine,
  AlertTriangle,
  ShoppingBag,
  BarChart,
  Cpu,
  Info,
} from "lucide-react";
import { PinType, PinCategory } from "@/types/api";

interface PinHoverTooltipProps {
  title: string;
  type?: string;
  category?: string;
  subtype?: string;
}

// Get icon and color based on type or category
function getPinStyle(type?: string, category?: string) {
  const upperType = type?.toUpperCase();
  const upperCategory = category?.toUpperCase();

  // Device types
  switch (upperType) {
    case PinType.WATER:
      return { icon: Droplets, color: "bg-blue-500", label: "ระบบน้ำ" };
    case PinType.FIRE:
      return { icon: Flame, color: "bg-red-500", label: "ดับเพลิง" };
    case PinType.CAMERA:
      return { icon: Video, color: "bg-purple-500", label: "กล้อง CCTV" };
    case PinType.TAX:
      return { icon: Home, color: "bg-slate-700", label: "ภาษี" };
  }

  // Info categories
  switch (upperCategory) {
    case PinCategory.INFRASTRUCTURE:
      return {
        icon: Building2,
        color: "bg-amber-700",
        label: "โครงสร้างพื้นฐาน",
      };
    case PinCategory.ASSET:
      return { icon: Package, color: "bg-blue-600", label: "ครุภัณฑ์" };
    case PinCategory.SERVICE_POINT:
      return { icon: MapPin, color: "bg-yellow-600", label: "จุดบริการ" };
    case PinCategory.ENVIRONMENT:
      return { icon: TreePine, color: "bg-green-600", label: "สิ่งแวดล้อม" };
    case PinCategory.RISK:
      return { icon: AlertTriangle, color: "bg-red-500", label: "ความเสี่ยง" };
    case PinCategory.ECONOMY:
      return { icon: ShoppingBag, color: "bg-orange-500", label: "เศรษฐกิจ" };
    case PinCategory.MANAGEMENT:
      return { icon: BarChart, color: "bg-orange-600", label: "ข้อมูลบริหาร" };
    case PinCategory.DEVICE:
      return { icon: Cpu, color: "bg-blue-500", label: "อุปกรณ์ IoT" };
  }

  // Default
  return { icon: Info, color: "bg-cyan-600", label: "ข้อมูล" };
}

export default function PinHoverTooltip({
  title,
  type,
  category,
  subtype,
}: PinHoverTooltipProps) {
  const style = getPinStyle(type, category);
  const Icon = style.icon;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-100 max-w-xs">
      <div
        className={`${style.color} p-1.5 rounded-md flex items-center justify-center`}
      >
        <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 text-sm truncate leading-tight">
          {title}
        </p>
        <p className="text-xs text-gray-500 leading-tight">
          {subtype || style.label}
        </p>
      </div>
    </div>
  );
}
