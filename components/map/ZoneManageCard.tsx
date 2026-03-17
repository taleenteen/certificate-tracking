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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ZoneService, ApiZone, ZoneType } from "@/services/zone.service";
import { useMapActions } from "@/stores/useMapStore";
import { cn } from "@/lib/utils";
import { ZoneEditCard } from "./ZoneEditCard";

// Color options for zones
const ZONE_COLORS = [
  { name: "เขียว", value: "#22C55E" },
  { name: "แดง", value: "#EF4444" },
  { name: "ส้ม", value: "#F97316" },
  { name: "ม่วง", value: "#8B5CF6" },
  { name: "ฟ้า", value: "#06B6D4" },
  { name: "น้ำเงิน", value: "#3B82F6" },
  { name: "ชมพู", value: "#EC4899" },
  { name: "เหลือง", value: "#EAB308" },
];

const ZONE_TYPE_LABELS: Record<ZoneType, string> = {
  [ZoneType.WATER_ZONE]: "โซนแหล่งน้ำ",
  [ZoneType.FIRE_ZONE]: "โซนดับเพลิง",
  [ZoneType.CAMERA_ZONE]: "โซนกล้อง CCTV",
};

interface ZoneManageCardProps {
  onClose: () => void;
}

export function ZoneManageCard({ onClose }: ZoneManageCardProps) {
  const [zones, setZones] = useState<ApiZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingZone, setEditingZone] = useState<ApiZone | null>(null);
  const [polygonEditZone, setPolygonEditZone] = useState<ApiZone | null>(null);
  const [deleteZone, setDeleteZone] = useState<ApiZone | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<ZoneType>(ZoneType.WATER_ZONE);
  const [editColor, setEditColor] = useState("#22C55E");

  const { triggerRefresh } = useMapActions();

  // Fetch zones
  useEffect(() => {
    const fetchZones = async () => {
      try {
        setIsLoading(true);
        const data = await ZoneService.getAll();
        setZones(data || []);
      } catch (error) {
        console.error("Failed to fetch zones:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchZones();
  }, []);

  // Filter zones by search query
  const filteredZones = zones.filter(
    (zone) =>
      zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zone.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Start editing a zone
  const handleStartEdit = (zone: ApiZone) => {
    setEditingZone(zone);
    setEditName(zone.name);
    setEditType(zone.type || ZoneType.WATER_ZONE);
    setEditColor(zone.color || "#22C55E");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingZone(null);
    setEditName("");
    setEditType(ZoneType.WATER_ZONE);
    setEditColor("#22C55E");
  };

  // Save edited zone
  const handleSaveEdit = async () => {
    if (!editingZone) return;

    try {
      setIsSubmitting(true);
      await ZoneService.update(editingZone.id, {
        name: editName,
        type: editType,
        color: editColor,
      });

      // Update local state
      setZones((prev) =>
        prev.map((z) =>
          z.id === editingZone.id
            ? { ...z, name: editName, type: editType, color: editColor }
            : z,
        ),
      );

      triggerRefresh();
      handleCancelEdit();
    } catch (error) {
      console.error("Failed to update zone:", error);
      alert("ไม่สามารถแก้ไขโซนได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete zone
  const handleDeleteZone = async () => {
    if (!deleteZone) return;

    try {
      setIsSubmitting(true);
      await ZoneService.delete(deleteZone.id);

      // Update local state
      setZones((prev) => prev.filter((z) => z.id !== deleteZone.id));

      triggerRefresh();
      setDeleteZone(null);
    } catch (error) {
      console.error("Failed to delete zone:", error);
      alert("ไม่สามารถลบโซนได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="w-[500px] max-h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">จัดการโซน</h2>
              <p className="text-xs text-purple-200">
                {zones.length} โซนทั้งหมด
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="ค้นหาโซน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Zone List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : filteredZones.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? "ไม่พบโซนที่ค้นหา" : "ยังไม่มีโซน"}
            </div>
          ) : (
            filteredZones.map((zone) => (
              <div
                key={zone.id}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  editingZone?.id === zone.id
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300 bg-white",
                )}
              >
                {editingZone?.id === zone.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <Input
                      placeholder="ชื่อโซน"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="font-medium"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <Select
                        value={editType}
                        onValueChange={(v) => setEditType(v as ZoneType)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="ประเภท" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ZONE_TYPE_LABELS).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>

                      <Select value={editColor} onValueChange={setEditColor}>
                        <SelectTrigger>
                          <SelectValue>
                            <div className="flex items-center gap-2">
                              <span
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: editColor }}
                              />
                              <span>
                                {ZONE_COLORS.find((c) => c.value === editColor)
                                  ?.name || "สี"}
                              </span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {ZONE_COLORS.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: color.value }}
                                />
                                <span>{color.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                      >
                        ยกเลิก
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={isSubmitting || !editName.trim()}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "บันทึก"
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{ backgroundColor: zone.color || "#22C55E" }}
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {zone.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {zone.type
                            ? ZONE_TYPE_LABELS[zone.type]
                            : "ไม่ระบุประเภท"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPolygonEditZone(zone)}
                        className="h-8 w-8 text-gray-500 hover:text-blue-600"
                        title="แก้ไขรูปร่าง"
                      >
                        <Move className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStartEdit(zone)}
                        className="h-8 w-8 text-gray-500 hover:text-purple-600"
                        title="แก้ไขข้อมูล"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteZone(zone)}
                        className="h-8 w-8 text-gray-500 hover:text-red-600"
                        title="ลบโซน"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteZone} onOpenChange={() => setDeleteZone(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบโซน</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบโซน "{deleteZone?.name}" หรือไม่?
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteZone}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "ลบโซน"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Polygon Edit Card Overlay */}
      {polygonEditZone && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100">
          <ZoneEditCard
            zone={polygonEditZone}
            onClose={() => setPolygonEditZone(null)}
            onSuccess={() => {
              // Refresh zones list
              ZoneService.getAll().then((data) => setZones(data || []));
            }}
          />
        </div>
      )}
    </>
  );
}
