"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Pencil, Trash2, Loader2, Palette, X } from "lucide-react";
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
import Map, { ViewStateChangeEvent, MapRef } from "react-map-gl/mapbox";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { ZoneService, ZoneType, ApiZone } from "@/services/zone.service";
import { toast } from "sonner";
import * as turf from "@turf/turf";
import { useMapActions } from "@/stores/useMapStore";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const zoneEditFormSchema = z
  .object({
    name: z.string().min(1, "กรุณาระบุชื่อโซน").trim(),
    description: z.string().optional(),
    zoneType: z.nativeEnum(ZoneType).optional(),
    color: z.string().optional(),
    polygonGeometry: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.polygonGeometry) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "กรุณาวาดพื้นที่โซนบนแผนที่",
        path: ["polygonGeometry"],
      });
    }
  });

export type ZoneEditFormValues = z.infer<typeof zoneEditFormSchema>;

// Preset colors for zone selection
const ZONE_COLORS = [
  { name: "น้ำเงิน", value: "#3B82F6" },
  { name: "เขียว", value: "#22C55E" },
  { name: "แดง", value: "#EF4444" },
  { name: "ส้ม", value: "#F97316" },
  { name: "ม่วง", value: "#8B5CF6" },
  { name: "ฟ้า", value: "#06B6D4" },
];

interface ZoneEditCardProps {
  zone: ApiZone;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ZoneEditCard({ zone, onClose, onSuccess }: ZoneEditCardProps) {
  const { triggerRefresh } = useMapActions();

  // Form setup
  const form = useForm<ZoneEditFormValues>({
    resolver: zodResolver(zoneEditFormSchema),
    defaultValues: {
      name: zone.name,
      description: zone.description || "",
      zoneType: zone.type || ZoneType.WATER_ZONE,
      color: zone.color || ZONE_COLORS[0].value,
      polygonGeometry: zone.geometry?.coordinates
        ? { type: "Polygon", coordinates: zone.geometry.coordinates }
        : undefined,
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
  const description = watch("description") || "";
  const zoneType = watch("zoneType") || ZoneType.WATER_ZONE;
  const color = watch("color") || ZONE_COLORS[0].value;
  const polygonGeometry = watch("polygonGeometry");

  const setPolygonGeometry = useCallback(
    (geom: GeoJSON.Polygon | null) => {
      setValue("polygonGeometry", geom, { shouldValidate: true });
    },
    [setValue],
  );

  const [isLoading, setIsLoading] = useState(false);

  // Map state - center on zone if geometry exists
  const initialCenter = zone.geometry?.coordinates?.[0]?.[0]
    ? {
        longitude: zone.geometry.coordinates[0][0][0],
        latitude: zone.geometry.coordinates[0][0][1],
      }
    : { latitude: 13.736717, longitude: 100.523186 };

  const [viewState, setViewState] = useState({
    ...initialCenter,
    zoom: 16,
  });

  const [isDrawing, setIsDrawing] = useState(false);

  // Refs
  const mapRef = useRef<MapRef>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Draw styles with dynamic color
  const getDrawStyles = useCallback(
    (fillColor: string) => [
      {
        id: "gl-draw-polygon-fill",
        type: "fill",
        filter: ["all", ["==", "$type", "Polygon"]],
        paint: { "fill-color": fillColor, "fill-opacity": 0.25 },
      },
      {
        id: "gl-draw-polygon-stroke",
        type: "line",
        filter: ["all", ["==", "$type", "Polygon"]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": fillColor, "line-width": 3 },
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
          "circle-radius": 6,
          "circle-color": "#fff",
          "circle-stroke-color": fillColor,
          "circle-stroke-width": 2,
        },
      },
      {
        id: "gl-draw-midpoint",
        type: "circle",
        filter: ["all", ["==", "meta", "midpoint"]],
        paint: { "circle-radius": 4, "circle-color": fillColor },
      },
    ],
    [],
  );

  // Initialize MapboxDraw when map loads and load existing polygon
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
        styles: getDrawStyles(color),
        clickBuffer: 10,
        touchBuffer: 20,
      });

      map.addControl(draw as unknown as mapboxgl.IControl);
      drawRef.current = draw;
      setIsMapReady(true);

      // Load existing polygon into draw
      if (zone.geometry?.coordinates) {
        const feature: GeoJSON.Feature<GeoJSON.Polygon> = {
          id: "existing-zone",
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: zone.geometry.coordinates,
          },
        };
        draw.add(feature);

        // Fit map to polygon bounds
        try {
          const bbox = turf.bbox(feature);
          map.fitBounds(
            [
              [bbox[0], bbox[1]],
              [bbox[2], bbox[3]],
            ],
            { padding: 50, duration: 0 },
          );
        } catch (e) {
          console.error("Error fitting bounds:", e);
        }
      }

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
    } catch (err) {
      console.error("Error initializing MapboxDraw:", err);
    }
  }, [color, getDrawStyles, zone.geometry]);

  // Start drawing new polygon
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

  // Submit handler - update zone
  const onSubmit = async (data: ZoneEditFormValues) => {
    if (!data.polygonGeometry) return;

    setIsLoading(true);

    try {
      await ZoneService.update(zone.id, {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        type: data.zoneType || ZoneType.WATER_ZONE,
        color: data.color || ZONE_COLORS[0].value,
        geometry: {
          type: "POLYGON",
          coordinates: data.polygonGeometry.coordinates,
        },
      });

      toast.success(`อัปเดตโซน "${data.name}" สำเร็จ`);

      // Trigger refresh on main map
      triggerRefresh();

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to update zone:", error);
      toast.error("เกิดข้อผิดพลาดในการอัปเดตโซน");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[1200px] min-w-[1200px] h-[700px] p-3 grid grid-cols-12 grid-rows-[1fr_auto] gap-4 shadow-2xl border-0 rounded-xl">
      {/* Left Side: Form */}
      <div className="col-span-5 flex flex-col bg-white p-0 overflow-y-auto">
        <CardHeader className="border-b border-gray-200 space-y-1 p-0 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">แก้ไขโซน</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            แก้ไขข้อมูลและรูปร่างโซนบนแผนที่
          </p>
        </CardHeader>

        <CardContent className="space-y-4 p-0 px-1 pt-4">
          {/* Zone Name */}
          <Field className="space-y-2">
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

          {/* Zone Type */}
          <Field className="space-y-2">
            <FieldLabel className="text-sm font-medium">
              ประเภทโซน <span className="text-red-500">*</span>
            </FieldLabel>
            <Select
              value={zoneType}
              onValueChange={(v) =>
                setValue("zoneType", v as ZoneType, { shouldValidate: true })
              }
            >
              <SelectTrigger className="bg-gray-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ZoneType.WATER_ZONE}>
                  💧 โซนระบบน้ำ
                </SelectItem>
                <SelectItem value={ZoneType.FIRE_ZONE}>🔥 โซนระบบไฟ</SelectItem>
                <SelectItem value={ZoneType.CAMERA_ZONE}>
                  📹 โซนกล้อง
                </SelectItem>
              </SelectContent>
            </Select>
            <FieldError errors={[errors.zoneType as any]} />
          </Field>

          {/* Color Picker */}
          <Field className="space-y-2">
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
          <Field className="space-y-2">
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
              className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <FieldError errors={[errors.description as any]} />
          </Field>

          {/* Area Info */}
          {polygonArea && (
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-600 font-medium">พื้นที่โซน</p>
              <p className="text-lg font-bold text-purple-700">
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
        />

        {/* Draw Controls */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <Button
            size="sm"
            onClick={startDrawingPolygon}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md"
            disabled={isDrawing}
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
          {!isDrawing && polygonGeometry && (
            <div className="bg-purple-100 text-purple-800 text-xs p-2 rounded-lg shadow-md max-w-[180px]">
              ลากจุดเพื่อแก้ไขรูปร่าง
            </div>
          )}
          <FieldError errors={[errors.polygonGeometry as any]} />
        </div>
      </div>

      {/* Footer */}
      <CardFooter className="col-span-12 flex justify-end gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onClose}
          className="rounded-full px-8 border-gray-300"
          disabled={isLoading}
        >
          ยกเลิก
        </Button>
        <Button
          type="button"
          className="rounded-full px-8 bg-purple-700 hover:bg-purple-800 text-white"
          onClick={() =>
            hookFormSubmit((data) => onSubmit(data as ZoneEditFormValues))()
          }
          disabled={isLoading || !polygonGeometry}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            "บันทึกการแก้ไข"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
