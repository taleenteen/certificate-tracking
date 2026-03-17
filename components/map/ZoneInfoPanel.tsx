"use client";

import React from "react";
import {
  X,
  MapPin,
  Home,
  Plus,
  ChevronRight,
  Calendar,
  Layers,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiZone } from "@/services/zone.service";
import { ApiParcel } from "@/services/parcel.service";

interface ZoneInfoPanelProps {
  zone: ApiZone;
  parcels: ApiParcel[];
  onClose: () => void;
  onAddParcel: (zoneId: string) => void;
  onSelectParcel?: (parcel: ApiParcel) => void;
}

// Zone type labels
const ZONE_TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  WATER_ZONE: { label: "โซนระบบน้ำ", emoji: "💧" },
  FIRE_ZONE: { label: "โซนระบบไฟ", emoji: "🔥" },
  CAMERA_ZONE: { label: "โซนกล้อง", emoji: "📹" },
};

export function ZoneInfoPanel({
  zone,
  parcels,
  onClose,
  onAddParcel,
  onSelectParcel,
}: ZoneInfoPanelProps) {
  const zoneTypeInfo = (zone.type && ZONE_TYPE_LABELS[zone.type]) || {
    label: zone.type || "ทั่วไป",
    emoji: "📍",
  };

  // Filter parcels that belong to this zone
  const zoneParcels = parcels.filter((p) => p.zoneId === zone.id);

  return (
    <div className="w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div
        className="p-4 text-white relative"
        style={{ backgroundColor: zone.color || "#3B82F6" }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/70 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{zoneTypeInfo.emoji}</span>
          <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
            {zoneTypeInfo.label}
          </span>
        </div>
        <h3 className="text-lg font-bold leading-tight pr-8">{zone.name}</h3>
        {zone.description && (
          <p className="text-sm text-white/80 mt-1 line-clamp-2">
            {zone.description}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm">
          <Home className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">
            <strong className="text-gray-800">{zoneParcels.length}</strong> แปลง
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">
            <strong className="text-gray-800">{zone._count?.pins || 0}</strong>{" "}
            หมุด
          </span>
        </div>
      </div>

      {/* Parcels List */}
      <div className="max-h-48 overflow-y-auto">
        {zoneParcels.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {zoneParcels.map((parcel) => (
              <button
                key={parcel.id}
                onClick={() => onSelectParcel?.(parcel)}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      parcel.strokeColor || parcel.fillColor || "#6B7280",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {parcel.name}
                  </p>
                  {parcel.ownerName && (
                    <p className="text-xs text-gray-500 truncate">
                      {parcel.ownerName}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            ))}
          </div>
        ) : (
          <div className="px-4 py-6 text-center">
            <Layers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">ยังไม่มีแปลงในโซนนี้</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 bg-gray-50 border-t border-gray-100 flex gap-2">
        <Button
          onClick={() => onAddParcel(zone.id)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm h-9"
        >
          <Plus className="w-4 h-4 mr-1" />
          เพิ่มแปลง
        </Button>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Edit className="w-4 h-4" />
        </Button>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Calendar className="w-3 h-3" />
          <span>
            สร้างเมื่อ {new Date(zone.createdAt).toLocaleDateString("th-TH")}
          </span>
        </div>
      </div>
    </div>
  );
}
