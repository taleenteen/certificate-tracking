"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Map, { MapRef, Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { ChevronRight, FileText, X, Factory, Loader2 } from "lucide-react";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import "dayjs/locale/th";

import { PIN_ICON_MAP } from "@/components/map/pin-icon-map";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useBusiness } from "@/hooks/useBusinesses";
import {
  useBusinessesMap,
  licenseStatusToColor,
  type BusinessMapFeature,
} from "@/hooks/useBusinessesMap";

dayjs.extend(buddhistEra);

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const THAILAND_CENTER: [number, number] = [100.5018, 13.7563];

type BusinessMapPin = {
  id: string;
  title: string;
  primaryLicenseLabel: string;
  statusLabel: string;
  address: string;
  province: string;
  longitude: number;
  latitude: number;
  color: string;
  iconKey: keyof typeof PIN_ICON_MAP;
  detailsHref: string;
  licenseCount: number;
  ownerLabel: string;
  category: string;
  statusCounts: {
    active: number;
    suspended: number;
    expired: number;
    pending: number;
    revoked: number;
  };
};

/** Map soft categories (navbar filter) onto license type code/name. */
function getCategoryFromPrimaryLicense(
  primary: BusinessMapFeature["properties"]["primaryLicense"],
): string {
  if (!primary) return "";
  const code = primary.typeCode.toLowerCase();
  const name = primary.typeNameTh.toLowerCase();
  if (name.includes("โรงแรม") || code.includes("hotel")) return "hotel";
  if (
    name.includes("โรงพยาบาล") ||
    name.includes("แพทย์") ||
    name.includes("รักษาพยาบาล") ||
    code.includes("hospital") ||
    code.includes("medical")
  )
    return "hospital";
  if (
    name.includes("โรงงาน") ||
    name.includes("การผลิต") ||
    code.includes("factory") ||
    code.includes("diw") ||
    code.includes("ร.ง.")
  )
    return "factory";
  if (
    name.includes("โรงเรียน") ||
    name.includes("สถานศึกษา") ||
    name.includes("ศึกษา") ||
    code.includes("school") ||
    code.includes("education") ||
    code.includes("university")
  )
    return "education";
  return "";
}

function featureToPin(feature: BusinessMapFeature): BusinessMapPin {
  const primaryLicense = feature.properties.primaryLicense;
  return {
    id: feature.properties.id,
    title: feature.properties.nameTh,
    primaryLicenseLabel: primaryLicense
      ? `${primaryLicense.licenseNo} · ${primaryLicense.typeNameTh}`
      : "ยังไม่มีใบอนุญาต",
    statusLabel: getStatusLabel(feature.properties.licenseStatus),
    address: feature.properties.address,
    province: feature.properties.province,
    longitude: feature.geometry.coordinates[0],
    latitude: feature.geometry.coordinates[1],
    color: licenseStatusToColor(feature.properties.licenseStatus),
    iconKey: "hotel" as keyof typeof PIN_ICON_MAP,
    detailsHref: `/businesses/${feature.properties.id}?from=e-map`,
    licenseCount: feature.properties.licenseCount,
    ownerLabel: `${feature.properties.ownership.labelTh}: ${feature.properties.ownership.displayNameTh}`,
    category: getCategoryFromPrimaryLicense(primaryLicense),
    statusCounts: feature.properties.statusCounts,
  };
}

export function EMapPageView() {
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get("q")?.trim() ?? "";
  const regionFilter = searchParams.get("region")?.trim() ?? "";
  const categoriesParam = searchParams.get("categories") ?? "";
  const selectedBusinessId = searchParams.get("selected");

  const categoriesList = useMemo(
    () => categoriesParam.split(",").map((c) => c.trim()).filter(Boolean),
    [categoriesParam],
  );

  const [debouncedQuery, setDebouncedQuery] = useState(rawQuery);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(rawQuery), 400);
    return () => window.clearTimeout(timer);
  }, [rawQuery]);

  // Server-side: text search + province. Category stays client-side
  // (UI categories are soft labels, not exact typeCode).
  const {
    data: mapData,
    isLoading: mapLoading,
    isFetching: mapFetching,
  } = useBusinessesMap({
    q: debouncedQuery || undefined,
    province: regionFilter || undefined,
  });

  const mapRef = useRef<MapRef>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const lastAutoSelectKey = useRef<string>("");
  const [selectedPin, setSelectedPin] = useState<BusinessMapPin | null>(null);
  const [isInfoCardOpen, setIsInfoCardOpen] = useState(false);

  const pins = useMemo<BusinessMapPin[]>(() => {
    if (!mapData?.features) return [];
    const mapped = mapData.features.map(featureToPin);

    if (categoriesList.length === 0) return mapped;

    return mapped.filter(
      (pin) => pin.category && categoriesList.includes(pin.category),
    );
  }, [mapData, categoriesList]);

  // Drop selection if the pin no longer matches filters
  useEffect(() => {
    if (!selectedPin) return;
    if (!pins.some((pin) => pin.id === selectedPin.id)) {
      setIsInfoCardOpen(false);
      setSelectedPin(null);
    }
  }, [pins, selectedPin]);

  const isDebouncing = Boolean(rawQuery) && rawQuery !== debouncedQuery;
  const isBusy = mapLoading || mapFetching || isDebouncing;
  const hasActiveSearch =
    Boolean(rawQuery) || Boolean(regionFilter) || categoriesList.length > 0;

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
      zoom: 14,
      duration: 900,
      offset: [0, 120],
    });
  };

  // Deep-link: /e-map?selected=<businessId>
  useEffect(() => {
    if (!selectedBusinessId || pins.length === 0) return;
    const selected = pins.find((pin) => pin.id === selectedBusinessId);
    if (selected) {
      handlePinSelect(selected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when pins/selected id change
  }, [pins, selectedBusinessId]);

  // After search/filter settles: fly to first match (or selected)
  useEffect(() => {
    if (isBusy || pins.length === 0) return;

    const key = [
      debouncedQuery,
      regionFilter,
      categoriesList.join(","),
      selectedBusinessId ?? "",
      pins.map((p) => p.id).join(","),
    ].join("|");

    if (key === lastAutoSelectKey.current) return;
    lastAutoSelectKey.current = key;

    if (selectedBusinessId) {
      const selected = pins.find((pin) => pin.id === selectedBusinessId);
      if (selected) {
        handlePinSelect(selected);
        return;
      }
    }

    if (!hasActiveSearch) return;

    if (pins.length === 1) {
      handlePinSelect(pins[0]);
      return;
    }

    // Fit bounds around all matching pins
    const lngs = pins.map((p) => p.longitude);
    const lats = pins.map((p) => p.latitude);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    if (minLng === maxLng && minLat === maxLat) {
      handlePinSelect(pins[0]);
      return;
    }

    mapRef.current?.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: 80, duration: 900, maxZoom: 14 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isBusy,
    pins,
    debouncedQuery,
    regionFilter,
    categoriesList,
    selectedBusinessId,
    hasActiveSearch,
  ]);

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
      {isBusy && (
        <div className="absolute inset-x-0 top-0 z-30 flex h-1 items-center justify-center">
          <div className="h-1 w-full animate-pulse bg-[#3D9A80]/40" />
        </div>
      )}

      {hasActiveSearch && !isBusy && (
        <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center px-4">
          <div className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
            พบ {pins.length} สถานที่
            {debouncedQuery ? ` สำหรับ “${debouncedQuery}”` : ""}
          </div>
        </div>
      )}

      {hasActiveSearch && !isBusy && pins.length === 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-14 z-20 flex justify-center px-4">
          <Card className="max-w-sm rounded-2xl border-slate-200 py-0 shadow-md">
            <CardContent className="space-y-1 p-4 text-center">
              <p className="text-sm font-semibold text-slate-900">
                ไม่พบสถานประกอบการ
              </p>
              <p className="text-xs text-slate-500">
                ลองเปลี่ยนคำค้นหาหรือตัวกรอง
              </p>
            </CardContent>
          </Card>
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
          <Factory size={20} color="white" />
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
  const { data: business } = useBusiness(pin.id);

  // Fallback to primary license label if business data is not yet loaded
  const primaryLicenseNo =
    business?.licenses?.[0]?.licenseNumber ||
    pin.primaryLicenseLabel.split(" · ")[0] ||
    "ไม่มีเลขใบอนุญาต";

  return (
    <Card className="pointer-events-auto mx-auto w-full max-w-[430px] rounded-none border-0 py-0 shadow-[0_-10px_35px_rgba(15,23,42,0.15)] rounded-t-[32px] overflow-hidden">
      <CardContent className="space-y-4 p-6 bg-white text-slate-800">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900 leading-snug">
            {pin.title}
          </h2>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="h-[1px] bg-slate-100" />

        <div className="space-y-3.5">
          <div>
            <p className="text-[12px] font-bold text-slate-400">
              เลขที่ใบอนุญาต
            </p>
            <p className="text-[14px] font-semibold text-slate-700 mt-1 select-all">
              {primaryLicenseNo}
            </p>
          </div>
          <div>
            <p className="text-[12px] font-bold text-slate-400">ที่ตั้ง</p>
            <p className="text-[14px] font-semibold text-slate-700 mt-1 leading-relaxed">
              {pin.address}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-slate-700">
            <FileText className="h-5 w-5 text-emerald-800" />
            <span className="text-[14px] font-bold">ใบอนุญาตทั้งหมด</span>
          </div>
          <span className="text-[14px] font-bold text-slate-500">
            {business?.licenses?.length ?? pin.licenseCount} รายการ
          </span>
        </div>

        {!business ? (
          <div className="py-10 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#114e4b]" />
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[170px] overflow-y-auto pr-1">
            {business.licenses.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">
                ไม่มีข้อมูลใบอนุญาต
              </p>
            ) : (
              business.licenses.map((lic) => {
                const expDate = lic.expiresAt
                  ? `วันหมดอายุ : ${dayjs(lic.expiresAt).locale("th").format("D MMM BBBB")}`
                  : "ไม่มีวันหมดอายุ";
                return (
                  <Link
                    key={lic.id}
                    href={`/licenses/${lic.id}?from=e-map`}
                    className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.015)] hover:border-slate-200 transition-all group cursor-pointer"
                  >
                    <div className="space-y-1 text-left">
                      <h3 className="text-[14px] font-bold text-slate-800 group-hover:text-[#114e4b] transition-colors">
                        {lic.licenseType.nameTh}
                      </h3>
                      <p className="text-[12px] font-semibold text-slate-400">
                        {expDate}
                      </p>
                    </div>
                    <ChevronRight className="h-4.5 w-4.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </Link>
                );
              })
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            asChild
            type="button"
            variant="outline"
            className="h-12 rounded-2xl border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
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
            className="h-12 rounded-2xl bg-[#114e4b] hover:bg-[#0c403e] text-sm font-bold text-white border-0 transition-colors cursor-pointer"
          >
            <Link href={pin.detailsHref}>ดูรายละเอียด</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
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
