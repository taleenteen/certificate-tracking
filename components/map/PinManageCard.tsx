"use client";

import React, { useState, useEffect } from "react";
import { X, Pencil, Trash2, Loader2, MapPin, Search, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel as AlertDialogCancelBtn, // Alias
  AlertDialogAction as AlertDialogActionBtn, // Alias
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { PinService } from "@/services/pin.service";
import { ApiPin, PinCategory, PinType } from "@/types/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- Configuration for Badges & Icons (Matching FilterPins/SmartCityMap) ---
const PIN_CATEGORY_LABELS: Record<string, string> = {
  [PinCategory.INFRASTRUCTURE]: "โครงสร้างพื้นฐาน",
  [PinCategory.ASSET]: "ครุภัณฑ์",
  [PinCategory.SERVICE_POINT]: "จุดบริการ",
  [PinCategory.ENVIRONMENT]: "สิ่งแวดล้อม",
  [PinCategory.RISK]: "ความเสี่ยง",
  [PinCategory.ECONOMY]: "เศรษฐกิจ",
  [PinCategory.MANAGEMENT]: "ข้อมูลบริหาร",
  [PinCategory.DEVICE]: "อุปกรณ์ IoT",
  [PinCategory.SOLAR]: "Solar Cell",
};

const PIN_TYPE_LABELS: Record<string, string> = {
  [PinType.WATER]: "น้ำ",
  [PinType.FIRE]: "ไฟไหม้",
  [PinType.CAMERA]: "กล้อง CCTV",
  [PinType.TAX]: "ภาษี",
  [PinType.SOLAR]: "Solar Cell",
  [PinType.INFO]: "ข้อมูลทั่วไป",
};

// Start: Helper to get color for category badge
const getCategoryColor = (category: string) => {
  switch (category) {
    case PinCategory.INFRASTRUCTURE:
      return "bg-amber-100 text-amber-800 border-amber-200";
    case PinCategory.ASSET:
      return "bg-blue-100 text-blue-800 border-blue-200";
    case PinCategory.SERVICE_POINT:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case PinCategory.ENVIRONMENT:
      return "bg-green-100 text-green-800 border-green-200";
    case PinCategory.RISK:
      return "bg-red-100 text-red-800 border-red-200";
    case PinCategory.ECONOMY:
      return "bg-orange-100 text-orange-800 border-orange-200";
    case PinCategory.MANAGEMENT:
      return "bg-purple-100 text-purple-800 border-purple-200";
    case PinCategory.DEVICE:
      return "bg-sky-100 text-sky-800 border-sky-200";
    case PinCategory.SOLAR:
      return "bg-cyan-100 text-cyan-800 border-cyan-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

interface PinManageCardProps {
  onClose: () => void;
  onEditPin: (pin: ApiPin) => void;
  onFlyTo?: (lng: number, lat: number) => void;
}

export function PinManageCard({
  onClose,
  onEditPin,
  onFlyTo,
}: PinManageCardProps) {
  const [pins, setPins] = useState<ApiPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL"); // Added type filter
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch pins
  useEffect(() => {
    const fetchPins = async () => {
      setLoading(true);
      try {
        const data = await PinService.getAll();
        // Ensure data is array
        const pinList = Array.isArray(data) ? data : (data as any).data || [];
        setPins(pinList);
      } catch (error) {
        console.error("Failed to fetch pins:", error);
        toast.error("ไม่สามารถโหลดรายการหมุดได้");
      } finally {
        setLoading(false);
      }
    };
    fetchPins();
  }, [refreshKey]);

  // Filter logic
  const filteredPins = pins.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description &&
        p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === "ALL" || p.category === categoryFilter;

    // Optional: Filter by type if needed, currently reusing logic
    const matchesType = typeFilter === "ALL" || p.type === typeFilter;

    return matchesSearch && matchesCategory;
  });

  // Actions
  const handleFlyTo = (pin: ApiPin) => {
    // Check geometry
    if (pin.geometry?.coordinates) {
      // If point
      if (
        pin.geometry.type === "POINT" &&
        Array.isArray(pin.geometry.coordinates)
      ) {
        const [lng, lat] = pin.geometry.coordinates as number[];
        onFlyTo?.(lng, lat);
        toast.success(`ไปที่หมุด "${pin.title}"`);
      }
      // TODO: Handle Polygon fly-to if needed (using turf/center)
    } else {
      toast.error("หมุดนี้ไม่มีข้อมูลพิกัด");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await PinService.delete(deleteId);
      toast.success("ลบหมุดเรียบร้อยแล้ว");
      setRefreshKey((prev) => prev + 1); // Refresh list
    } catch (error: any) {
      console.error("Failed to delete pin:", error);
      toast.error(error.message || "ลบหมุดไม่สำเร็จ");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <Card className="w-[520px] max-h-[700px] flex flex-col shadow-2xl border-0 rounded-xl overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-50 rounded-lg">
            <MapPin className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">
              จัดการหมุด
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              ค้นหา แก้ไข หรือลบหมุดที่ไม่ต้องการ
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 space-y-3 bg-gray-50/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="ค้นหาชื่อหมุด..."
            className="pl-9 bg-white border-gray-200 focus:ring-rose-500 focus:border-rose-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full bg-white border-gray-200">
              <SelectValue placeholder="หมวดหมู่ทั้งหมด" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">หมวดหมู่ทั้งหมด</SelectItem>
              {Object.entries(PIN_CATEGORY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1 bg-white h-[400px]">
        <div className="p-2 space-y-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span className="text-sm">กำลังโหลดข้อมูล...</span>
            </div>
          ) : filteredPins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <MapPin className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-medium text-gray-500">
                ไม่พบข้อมูลหมุด
              </p>
              <p className="text-xs text-gray-400">
                ลองค้นหาด้วยคำใหม่ หรือเปลี่ยนตัวกรอง
              </p>
            </div>
          ) : (
            filteredPins.map((pin) => (
              <div
                key={pin.id}
                className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Icon Placeholder or dynamic icon */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      getCategoryColor(pin.category),
                    )}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate max-w-[180px]">
                        {pin.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0 h-5 font-normal border-0",
                          getCategoryColor(pin.category),
                        )}
                      >
                        {PIN_CATEGORY_LABELS[pin.category] || pin.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">
                        {PIN_TYPE_LABELS[pin.type] || pin.type}
                      </span>
                      {pin.zoneId && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span className="text-xs text-gray-400">
                            มีโซนระบุ
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                    onClick={() => handleFlyTo(pin)}
                    title="ไปที่จุดนี้"
                  >
                    <Move className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-orange-600 hover:bg-orange-50"
                    onClick={() => onEditPin(pin)}
                    title="แก้ไข"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteId(pin.id)}
                        title="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบหมุด</AlertDialogTitle>
                        <AlertDialogDescription>
                          คุณแน่ใจหรือไม่ที่จะลบหมุดนี้?
                          การกระทำนี้ไม่สามารถย้อนกลับได้
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteId(null)}>
                          ยกเลิก
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          ยืนยันลบ
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
