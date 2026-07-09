"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Map, { MapRef, Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { ChevronRight, FileText, X } from "lucide-react";

import { PIN_ICON_MAP } from "@/components/map/pin-icon-map";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  useBusinessesMap,
  licenseStatusToColor,
} from "@/hooks/useBusinessesMap";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const THAILAND_CENTER: [number, number] = [100.5018, 13.7563];

type BusinessMapPin = {
  id: string;
  title: string;
  primaryLicenseLabel: string;
  statusLabel: string;
  address: string;
  longitude: number;
  latitude: number;
  color: string;
  iconKey: keyof typeof PIN_ICON_MAP;
  detailsHref: string;
  licenseCount: number;
  ownerLabel: string;
  statusCounts: {
    active: number;
    suspended: number;
    expired: number;
    pending: number;
    revoked: number;
  };
};

export function EMapPageView() {
  const { data: mapData, isLoading: mapLoading } = useBusinessesMap();
  const searchParams = useSearchParams();
  const mapRef = useRef<MapRef>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const [selectedPin, setSelectedPin] = useState<BusinessMapPin | null>(null);
  const [isInfoCardOpen, setIsInfoCardOpen] = useState(false);

  const pins = useMemo<BusinessMapPin[]>(() => {
    if (!mapData?.features) return [];
    return mapData.features.map((feature) => {
      const primaryLicense = feature.properties.primaryLicense;

      return {
        id: feature.properties.id,
        title: feature.properties.nameTh,
        primaryLicenseLabel: primaryLicense
          ? `${primaryLicense.licenseNo} · ${primaryLicense.typeNameTh}`
          : "ยังไม่มีใบอนุญาต",
        statusLabel: getStatusLabel(feature.properties.licenseStatus),
        address: feature.properties.address,
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1],
        color: licenseStatusToColor(feature.properties.licenseStatus),
        iconKey: "hotel" as keyof typeof PIN_ICON_MAP,
        detailsHref: `/businesses/${feature.properties.id}?from=e-map`,
        licenseCount: feature.properties.licenseCount,
        ownerLabel: `${feature.properties.ownership.labelTh}: ${feature.properties.ownership.displayNameTh}`,
        statusCounts: feature.properties.statusCounts,
      };
    });
  }, [mapData]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handlePinSelect = (pin: BusinessMapPin) => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
    }

    setSelectedPin(pin);
    setIsInfoCardOpen(true);
    mapRef.current?.flyTo({
      center: [pin.longitude, pin.latitude],
      zoom: 11,
      duration: 900,
      offset: [0, 120],
    });
  };

  useEffect(() => {
    const selectedBusinessId = searchParams.get("selected");
    if (!selectedBusinessId || pins.length === 0) return;

    const selected = pins.find((pin) => pin.id === selectedBusinessId);
    if (selected) {
      handlePinSelect(selected);
    }
  }, [pins, searchParams]);

  const handleCloseInfoCard = () => {
    setIsInfoCardOpen(false);

    closeTimeoutRef.current = window.setTimeout(() => {
      setSelectedPin(null);
      closeTimeoutRef.current = null;
    }, 300);
  };

  if (!MAPBOX_TOKEN) {
    return (
      <main className="flex h-full items-center justify-center bg-[#f4f5f7] px-4">
        <Card className="max-w-sm rounded-3xl border-slate-200 py-0 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <CardContent className="space-y-3 p-6 text-center">
            <p className="text-sm font-semibold text-slate-900">
              ยังไม่ได้ตั้งค่า Mapbox token
            </p>
            <p className="text-sm text-slate-500">
              กรุณากำหนด `NEXT_PUBLIC_MAPBOX_TOKEN` เพื่อแสดงหน้า e-map
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="relative h-full overflow-hidden bg-[#eef2f5]">
      {mapLoading && (
        <div className="absolute inset-x-0 top-0 z-30 flex h-1 items-center justify-center">
          <div className="h-1 w-full animate-pulse bg-[#3D9A80]/40" />
        </div>
      )}
      <div className="absolute inset-0">
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: THAILAND_CENTER[0],
            latitude: THAILAND_CENTER[1],
            zoom: 11,
          }}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/navigation-day-v1"
          reuseMaps
          style={{ width: "100%", height: "100%" }}
        >
          {pins.map((pin) => (
            <Marker
              key={pin.id}
              longitude={pin.longitude}
              latitude={pin.latitude}
              anchor="bottom"
            >
              <MapPinMarker
                pin={pin}
                isActive={selectedPin?.id === pin.id}
                onClick={() => handlePinSelect(pin)}
              />
            </Marker>
          ))}

          <Marker longitude={100.5568} latitude={13.7175} anchor="center">
            <div className="relative">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#2d79ff]/35" />
              <span className="relative block h-4 w-4 rounded-full border-2 border-white bg-[#2d79ff] shadow-[0_0_0_4px_rgba(45,121,255,0.2)]" />
            </div>
          </Marker>
        </Map>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-20 pt-6 transition-all duration-300",
          isInfoCardOpen
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0",
        )}
      >
        {selectedPin ? (
          <PinInfoSheet pin={selectedPin} onClose={handleCloseInfoCard} />
        ) : null}
      </div>
    </main>
  );
}

function MapPinMarker({
  pin,
  isActive,
  onClick,
}: {
  pin: BusinessMapPin;
  isActive: boolean;
  onClick: () => void;
}) {
  const IconComponent = PIN_ICON_MAP[pin.iconKey];
  const markerColor = "#0c604c";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative h-[68px] w-[58px] outline-none"
      aria-label={pin.title}
    >
      <span
        className={cn(
          "absolute inset-x-2 top-2 h-12 rounded-full blur-xl transition-opacity",
          isActive ? "opacity-60" : "opacity-25 group-hover:opacity-45",
        )}
        style={{ backgroundColor: markerColor }}
      />
      <span
        className={cn(
          "relative block h-full w-full drop-shadow-[0_14px_24px_rgba(15,23,42,0.20)] transition-transform",
          isActive ? "scale-105" : "group-hover:scale-105",
        )}
      >
        <svg
          viewBox="0 0 58 68"
          className="absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <path
            d="M29 65L16.8 42.5C20.2 44.6 24.4 45.8 29 45.8C33.6 45.8 37.8 44.6 41.2 42.5L29 65Z"
            fill={markerColor}
            stroke="white"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <circle
            cx="29"
            cy="26"
            r="23"
            fill={markerColor}
            stroke="white"
            strokeWidth="4"
          />
        </svg>
        <span className="absolute left-1/2 top-[25px] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <IconComponent size={22} color="white" />
        </span>
      </span>
    </button>
  );
}

function PinInfoSheet({
  pin,
  onClose,
}: {
  pin: BusinessMapPin;
  onClose: () => void;
}) {
  return (
    <Card className="pointer-events-auto mx-auto max-w-md rounded-none border-0 py-0 shadow-[0_-10px_30px_rgba(15,23,42,0.18)] rounded-t-3xl">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3 mb-0">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900">
              {pin.title}
            </h2>
          </div>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-3 h-px bg-slate-200" />

        <div className="space-y-3">
          <InfoRow label="เจ้าของข้อมูล" value={pin.ownerLabel} />
          <InfoRow label="ใบอนุญาตหลัก" value={pin.primaryLicenseLabel} />
          <InfoRow label="สถานะภาพรวม" value={pin.statusLabel} />
          <InfoRow label="ที่ตั้ง" value={pin.address} />
        </div>

        <div className="flex items-center justify-between border-slate-200 pt-1">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0c6d66]/10 text-[#0c6d66]">
              <FileText className="h-4 w-4" />
            </div>
            <span>ใบอนุญาตทั้งหมด</span>
          </div>
          <p className="text-sm font-semibold text-slate-900">
            {pin.licenseCount} รายการ
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatusPill label="ใช้งาน" count={pin.statusCounts.active} />
          <StatusPill label="ระงับ" count={pin.statusCounts.suspended} />
          <StatusPill label="หมดอายุ" count={pin.statusCounts.expired} />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            asChild
            type="button"
            variant="outline"
            className="h-12 rounded-2xl border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${pin.latitude},${pin.longitude}`}
              target="_blank"
              rel="noreferrer"
            >
              นำทาง
            </a>
          </Button>

          <Button
            asChild
            type="button"
            className="h-12 rounded-2xl bg-[#04302F] text-sm font-medium text-white hover:bg-[#0d403d]"
          >
            <Link href={pin.detailsHref}>
              ดูรายละเอียด
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm text-slate-900">{value}</p>
    </div>
  );
}

function StatusPill({ label, count }: { label: string; count: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-2 text-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{count}</p>
    </div>
  );
}

function getStatusLabel(status: string | null) {
  if (status === "ACTIVE") return "ใช้งาน";
  if (status === "SUSPENDED") return "ระงับชั่วคราว";
  if (status === "EXPIRED") return "หมดอายุ";
  if (status === "REVOKED") return "เพิกถอน";
  if (status === "PENDING") return "รอดำเนินการ";
  return "ไม่มีสถานะ";
}
