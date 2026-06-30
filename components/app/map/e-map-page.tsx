"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Map, { MapRef, Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { ChevronRight, FileText, X } from "lucide-react";

import { PIN_ICON_MAP } from "@/components/map/pin-icon-map";
import { ListItemCard } from "@/components/shared/ListItemCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  useBusinessesMap,
  licenseStatusToColor,
} from "@/hooks/useBusinessesMap";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const THAILAND_CENTER: [number, number] = [100.5018, 13.7563];

type MapDocument = {
  id: string;
  title: string;
  status: "active" | "expiringSoon" | "expired";
  expireDate: string;
  detailsHref: string;
};

type MockMapPin = {
  id: string;
  title: string;
  licenseNumber: string;
  address: string;
  longitude: number;
  latitude: number;
  color: string;
  iconKey: keyof typeof PIN_ICON_MAP;
  detailsHref: string;
  documents: MapDocument[];
};

// Mock removed — now sourced from GET /businesses/map via useBusinessesMap hook

export function EMapPageView() {
  const { data: mapData, isLoading: mapLoading } = useBusinessesMap();
  const mapRef = useRef<MapRef>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const [selectedPin, setSelectedPin] = useState<MockMapPin | null>(null);
  const [isInfoCardOpen, setIsInfoCardOpen] = useState(false);

  const pins = useMemo<MockMapPin[]>(() => {
    if (!mapData?.features) return [];
    return mapData.features.map((f) => ({
      id: f.properties.id,
      title: f.properties.nameTh,
      licenseNumber: "-",
      address: "-",
      longitude: f.geometry.coordinates[0],
      latitude: f.geometry.coordinates[1],
      color: licenseStatusToColor(f.properties.licenseStatus),
      iconKey: "hotel" as keyof typeof PIN_ICON_MAP,
      detailsHref: `/businesses/${f.properties.id}`,
      documents: [],
    }));
  }, [mapData]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handlePinSelect = (pin: MockMapPin) => {
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
  pin: MockMapPin;
  isActive: boolean;
  onClick: () => void;
}) {
  const IconComponent = PIN_ICON_MAP[pin.iconKey];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col items-center outline-none"
      aria-label={pin.title}
    >
      <span
        className={cn(
          "absolute inset-x-1 top-1 h-12 rounded-full blur-xl transition-opacity",
          isActive ? "opacity-60" : "opacity-25 group-hover:opacity-45",
        )}
        style={{ backgroundColor: pin.color }}
      />
      <span
        className={cn(
          "relative flex h-[52px] w-[52px] items-center justify-center rounded-full border-4 border-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition-transform",
          isActive ? "scale-105" : "group-hover:scale-105",
        )}
        style={{ backgroundColor: pin.color }}
      >
        <IconComponent size={22} color="white" />
      </span>
      <span
        className="relative -mt-2 h-4 w-4 rotate-45 rounded-[4px] border-r-4 border-b-4 border-white shadow-[4px_4px_10px_rgba(15,23,42,0.08)]"
        style={{ backgroundColor: pin.color }}
      />
    </button>
  );
}

function PinInfoSheet({
  pin,
  onClose,
}: {
  pin: MockMapPin;
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
          <InfoRow label="เลขที่ใบอนุญาต" value={pin.licenseNumber} />
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
            {pin.documents.length} รายการ
          </p>
        </div>

        <div className="space-y-3">
          {pin.documents.map((document) => (
            <Link
              key={document.id}
              href={document.detailsHref}
              className="block"
            >
              <ListItemCard
                title={document.title}
                status={document.status}
                expireDate={document.expireDate}
              />
            </Link>
          ))}
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
