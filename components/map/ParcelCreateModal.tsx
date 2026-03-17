"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  X,
  Pencil,
  Trash2,
  Loader2,
  Home,
  Store,
  Factory,
  Landmark,
  Trees,
  Building2,
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
import Map, {
  ViewStateChangeEvent,
  MapRef,
  Source,
  Layer,
} from "react-map-gl/mapbox";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { ApiZone } from "@/services/zone.service";
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

const parcelCreateFormSchema = z
  .object({
    name: z.string().min(1, "กรุณาระบุชื่อ/บ้านเลขที่").trim(),
    address: z.string().optional(),
    parcelType: z.nativeEnum(ParcelType).optional(),
    ownerName: z.string().optional(),
    ownerPhone: z.string().optional(),
    landTitle: z.string().optional(),
    polygonGeometry: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.polygonGeometry) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "กรุณาวาดขอบเขตแปลงบนแผนที่",
        path: ["polygonGeometry"],
      });
    }
  });

export type ParcelCreateFormValues = z.infer<typeof parcelCreateFormSchema>;

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

interface ParcelCreateModalProps {
  zoneId: string;
  zones: ApiZone[];
  onClose: () => void;
  onSuccess?: (parcel: any) => void;
}

export function ParcelCreateModal({
  zoneId,
  zones,
  onClose,
  onSuccess,
}: ParcelCreateModalProps) {
  const { triggerRefresh } = useMapActions();

  // Form setup
  const form = useForm<ParcelCreateFormValues>({
    resolver: zodResolver(parcelCreateFormSchema),
    defaultValues: {
      name: "",
      address: "",
      parcelType: ParcelType.RESIDENTIAL,
      ownerName: "",
      ownerPhone: "",
      landTitle: "",
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

  const name = watch("name") || "";
  const address = watch("address") || "";
  const parcelType = watch("parcelType") || ParcelType.RESIDENTIAL;
  const ownerName = watch("ownerName") || "";
  const ownerPhone = watch("ownerPhone") || "";
  const landTitle = watch("landTitle") || "";
  const polygonGeometry = watch("polygonGeometry");

  const setPolygonGeometry = useCallback(
    (geom: GeoJSON.Polygon | null) => {
      setValue("polygonGeometry", geom, { shouldValidate: true });
    },
    [setValue],
  );

  const [isLoading, setIsLoading] = useState(false);

  // Map state
  const [viewState, setViewState] = useState({
    latitude: 13.736717,
    longitude: 100.523186,
    zoom: 17,
  });
  const [isDrawing, setIsDrawing] = useState(false);

  // Refs
  const mapRef = useRef<MapRef>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Existing parcels in this zone
  const [existingParcels, setExistingParcels] = useState<ApiParcel[]>([]);

  // Get zone info
  const zone = zones.find((z) => z.id === zoneId);
  const currentColor = PARCEL_TYPE_CONFIG[parcelType]?.color || "#6B7280";

  // Pan to zone center on mount
  useEffect(() => {
    if (zone?.geometry?.coordinates) {
      try {
        const polygon = turf.polygon(zone.geometry.coordinates as number[][][]);
        const centroid = turf.centroid(polygon);
        const [lng, lat] = centroid.geometry.coordinates;
        setViewState((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          zoom: 18,
        }));
      } catch (error) {
        console.error("Failed to calculate zone center:", error);
      }
    }
  }, [zone]);

  // Fetch existing parcels for this zone
  useEffect(() => {
    if (!zoneId) return;
    const fetchParcels = async () => {
      try {
        const data = await ParcelService.getByZone(zoneId);
        setExistingParcels(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch existing parcels:", error);
      }
    };
    fetchParcels();
  }, [zoneId]);

  // Draw styles
  const getDrawStyles = useCallback(
    (fillColor: string) => [
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
          "line-dasharray": [6, 4],
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

  // Initialize MapboxDraw
  const handleMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    // Prevent double initialization
    if (drawRef.current) return;

    try {
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          trash: false,
        },
        defaultMode: "simple_select",
        styles: getDrawStyles(currentColor),
        clickBuffer: 10,
        touchBuffer: 20,
      });

      map.addControl(draw as unknown as mapboxgl.IControl);
      drawRef.current = draw;
      setIsMapReady(true);

      map.on("draw.create", (e: { features: GeoJSON.Feature[] }) => {
        if (e.features.length > 0) {
          const feature = e.features[0];
          if (feature.geometry.type === "Polygon") {
            setPolygonGeometry(feature.geometry as GeoJSON.Polygon);
            setIsDrawing(false);
            // Switch back to simple_select mode after drawing is done
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
    } catch (err) {
      console.error("Error initializing MapboxDraw:", err);
    }
  }, [currentColor, getDrawStyles]);

  // Start drawing
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

  // Submit handler
  const onSubmit = async (data: ParcelCreateFormValues) => {
    if (!data.polygonGeometry) return;

    setIsLoading(true);

    try {
      const parcelTypeEn = data.parcelType || ParcelType.RESIDENTIAL;
      const parcel = await ParcelService.create({
        name: data.name.trim(),
        address: data.address?.trim() || undefined,
        type: parcelTypeEn,
        status: ParcelStatus.ACTIVE,
        ownerName: data.ownerName?.trim() || undefined,
        ownerPhone: data.ownerPhone?.trim() || undefined,
        landTitle: data.landTitle?.trim() || undefined,
        areaSize: polygonArea || undefined,
        strokeStyle: "dashed",
        strokeColor: currentColor,
        fillColor: currentColor,
        fillOpacity: 0.1,
        zoneId,
        geometry: {
          type: "POLYGON",
          coordinates: data.polygonGeometry.coordinates,
        },
      });

      toast.success(`สร้างแปลง "${name}" สำเร็จ`);
      triggerRefresh();
      onSuccess?.(parcel);
      onClose();
    } catch (error) {
      console.error("Failed to create parcel:", error);
      toast.error("เกิดข้อผิดพลาดในการสร้างแปลง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[800px] h-[520px] grid grid-cols-12 grid-rows-[1fr_auto] gap-3 p-4">
        {/* Left Side: Form */}
        <div className="col-span-5 flex flex-col overflow-y-auto pr-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-800">สร้างแปลงใหม่</h2>
              {zone && (
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: zone.color || "#3B82F6" }}
                  />
                  ใน {zone.name}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4 p-0 px-1 pt-4 flex-1">
            {/* Parcel Name */}
            <Field className="space-y-1">
              <FieldLabel className="text-sm font-medium">
                ชื่อ/บ้านเลขที่ <span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                placeholder="เช่น บ้านเลขที่ 123/45"
                value={name}
                onChange={(e) =>
                  setValue("name", e.target.value, { shouldValidate: true })
                }
                className="bg-gray-50 h-9"
              />
              <FieldError errors={[errors.name as any]} />
            </Field>

            {/* Parcel Type */}
            <Field className="space-y-1">
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
                <SelectTrigger className="bg-gray-50 h-9">
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
                  value={ownerName}
                  onChange={(e) =>
                    setValue("ownerName", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                  className="bg-gray-50 text-sm h-8"
                />
                <FieldError errors={[errors.ownerName as any]} />
              </Field>
              <Field className="space-y-1">
                <FieldLabel className="text-xs font-medium">
                  เบอร์โทร
                </FieldLabel>
                <Input
                  placeholder="08x-xxx-xxxx"
                  value={ownerPhone}
                  onChange={(e) =>
                    setValue("ownerPhone", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                  className="bg-gray-50 text-sm h-8"
                />
                <FieldError errors={[errors.ownerPhone as any]} />
              </Field>
            </div>

            {/* Land Title */}
            <Field className="space-y-1">
              <FieldLabel className="text-sm font-medium">เลขโฉนด</FieldLabel>
              <Input
                placeholder="เลขที่โฉนดที่ดิน"
                value={landTitle}
                onChange={(e) =>
                  setValue("landTitle", e.target.value, {
                    shouldValidate: true,
                  })
                }
                className="bg-gray-50 h-9"
              />
              <FieldError errors={[errors.landTitle as any]} />
            </Field>

            {/* Address */}
            <Field className="space-y-1">
              <FieldLabel className="text-sm font-medium">ที่อยู่</FieldLabel>
              <textarea
                placeholder="ที่อยู่เต็ม (ถ้ามี)"
                value={address}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setValue("address", e.target.value, { shouldValidate: true })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm resize-none h-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FieldError errors={[errors.address as any]} />
            </Field>

            {/* Area Info */}
            {polygonArea && (
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-600 font-medium">พื้นที่แปลง</p>
                <p className="text-base font-bold text-blue-700">
                  {polygonArea >= 10000
                    ? `${(polygonArea / 10000).toFixed(2)} ไร่`
                    : `${polygonArea.toFixed(0)} ตร.ม.`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Map */}
        <div className="col-span-7 relative bg-gray-100 rounded-lg overflow-hidden">
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
            doubleClickZoom={false} // Disable double click zoom to allow drawing completion
            dragRotate={false} // Recommend disabling rotation to simplify drawing
          >
            {/* Show parent zone boundary */}
            {zone?.geometry && (
              <Source
                id="parent-zone"
                type="geojson"
                data={{
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "Polygon",
                    coordinates: zone.geometry.coordinates,
                  },
                }}
              >
                <Layer
                  id="parent-zone-fill"
                  type="fill"
                  paint={{
                    "fill-color": zone.color || "#3B82F6",
                    "fill-opacity": 0.1,
                  }}
                />
                <Layer
                  id="parent-zone-line"
                  type="line"
                  paint={{
                    "line-color": zone.color || "#3B82F6",
                    "line-width": 3,
                  }}
                />
              </Source>
            )}

            {/* Show existing parcels in this zone */}
            {existingParcels.length > 0 && (
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
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            <Button
              size="sm"
              onClick={startDrawingPolygon}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md text-xs"
              disabled={isDrawing}
            >
              <Pencil className="w-3 h-3 mr-1" />
              {polygonGeometry ? "วาดใหม่" : "วาดแปลง"}
            </Button>
            {polygonGeometry && (
              <Button
                size="sm"
                variant="destructive"
                onClick={clearPolygon}
                className="shadow-md text-xs"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                ล้าง
              </Button>
            )}
            {isDrawing && (
              <div className="bg-yellow-100 text-yellow-800 text-xs p-2 rounded-lg shadow-md max-w-[140px]">
                คลิกวาด • ดับเบิ้ลคลิกจบ
              </div>
            )}
          </div>

          {/* Mode indicator */}
          <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-2">
            <div className="bg-blue-600/90 text-white text-xs px-3 py-1.5 rounded-full shadow-md max-w-fit">
              📐 วาดแปลง (เส้นประ)
            </div>
            <FieldError errors={[errors.polygonGeometry as any]} />
          </div>
        </div>

        {/* Footer */}
        <div className="col-span-12 flex justify-end gap-3 pt-1">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-full px-6 border-gray-300"
            disabled={isLoading}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            className="rounded-full px-6 bg-blue-700 hover:bg-blue-800 text-white"
            onClick={() =>
              hookFormSubmit((data) =>
                onSubmit(data as ParcelCreateFormValues),
              )()
            }
            disabled={isLoading || !polygonGeometry}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              "สร้างแปลง"
            )}
          </Button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
