import React, { useState, useCallback, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { MapRef, ViewState } from "react-map-gl/mapbox";

import { useMapActions } from "@/stores/useMapStore";
import { useExistingPins } from "@/hooks/useExistingPins";
import { PinType, PinCategory, GeometryType, ApiPin } from "@/types/api";

import { pinFormSchema, PinFormValues } from "../pin-schema";
import { PinFormSidebar } from "./PinFormSidebar";
import { PinFormMapPreview } from "./PinFormMapPreview";
import { useCascadingLocation } from "./hooks/useCascadingLocation";
import { usePinCategories } from "./hooks/usePinCategories";
import { useMapDrawControls } from "./hooks/useMapDrawControls";
import { submitPinForm } from "./hooks/submit-pin-form";
import {
  DEVICE_ATTRIBUTE_CONFIG,
  INFO_ATTRIBUTE_CONFIG,
  EMPTY_ATTRIBUTES,
} from "./constants";

export interface PinFormCardProps {
  onClose: () => void;
  initialData?: ApiPin; // If provided, acts as Edit mode
  defaultLocation?: { lat: number; lng: number }; // Defaults for Create mode
}

export function PinFormCard({
  onClose,
  initialData,
  defaultLocation,
}: PinFormCardProps) {
  const { triggerRefresh } = useMapActions();
  const isEditMode = !!initialData;

  // Determine initial state based on edit mode
  const initialPinMode = initialData?.type === PinType.INFO ? "info" : "device";
  const [pinMode, setPinMode] = useState<"device" | "info">(initialPinMode);
  const [dataId, setDataId] = useState(initialData?.dataId || "");
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  // GeoJSON parsing
  const initialPoints = (() => {
    if (
      initialData?.geometry?.type === GeometryType.POINT &&
      Array.isArray(initialData.geometry.coordinates)
    ) {
      const coords = initialData.geometry.coordinates as [number, number];
      return [{ id: Date.now(), lng: coords[0], lat: coords[1] }];
    }
    if (!isEditMode && defaultLocation) {
      return [
        { id: Date.now(), lng: defaultLocation.lng, lat: defaultLocation.lat },
      ];
    }
    return [];
  })();

  const initialPolygon = (() => {
    if (
      initialData?.geometry?.type === GeometryType.POLYGON &&
      Array.isArray(initialData.geometry.coordinates)
    ) {
      return {
        type: "Polygon",
        coordinates: initialData.geometry.coordinates as number[][][],
      } as GeoJSON.Polygon;
    }
    return undefined;
  })();

  const initialAttributes = (() => {
    const attrs: Record<string, string> = {};
    if (initialData?.attributes) {
      Object.entries(initialData.attributes).forEach(([key, val]) => {
        attrs[key] = String(val);
      });
    }
    return attrs;
  })();

  // Maps / Viewport
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState<ViewState>({
    latitude: initialData?.geometry?.lat || defaultLocation?.lat || 13.736717,
    longitude: initialData?.geometry?.lng || defaultLocation?.lng || 100.523186,
    zoom: isEditMode || defaultLocation ? 18 : 16,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  // Reference layer pins
  const { existingPinsGeoJson } = useExistingPins(initialData?.id);

  // Hook Form Initialization
  const form = useForm<PinFormValues>({
    resolver: zodResolver(pinFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      locationType:
        initialData?.geometry?.type === GeometryType.POLYGON ? "area" : "pin",
      category: initialData?.category || PinCategory.DEVICE,
      type: initialData?.type || PinType.WATER,
      subtype: initialData?.subtype || "",
      points: initialPoints,
      polygonGeometry: initialPolygon,
      zoneId: initialData?.zoneId || "",
      parcelId: initialData?.parcelId || "",
      floorId: initialData?.floorId || "",
      isPublic: initialData?.isPublic ?? true,
      attributes: initialAttributes,
    },
    mode: "onChange",
  });

  const { watch, setValue, handleSubmit } = form;

  // Local watched state for map props passing
  const locationType = watch("locationType") as "pin" | "area";
  const points = watch("points") || [];
  const polygonGeometry = watch("polygonGeometry");
  const type = watch("type") as PinType;
  const category = watch("category");
  const subtype = watch("subtype") || "";
  const selectedZoneId = watch("zoneId") || "";
  const selectedParcelId = watch("parcelId") || "";

  // Custom Hooks
  const { categories, isLoadingCategories } = usePinCategories(pinMode);
  const {
    zones,
    isLoadingZones,
    parcels,
    isLoadingParcels,
    floors,
    isLoadingFloors,
    loadParcels,
    loadFloors,
    getZoneCenter,
    getParcelCenter,
  } = useCascadingLocation({
    initialZoneId: initialData?.zoneId,
    initialParcelId: initialData?.parcelId,
  });

  const { startDrawingPolygon, clearPolygon } = useMapDrawControls({
    mapRef,
    locationType,
    onPolygonDrawn: (polygon, newPoints) => {
      setValue("polygonGeometry", polygon, { shouldValidate: true });
      setValue("points", newPoints, { shouldValidate: true });
      setIsDrawing(false);
    },
    onPolygonDeleted: () => {
      setValue("polygonGeometry", undefined, { shouldValidate: true });
      setValue("points", [], { shouldValidate: true });
    },
    setIsDrawing,
  });

  // Cascading Selection Handlers
  const handleZoneChange = (zoneId: string) => {
    setValue("zoneId", zoneId, { shouldValidate: true });
    setValue("parcelId", "", { shouldValidate: true });
    setValue("floorId", "", { shouldValidate: true });

    const center = getZoneCenter(zoneId);
    if (center) {
      setViewState((prev) => ({
        ...prev,
        longitude: center[0],
        latitude: center[1],
        zoom: 16,
      }));
      toast.success(`ย้ายไปยังโซนแล้ว`);
    }
    if (zoneId) loadParcels(zoneId);
  };

  const handleParcelChange = (parcelId: string) => {
    setValue("parcelId", parcelId, { shouldValidate: true });
    setValue("floorId", "", { shouldValidate: true });

    const center = getParcelCenter(parcelId);
    if (center) {
      setViewState((prev) => ({
        ...prev,
        longitude: center[0],
        latitude: center[1],
        zoom: 18,
      }));
      toast.success(`ย้ายไปยังแปลงแล้ว`);
    }
    if (parcelId) loadFloors(parcelId);
  };

  // Map Click Handler for Point mode
  const handleMapClick = useCallback(
    (event: any) => {
      if (locationType !== "pin") return;
      const { lng, lat } = event.lngLat;
      const newPoint = { id: Date.now(), lat, lng };
      setValue("points", [newPoint], { shouldValidate: true });
    },
    [locationType, setValue],
  );

  // Point Deletion Fix
  const handleDeletePoint = (id: number) => {
    const updated = points.filter((p: any) => p.id !== id);
    setValue("points", updated, { shouldValidate: true });
  };

  // Sync Form State logic (Effects)
  const isFirstRenderSync = useRef(true);
  useEffect(() => {
    if (isFirstRenderSync.current) {
      isFirstRenderSync.current = false;
      return;
    }

    if (pinMode === "device") {
      if (type === PinType.SOLAR) {
        setValue("category", PinCategory.SOLAR, { shouldValidate: true });
      } else if (type === PinType.MONITORING) {
        setValue("category", PinCategory.MONITORING, { shouldValidate: true });
      } else {
        setValue("category", PinCategory.DEVICE, { shouldValidate: true });
      }
    } else if (
      category === PinCategory.DEVICE ||
      category === PinCategory.SOLAR ||
      category === PinCategory.MONITORING
    ) {
      setValue("category", PinCategory.INFRASTRUCTURE, {
        shouldValidate: true,
      });
    }
  }, [pinMode, type, category, setValue]);

  const prevCategoryRef = useRef(category);
  useEffect(() => {
    // Only clear subtype if the category actually changed from previous render
    // This prevents clearing initialData on first load
    if (prevCategoryRef.current !== category) {
      setValue("subtype", "", { shouldValidate: true });
    }
    prevCategoryRef.current = category;
  }, [category, setValue]);

  // Dynamic Attributes Population
  const currentAttributes =
    pinMode === "device"
      ? DEVICE_ATTRIBUTE_CONFIG[type] || EMPTY_ATTRIBUTES
      : INFO_ATTRIBUTE_CONFIG[category as PinCategory] || EMPTY_ATTRIBUTES;

  const prevTypeRef = useRef(pinMode === "device" ? type : category);
  useEffect(() => {
    const currentTypeOrCategory = pinMode === "device" ? type : category;

    // Only reset attributes if the actual Type or Category changed
    if (prevTypeRef.current !== currentTypeOrCategory) {
      const defaultAttrs: Record<string, string> = {};
      currentAttributes.forEach((attr) => {
        defaultAttrs[attr.key] = attr.defaultValue;
      });
      setValue("attributes", defaultAttrs, { shouldValidate: true });
    }

    prevTypeRef.current = currentTypeOrCategory;
  }, [currentAttributes, setValue, pinMode, type, category]);

  const onSubmit = async (data: PinFormValues) => {
    setIsLoadingSubmit(true);
    try {
      await submitPinForm({
        data,
        pinMode,
        dataId,
        isEditMode,
        editingPinId: initialData?.id,
        points: data.points || [],
        polygonGeometry: data.polygonGeometry,
      });
      toast.success(isEditMode ? "แก้ไขหมุดสำเร็จ" : "สร้างหมุดสำเร็จ");
      triggerRefresh();
      onClose();
    } catch (error) {
      console.error("Failed to save pin:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึกหมุด");
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  return (
    <Card className="w-[900px] h-[600px] p-3 grid grid-cols-12 grid-rows-[1fr_auto] gap-4 shadow-2xl border-0 rounded-xl bg-white">
      <PinFormSidebar
        form={form}
        pinMode={pinMode}
        setPinMode={setPinMode}
        dataId={dataId}
        setDataId={setDataId}
        categories={categories}
        isLoadingCategories={isLoadingCategories}
        zones={zones}
        isLoadingZones={isLoadingZones}
        parcels={parcels}
        isLoadingParcels={isLoadingParcels}
        floors={floors}
        isLoadingFloors={isLoadingFloors}
        onZoneChange={handleZoneChange}
        onParcelChange={handleParcelChange}
        onDeletePoint={handleDeletePoint}
        onSubmit={handleSubmit(onSubmit)}
        isLoadingSubmit={isLoadingSubmit}
        isEditMode={isEditMode}
        currentAttributes={currentAttributes}
      />

      <PinFormMapPreview
        mapRef={mapRef}
        viewState={viewState}
        setViewState={setViewState}
        zones={zones}
        parcels={parcels}
        selectedZoneId={selectedZoneId}
        selectedParcelId={selectedParcelId}
        existingPinsGeoJson={existingPinsGeoJson}
        locationType={locationType}
        points={points}
        polygonGeometry={polygonGeometry}
        type={type}
        category={category}
        subtype={subtype}
        pinMode={pinMode}
        onMapClick={handleMapClick}
        triggerRefresh={triggerRefresh}
      />
      <CardFooter className="col-span-12 flex justify-end gap-3 p-0 pt-2">
        <Button
          variant="outline"
          onClick={onClose}
          className="rounded-full px-8 border-gray-300 text-gray-600 hover:bg-gray-50"
          disabled={isLoadingSubmit}
        >
          ยกเลิก
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isLoadingSubmit}
          className="rounded-full px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
        >
          {isLoadingSubmit ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isEditMode ? "บันทึกการแก้ไข" : "สร้างหมุด"}
        </Button>
      </CardFooter>
    </Card>
  );
}
