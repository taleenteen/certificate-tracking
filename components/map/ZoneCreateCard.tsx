"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Pencil,
  Trash2,
  Loader2,
  Palette,
  MapIcon,
  Home,
  Building2,
  Factory,
  Landmark,
  Store,
  Trees,
  Plus,
  X,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Map, {
  ViewStateChangeEvent,
  MapRef,
  Source,
  Layer,
} from "react-map-gl/mapbox";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { ZoneService, ZoneType, ApiZone } from "@/services/zone.service";
import {
  ParcelService,
  ApiParcel,
  ParcelType,
  ParcelStatus,
} from "@/services/parcel.service";
import { toast } from "sonner";
import * as turf from "@turf/turf";
import { useMapActions } from "@/stores/useMapStore";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const zoneFormSchema = z
  .object({
    activeTab: z.enum(["zone", "parcel"]),
    name: z.string().optional(),
    description: z.string().optional(),
    color: z.string().optional(),
    // Parcel fields
    parcelName: z.string().optional(),
    parcelDescription: z.string().optional(),
    parcelType: z.nativeEnum(ParcelType).optional(),
    parcelOwnerName: z.string().optional(),
    parcelOwnerPhone: z.string().optional(),
    parcelLandTitle: z.string().optional(),
    parcelAddress: z.string().optional(),
    selectedZoneId: z.string().optional(),
    polygonGeometry: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.activeTab === "zone") {
      if (!data.name || data.name.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "กรุณาระบุชื่อโซน",
          path: ["name"],
        });
      }
    } else {
      if (!data.parcelName || data.parcelName.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "กรุณาระบุชื่อ/บ้านเลขที่",
          path: ["parcelName"],
        });
      }
      if (!data.selectedZoneId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "กรุณาเลือกโซนหลัก",
          path: ["selectedZoneId"],
        });
      }
    }
    if (!data.polygonGeometry) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "กรุณาวาดพื้นที่บนแผนที่",
        path: ["polygonGeometry"],
      });
    }
  });

export type ZoneFormValues = z.infer<typeof zoneFormSchema>;

// Preset colors for zone selection
const ZONE_COLORS = [
  { name: "น้ำเงิน", value: "#3B82F6" },
  { name: "เขียว", value: "#22C55E" },
  { name: "แดง", value: "#EF4444" },
  { name: "ส้ม", value: "#F97316" },
  { name: "ม่วง", value: "#8B5CF6" },
  { name: "ฟ้า", value: "#06B6D4" },
];

// Parcel type config with icons
const PARCEL_TYPE_CONFIG = {
  [ParcelType.RESIDENTIAL]: {
    label: "ที่อยู่อาศัย",
    icon: Home,
    color: "#3B82F6",
  },
  [ParcelType.COMMERCIAL]: { label: "พาณิชย์", icon: Store, color: "#22C55E" },
  [ParcelType.INDUSTRIAL]: {
    label: "อุตสาหกรรม",
    icon: Factory,
    color: "#6B7280",
  },
  [ParcelType.AGRICULTURAL]: {
    label: "เกษตรกรรม",
    icon: Trees,
    color: "#84CC16",
  },
  [ParcelType.GOVERNMENT]: {
    label: "หน่วยงานราชการ",
    icon: Landmark,
    color: "#8B5CF6",
  },
  [ParcelType.MIXED_USE]: {
    label: "ผสมผสาน",
    icon: Building2,
    color: "#F97316",
  },
};

interface ZoneCreateCardProps {
  onClose: () => void;
  onSuccess?: (zone: any) => void;
}

export function ZoneCreateCard({ onClose, onSuccess }: ZoneCreateCardProps) {
  const { triggerRefresh } = useMapActions();

  // RHF Setup
  const form = useForm<ZoneFormValues>({
    resolver: zodResolver(zoneFormSchema),
    defaultValues: {
      activeTab: "zone",
      name: "",
      description: "",
      color: ZONE_COLORS[0].value,
      parcelName: "",
      parcelDescription: "",
      parcelType: ParcelType.RESIDENTIAL,
      parcelOwnerName: "",
      parcelOwnerPhone: "",
      parcelLandTitle: "",
      parcelAddress: "",
      selectedZoneId: "",
      polygonGeometry: undefined,
    },
    mode: "onChange",
  });

  const {
    watch,
    setValue,
    handleSubmit: hookFormSubmit,
    formState: { errors },
  } = form;

  const activeTab = watch("activeTab");
  const name = watch("name") || "";
  const description = watch("description") || "";
  const color = watch("color") || ZONE_COLORS[0].value;
  const parcelName = watch("parcelName") || "";
  const parcelDescription = watch("parcelDescription") || "";
  const parcelType = watch("parcelType") || ParcelType.RESIDENTIAL;
  const parcelOwnerName = watch("parcelOwnerName") || "";
  const parcelOwnerPhone = watch("parcelOwnerPhone") || "";
  const parcelLandTitle = watch("parcelLandTitle") || "";
  const parcelAddress = watch("parcelAddress") || "";
  const selectedZoneId = watch("selectedZoneId") || "";
  const polygonGeometry = watch("polygonGeometry");

  const setPolygonGeometry = useCallback(
    (geom: GeoJSON.Polygon | null) => {
      setValue("polygonGeometry", geom, { shouldValidate: true });
    },
    [setValue],
  );

  const [isLoading, setIsLoading] = useState(false);

  // Manual coordinate input mode
  const [inputMode, setInputMode] = useState<"draw" | "manual">("draw");
  const [manualCoords, setManualCoords] = useState<
    { lat: string; lng: string }[]
  >([
    { lat: "", lng: "" },
    { lat: "", lng: "" },
    { lat: "", lng: "" },
  ]);

  const [zones, setZones] = useState<ApiZone[]>([]);
  const [isLoadingZones, setIsLoadingZones] = useState(false);
  const [isParcelLoading, setIsParcelLoading] = useState(false);

  // Existing parcels in selected zone (for parcel tab)
  const [existingParcels, setExistingParcels] = useState<ApiParcel[]>([]);

  // Map state
  const [viewState, setViewState] = useState({
    latitude: 13.736717,
    longitude: 100.523186,
    zoom: 15,
  });
  const [isDrawing, setIsDrawing] = useState(false);

  // Refs
  const mapRef = useRef<MapRef>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Refs for values used in event handler closures (to avoid stale closures)
  const activeTabRef = useRef(activeTab);
  const zonesRef = useRef(zones);
  const isDrawingRef = useRef(isDrawing);
  activeTabRef.current = activeTab;
  zonesRef.current = zones;
  isDrawingRef.current = isDrawing;

  // Fetch zones for parcel dropdown
  useEffect(() => {
    const fetchZones = async () => {
      setIsLoadingZones(true);
      try {
        const data = await ZoneService.getAll();
        setZones(data || []);
      } catch (error) {
        console.error("Failed to fetch zones:", error);
      } finally {
        setIsLoadingZones(false);
      }
    };
    fetchZones();
  }, []);

  // Sync polygon geometry with manual coords for editing
  useEffect(() => {
    if (polygonGeometry && polygonGeometry.coordinates[0]) {
      const coords = polygonGeometry.coordinates[0];
      // Remove the last point if it's the same as first (closing point)
      const uniqueCoords = coords.slice(0, coords.length - 1);
      setManualCoords(
        uniqueCoords.map(([lng, lat]: any) => ({
          lat: lat.toFixed(6),
          lng: lng.toFixed(6),
        })),
      );
    }
  }, [polygonGeometry]);

  // Pan to selected zone
  useEffect(() => {
    if (selectedZoneId && activeTab === "parcel") {
      const zone = zones.find((z) => z.id === selectedZoneId);
      if (zone?.geometry?.coordinates) {
        try {
          const polygon = turf.polygon(
            zone.geometry.coordinates as number[][][],
          );
          const centroid = turf.centroid(polygon);
          const [lng, lat] = centroid.geometry.coordinates;
          setViewState((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            zoom: 17,
          }));
        } catch (error) {
          console.error("Failed to calculate zone center:", error);
        }
      }
    }
  }, [selectedZoneId, activeTab, zones]);

  // Fetch existing parcels when a zone is selected in parcel tab
  useEffect(() => {
    if (!selectedZoneId || activeTab !== "parcel") {
      setExistingParcels([]);
      return;
    }
    const fetchParcels = async () => {
      try {
        const data = await ParcelService.getByZone(selectedZoneId);
        setExistingParcels(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch existing parcels:", error);
      }
    };
    fetchParcels();
  }, [selectedZoneId, activeTab]);

  // Current stroke color based on tab
  const currentColor =
    activeTab === "zone"
      ? color
      : PARCEL_TYPE_CONFIG[parcelType]?.color || "#6B7280";

  // Draw styles with dynamic color (dashed for parcel)
  const getDrawStyles = useCallback(
    (fillColor: string, isDashed: boolean) => [
      {
        id: "gl-draw-polygon-fill",
        type: "fill",
        filter: ["all", ["==", "$type", "Polygon"]],
        paint: { "fill-color": fillColor, "fill-opacity": 0.2 },
      },
      {
        id: "gl-draw-polygon-stroke",
        type: "line",
        filter: ["all", ["==", "$type", "Polygon"]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": fillColor,
          "line-width": 2,
          "line-dasharray": isDashed ? [4, 3] : [1, 0],
        },
      },
      {
        id: "gl-draw-line",
        type: "line",
        filter: ["all", ["==", "$type", "LineString"]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": fillColor,
          "line-width": 2,
          "line-dasharray": [2, 2],
        },
      },
      {
        id: "gl-draw-vertex",
        type: "circle",
        filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
        paint: {
          "circle-radius": 5,
          "circle-color": "#fff",
          "circle-stroke-color": fillColor,
          "circle-stroke-width": 2,
        },
      },
      {
        id: "gl-draw-midpoint",
        type: "circle",
        filter: ["all", ["==", "meta", "midpoint"]],
        paint: { "circle-radius": 3, "circle-color": fillColor },
      },
    ],
    [],
  );

  // Initialize MapboxDraw when map loads
  const handleMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || drawRef.current) return;

    try {
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          trash: false,
        },
        defaultMode: "simple_select",
        styles: getDrawStyles(currentColor, activeTab === "parcel"),
        clickBuffer: 10,
        touchBuffer: 20,
      });

      map.addControl(draw as unknown as mapboxgl.IControl);
      drawRef.current = draw;
      setIsMapReady(true);

      // Event handlers
      map.on("draw.create", (e: { features: GeoJSON.Feature[] }) => {
        if (e.features.length > 0) {
          const feature = e.features[0];
          if (feature.geometry.type === "Polygon") {
            setPolygonGeometry(feature.geometry as GeoJSON.Polygon);
            setIsDrawing(false);
            // Switch back to simple_select mode
            setTimeout(() => {
              if (drawRef.current) {
                drawRef.current.changeMode("simple_select");
              }
            }, 100);
          }
        }
      });

      map.on("draw.update", (e: { features: GeoJSON.Feature[] }) => {
        if (e.features.length > 0) {
          const feature = e.features[0];
          if (feature.geometry.type === "Polygon") {
            setPolygonGeometry(feature.geometry as GeoJSON.Polygon);
          }
        }
      });

      map.on("draw.delete", () => {
        setPolygonGeometry(null);
      });

      // Check for clicking inside existing zones (only in zone mode)
      // Uses refs to avoid stale closure - activeTab/zones captured at load time would be stale
      map.on("click", (e: mapboxgl.MapMouseEvent) => {
        if (activeTabRef.current !== "zone") return;
        if (!isDrawingRef.current) return;

        const clickedPoint = turf.point([e.lngLat.lng, e.lngLat.lat]);

        for (const zone of zonesRef.current) {
          if (!zone.geometry?.coordinates) continue;
          try {
            const existingPolygon = turf.polygon(
              zone.geometry.coordinates as number[][][],
            );
            if (turf.booleanPointInPolygon(clickedPoint, existingPolygon)) {
              toast.error(`ไม่สามารถวาดในพื้นที่ "${zone.name}" ที่มีอยู่แล้ว`);
              // Cancel drawing mode
              if (drawRef.current) {
                drawRef.current.changeMode("simple_select");
                setIsDrawing(false);
              }
              return;
            }
          } catch {
            // Skip invalid geometry
          }
        }
      });
    } catch (err) {
      console.error("Error initializing MapboxDraw:", err);
    }
  }, [currentColor, getDrawStyles]);

  // Reinitialize draw when tab or color changes
  useEffect(() => {
    if (!isMapReady || !drawRef.current) return;
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Remove old draw control
    try {
      map.removeControl(drawRef.current as unknown as mapboxgl.IControl);
    } catch (e) {
      // Ignore
    }

    // Add new draw control with updated styles
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
      styles: getDrawStyles(currentColor, activeTab === "parcel"),
      clickBuffer: 12,
      touchBuffer: 20,
    });

    map.addControl(draw as unknown as mapboxgl.IControl);
    drawRef.current = draw;

    // Re-add existing polygon if any
    if (polygonGeometry) {
      draw.add({
        type: "Feature",
        geometry: polygonGeometry,
        properties: {},
      });
    }
  }, [activeTab, currentColor, getDrawStyles, isMapReady]);

  // Clear polygon when switching tabs
  useEffect(() => {
    if (drawRef.current) {
      drawRef.current.deleteAll();
    }
    setPolygonGeometry(null);
    setIsDrawing(false);
  }, [activeTab]);

  // Start drawing polygon
  const startDrawingPolygon = () => {
    if (!drawRef.current) {
      toast.error("แผนที่ยังไม่พร้อม กรุณารอสักครู่");
      return;
    }
    drawRef.current.deleteAll();
    drawRef.current.changeMode("draw_polygon");
    setIsDrawing(true);
    setPolygonGeometry(null);
  };

  // Clear polygon
  const clearPolygon = () => {
    if (drawRef.current) {
      drawRef.current.deleteAll();
    }
    setPolygonGeometry(null);
    setIsDrawing(false);
  };

  // Calculate area
  const polygonArea = polygonGeometry
    ? turf.area(turf.polygon(polygonGeometry.coordinates))
    : null;

  const onSubmit = async (data: ZoneFormValues) => {
    if (data.activeTab === "zone") {
      await handleZoneSubmit(data);
    } else {
      await handleParcelSubmit(data);
    }
  };

  // Submit handler for Zone
  const handleZoneSubmit = async (data: ZoneFormValues) => {
    if (!data.polygonGeometry) return;

    // Check for overlapping zones
    const newPolygon = turf.polygon(data.polygonGeometry.coordinates);
    const overlappingZones = zones.filter((z) => {
      if (!z.geometry?.coordinates) return false;
      try {
        const existingPolygon = turf.polygon(
          z.geometry.coordinates as number[][][],
        );
        return turf.booleanIntersects(newPolygon, existingPolygon);
      } catch {
        return false;
      }
    });

    if (overlappingZones.length > 0) {
      const names = overlappingZones.map((z) => z.name).join(", ");
      toast.error(`โซนที่วาดทับซ้อนกับโซนที่มีอยู่: ${names}`);
      return;
    }

    setIsLoading(true);

    try {
      const zone = await ZoneService.create({
        name: data.name?.trim() || "",
        description: data.description?.trim() || undefined,
        // type removed
        color: data.color || ZONE_COLORS[0].value,
        isActive: true,
        geometry: {
          type: "POLYGON",
          coordinates: data.polygonGeometry.coordinates,
        },
      });

      toast.success(`สร้างโซน "${data.name}" สำเร็จ`);
      triggerRefresh();
      onSuccess?.(zone);
      onClose();
    } catch (error) {
      console.error("Failed to create zone:", error);
      toast.error("เกิดข้อผิดพลาดในการสร้างโซน");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit handler for Parcel
  const handleParcelSubmit = async (data: ZoneFormValues) => {
    if (!data.polygonGeometry) return;

    setIsParcelLoading(true);

    try {
      const parcelTypeEn = data.parcelType || ParcelType.RESIDENTIAL;
      const parcel = await ParcelService.create({
        name: data.parcelName?.trim() || "",
        address: data.parcelAddress?.trim() || undefined,
        description: data.parcelDescription?.trim() || undefined,
        type: parcelTypeEn,
        status: ParcelStatus.ACTIVE,
        ownerName: data.parcelOwnerName?.trim() || undefined,
        ownerPhone: data.parcelOwnerPhone?.trim() || undefined,
        landTitle: data.parcelLandTitle?.trim() || undefined,
        areaSize: polygonArea || undefined,
        strokeStyle: "dashed",
        strokeColor: PARCEL_TYPE_CONFIG[parcelTypeEn]?.color || "#6B7280",
        fillColor: PARCEL_TYPE_CONFIG[parcelTypeEn]?.color || "#6B7280",
        fillOpacity: 0.15,
        zoneId: data.selectedZoneId!,
        geometry: {
          type: "POLYGON",
          coordinates: data.polygonGeometry.coordinates,
        },
      });

      toast.success(`สร้างแปลง "${data.parcelName}" สำเร็จ`);
      triggerRefresh();
      onSuccess?.(parcel);
      onClose();
    } catch (error) {
      console.error("Failed to create parcel:", error);
      toast.error("เกิดข้อผิดพลาดในการสร้างแปลง");
    } finally {
      setIsParcelLoading(false);
    }
  };

  // Selected zone for display on map
  const selectedZone = zones.find((z) => z.id === selectedZoneId);

  return (
    <Card className="w-[900px] h-[600px] p-3 grid grid-cols-12 grid-rows-[1fr_auto] gap-4 shadow-2xl border-0 rounded-xl">
      {/* Left Side: Form */}
      <div className="col-span-5 flex flex-col bg-white p-0 overflow-y-auto">
        <CardHeader className="border-b border-gray-200 space-y-2 p-0 pb-3">
          <CardTitle className="text-xl font-bold">สร้างพื้นที่ใหม่</CardTitle>
          <Tabs
            value={activeTab}
            onValueChange={(v) =>
              setValue("activeTab", v as "zone" | "parcel", {
                shouldValidate: true,
              })
            }
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="zone" className="text-sm">
                <MapIcon className="w-4 h-4 mr-1" />
                โซนหลัก
              </TabsTrigger>
              <TabsTrigger value="parcel" className="text-sm">
                <Home className="w-4 h-4 mr-1" />
                แปลง (Parcel)
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="space-y-4 p-0 px-1 pt-4 flex-1 overflow-y-auto">
          {/* ======================== */}
          {/* ZONE TAB CONTENT */}
          {/* ======================== */}
          {activeTab === "zone" && (
            <>
              {/* Zone Name */}
              <Field className="space-y-1.5">
                <FieldLabel htmlFor="zone-name" className="text-sm font-medium">
                  ชื่อโซน <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="zone-name"
                  placeholder="เช่น Water Treatment Zone A"
                  value={name}
                  onChange={(e) =>
                    setValue("name", e.target.value, { shouldValidate: true })
                  }
                  className="bg-gray-50"
                />
                <FieldError errors={[errors.name as any]} />
              </Field>

              {/* Color Picker */}
              <Field className="space-y-1.5">
                <FieldLabel className="text-sm font-medium flex items-center gap-1">
                  <Palette className="w-4 h-4" /> สีโซน
                </FieldLabel>
                <div className="flex gap-2 flex-wrap">
                  {ZONE_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() =>
                        setValue("color", c.value, { shouldValidate: true })
                      }
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        color === c.value
                          ? "border-gray-800 scale-110"
                          : "border-gray-200"
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
                <FieldError errors={[errors.color as any]} />
              </Field>

              {/* Description */}
              <Field className="space-y-1.5">
                <FieldLabel htmlFor="zone-desc" className="text-sm font-medium">
                  คำอธิบาย
                </FieldLabel>
                <textarea
                  id="zone-desc"
                  placeholder="คำอธิบายเพิ่มเติม (ถ้ามี)"
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setValue("description", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <FieldError errors={[errors.description as any]} />
              </Field>

              {/* Input Mode Toggle */}
              <div className="space-y-1.5">
                <FieldError errors={[errors.polygonGeometry as any]} />
                <Label className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> วิธีกำหนดพื้นที่{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setInputMode("draw")}
                    className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-all ${
                      inputMode === "draw"
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    ✏️ วาดบนแผนที่
                  </button>
                  <button
                    onClick={() => setInputMode("manual")}
                    className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-all ${
                      inputMode === "manual"
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    📍 กรอกพิกัดเอง
                  </button>
                </div>
              </div>

              {/* Manual Coordinate Input */}
              {(inputMode === "manual" || polygonGeometry) && (
                <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Label className="text-sm font-medium text-blue-700">
                    {polygonGeometry
                      ? "พิกัดจุดมุม Polygon (แก้ไขได้)"
                      : "พิกัดจุดมุม Polygon (ต้องมีอย่างน้อย 3 จุด)"}
                  </Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {manualCoords.map((coord, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-6">
                          {idx + 1}.
                        </span>
                        <Input
                          placeholder="Lat (เช่น 13.736717)"
                          value={coord.lat}
                          onChange={(e) => {
                            const newCoords = [...manualCoords];
                            newCoords[idx].lat = e.target.value;
                            setManualCoords(newCoords);
                          }}
                          className="flex-1 h-8 text-xs bg-white"
                        />
                        <Input
                          placeholder="Lng (เช่น 100.523186)"
                          value={coord.lng}
                          onChange={(e) => {
                            const newCoords = [...manualCoords];
                            newCoords[idx].lng = e.target.value;
                            setManualCoords(newCoords);
                          }}
                          className="flex-1 h-8 text-xs bg-white"
                        />
                        {manualCoords.length > 3 && (
                          <button
                            onClick={() => {
                              setManualCoords(
                                manualCoords.filter((_, i) => i !== idx),
                              );
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setManualCoords([...manualCoords, { lat: "", lng: "" }])
                      }
                      className="text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" /> เพิ่มจุด
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        const validCoords = manualCoords
                          .filter((c) => c.lat && c.lng)
                          .map((c) => [parseFloat(c.lng), parseFloat(c.lat)]);

                        if (validCoords.length >= 3) {
                          const closedCoords = [...validCoords, validCoords[0]];
                          setPolygonGeometry({
                            type: "Polygon",
                            coordinates: [closedCoords],
                          });

                          const avgLat =
                            validCoords.reduce((sum, c) => sum + c[1], 0) /
                            validCoords.length;
                          const avgLng =
                            validCoords.reduce((sum, c) => sum + c[0], 0) /
                            validCoords.length;
                          setViewState((prev) => ({
                            ...prev,
                            latitude: avgLat,
                            longitude: avgLng,
                            zoom: 17,
                          }));

                          toast.success(
                            `${polygonGeometry ? "อัปเดต" : "สร้าง"} Polygon จาก ${validCoords.length} จุดแล้ว`,
                          );
                        } else {
                          toast.error("ต้องมีอย่างน้อย 3 จุดที่มีค่าพิกัดครบ");
                        }
                      }}
                      className="text-xs bg-blue-600 hover:bg-blue-700"
                    >
                      ✓ {polygonGeometry ? "อัปเดต" : "สร้าง"} Polygon
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ======================== */}
          {/* PARCEL TAB CONTENT */}
          {/* ======================== */}
          {activeTab === "parcel" && (
            <>
              {/* Parent Zone Selection */}
              <Field className="space-y-1.5">
                <FieldLabel className="text-sm font-medium">
                  เลือกโซนหลัก <span className="text-red-500">*</span>
                </FieldLabel>
                <Select
                  value={selectedZoneId}
                  onValueChange={(v) =>
                    setValue("selectedZoneId", v, { shouldValidate: true })
                  }
                  disabled={isLoadingZones}
                >
                  <SelectTrigger className="bg-gray-50">
                    <SelectValue
                      placeholder={
                        isLoadingZones ? "กำลังโหลด..." : "เลือกโซน..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: zone.color || "#3B82F6" }}
                          />
                          {zone.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.selectedZoneId as any]} />
              </Field>

              {/* Parcel Name */}
              <Field className="space-y-1.5">
                <FieldLabel
                  htmlFor="parcel-name"
                  className="text-sm font-medium"
                >
                  ชื่อ/บ้านเลขที่ <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="parcel-name"
                  placeholder="เช่น บ้านเลขที่ 123/45"
                  value={parcelName}
                  onChange={(e) =>
                    setValue("parcelName", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                  className="bg-gray-50"
                />
                <FieldError errors={[errors.parcelName as any]} />
              </Field>

              {/* Parcel Type */}
              <Field className="space-y-1.5">
                <FieldLabel className="text-sm font-medium">
                  ประเภทแปลง
                </FieldLabel>
                <Select
                  value={parcelType}
                  onValueChange={(v) =>
                    setValue("parcelType", v as ParcelType, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger className="bg-gray-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PARCEL_TYPE_CONFIG).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon
                              className="w-4 h-4"
                              style={{ color: config.color }}
                            />
                            {config.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.parcelType as any]} />
              </Field>

              {/* Owner Info */}
              <div className="grid grid-cols-2 gap-2">
                <Field className="space-y-1">
                  <FieldLabel className="text-xs font-medium">
                    ชื่อเจ้าของ
                  </FieldLabel>
                  <Input
                    placeholder="ชื่อ-นามสกุล"
                    value={parcelOwnerName}
                    onChange={(e) =>
                      setValue("parcelOwnerName", e.target.value, {
                        shouldValidate: true,
                      })
                    }
                    className="bg-gray-50 text-sm h-9"
                  />
                  <FieldError errors={[errors.parcelOwnerName as any]} />
                </Field>
                <Field className="space-y-1">
                  <FieldLabel className="text-xs font-medium">
                    เบอร์โทร
                  </FieldLabel>
                  <Input
                    placeholder="08x-xxx-xxxx"
                    value={parcelOwnerPhone}
                    onChange={(e) =>
                      setValue("parcelOwnerPhone", e.target.value, {
                        shouldValidate: true,
                      })
                    }
                    className="bg-gray-50 text-sm h-9"
                  />
                  <FieldError errors={[errors.parcelOwnerPhone as any]} />
                </Field>
              </div>

              {/* Land Title */}
              <Field className="space-y-1.5">
                <FieldLabel className="text-sm font-medium">เลขโฉนด</FieldLabel>
                <Input
                  placeholder="เลขที่โฉนดที่ดิน"
                  value={parcelLandTitle}
                  onChange={(e) =>
                    setValue("parcelLandTitle", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                  className="bg-gray-50"
                />
                <FieldError errors={[errors.parcelLandTitle as any]} />
              </Field>

              {/* Address */}
              <Field className="space-y-1.5">
                <FieldLabel className="text-sm font-medium">ที่อยู่</FieldLabel>
                <textarea
                  placeholder="ที่อยู่เต็ม (ถ้ามี)"
                  value={parcelAddress}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setValue("parcelAddress", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm resize-none h-14 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FieldError errors={[errors.parcelAddress as any]} />
              </Field>
            </>
          )}

          {/* Area Info (shared) */}
          {polygonArea && (
            <div
              className={`p-3 rounded-lg border ${
                activeTab === "zone"
                  ? "bg-green-50 border-green-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <p
                className={`text-xs font-medium ${
                  activeTab === "zone" ? "text-green-600" : "text-blue-600"
                }`}
              >
                พื้นที่{activeTab === "zone" ? "โซน" : "แปลง"}
              </p>
              <p
                className={`text-lg font-bold ${
                  activeTab === "zone" ? "text-green-700" : "text-blue-700"
                }`}
              >
                {polygonArea >= 1000000
                  ? `${(polygonArea / 1000000).toFixed(2)} ตร.กม.`
                  : polygonArea >= 10000
                    ? `${(polygonArea / 10000).toFixed(2)} ไร่`
                    : `${polygonArea.toFixed(0)} ตร.ม.`}
              </p>
            </div>
          )}
        </CardContent>
      </div>

      {/* Right Side: Map */}
      <div className="col-span-7 relative bg-gray-100 rounded-lg overflow-hidden h-full">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
          onLoad={handleMapLoad}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          attributionControl={false}
          cursor={isDrawing ? "crosshair" : "default"}
          doubleClickZoom={false}
          dragRotate={false}
        >
          {/* Show existing zones when in zone mode */}
          {activeTab === "zone" && zones.length > 0 && (
            <Source
              id="existing-zones"
              type="geojson"
              data={{
                type: "FeatureCollection",
                features: zones
                  .filter((z) => z.geometry?.coordinates)
                  .map((z) => ({
                    type: "Feature" as const,
                    properties: { id: z.id, name: z.name, color: z.color },
                    geometry: {
                      type: "Polygon" as const,
                      coordinates: z.geometry!.coordinates,
                    },
                  })),
              }}
            >
              <Layer
                id="existing-zones-fill"
                type="fill"
                paint={{
                  "fill-color": ["get", "color"],
                  "fill-opacity": 0.2,
                }}
              />
              <Layer
                id="existing-zones-line"
                type="line"
                paint={{
                  "line-color": ["get", "color"],
                  "line-width": 2,
                  "line-dasharray": [2, 2],
                }}
              />
            </Source>
          )}
          {/* Show selected zone boundary when in parcel mode */}
          {activeTab === "parcel" && selectedZone?.geometry && (
            <Source
              id="parent-zone"
              type="geojson"
              data={{
                type: "Feature",
                properties: {},
                geometry: {
                  type: "Polygon",
                  coordinates: selectedZone.geometry.coordinates,
                },
              }}
            >
              <Layer
                id="parent-zone-fill"
                type="fill"
                paint={{
                  "fill-color": selectedZone.color || "#3B82F6",
                  "fill-opacity": 0.1,
                }}
              />
              <Layer
                id="parent-zone-line"
                type="line"
                paint={{
                  "line-color": selectedZone.color || "#3B82F6",
                  "line-width": 3,
                }}
              />
            </Source>
          )}

          {/* Show existing parcels in parcel mode */}
          {activeTab === "parcel" && existingParcels.length > 0 && (
            <Source
              id="existing-parcels"
              type="geojson"
              data={{
                type: "FeatureCollection",
                features: existingParcels
                  .filter((p) => p.geometry?.coordinates)
                  .map((p) => ({
                    type: "Feature" as const,
                    properties: {
                      name: p.name,
                      color: p.strokeColor || p.fillColor || "#6B7280",
                    },
                    geometry: {
                      type: "Polygon" as const,
                      coordinates: p.geometry!.coordinates,
                    },
                  })),
              }}
            >
              <Layer
                id="existing-parcel-fills"
                type="fill"
                paint={{
                  "fill-color": "#ffffff",
                  "fill-opacity": 0.15,
                }}
              />
              <Layer
                id="existing-parcel-lines-glow"
                type="line"
                paint={{
                  "line-color": "#ffffff",
                  "line-width": 3,
                  "line-opacity": 0.8,
                }}
              />
              <Layer
                id="existing-parcel-lines"
                type="line"
                paint={{
                  "line-color": "#1e293b",
                  "line-width": 1.5,
                  "line-dasharray": [5, 3],
                }}
              />
              <Layer
                id="existing-parcel-labels"
                type="symbol"
                layout={{
                  "text-field": ["get", "name"],
                  "text-size": 11,
                  "text-anchor": "center",
                  "text-allow-overlap": false,
                }}
                paint={{
                  "text-color": "#ffffff",
                  "text-halo-color": "#000000",
                  "text-halo-width": 1.5,
                }}
              />
            </Source>
          )}
        </Map>

        {/* Draw Controls */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <Button
            size="sm"
            onClick={startDrawingPolygon}
            className={`shadow-md text-white ${
              activeTab === "zone"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={isDrawing || (activeTab === "parcel" && !selectedZoneId)}
          >
            <Pencil className="w-4 h-4 mr-1" />
            {polygonGeometry ? "วาดใหม่" : "วาดพื้นที่"}
          </Button>
          {polygonGeometry && (
            <Button
              size="sm"
              variant="destructive"
              onClick={clearPolygon}
              className="shadow-md"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              ล้าง
            </Button>
          )}
          {isDrawing && (
            <div className="bg-yellow-100 text-yellow-800 text-xs p-2 rounded-lg shadow-md max-w-[160px]">
              คลิกเพื่อวาด • ดับเบิ้ลคลิกเพื่อเสร็จ
            </div>
          )}
          {activeTab === "parcel" && !selectedZoneId && (
            <div className="bg-orange-100 text-orange-700 text-xs p-2 rounded-lg shadow-md max-w-[160px]">
              ⚠️ กรุณาเลือกโซนหลักก่อน
            </div>
          )}
        </div>

        {/* Parcel mode indicator */}
        {activeTab === "parcel" && (
          <div className="absolute bottom-4 left-4 z-10 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-full shadow-md">
            📐 โหมดวาดแปลง (เส้นประ)
          </div>
        )}
      </div>

      {/* Footer */}
      <CardFooter className="col-span-12 flex justify-end gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onClose}
          className="rounded-full px-8 border-gray-300"
          type="button"
          disabled={isLoading || isParcelLoading}
        >
          ยกเลิก
        </Button>
        <Button
          className={`rounded-full px-8 text-white ${
            activeTab === "zone"
              ? "bg-green-700 hover:bg-green-800"
              : "bg-blue-700 hover:bg-blue-800"
          }`}
          onClick={hookFormSubmit(onSubmit)}
          disabled={activeTab === "zone" ? isLoading : isParcelLoading}
        >
          {(activeTab === "zone" ? isLoading : isParcelLoading) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              กำลังบันทึก...
            </>
          ) : activeTab === "zone" ? (
            "สร้างโซน"
          ) : (
            "สร้างแปลง"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
