import { GeometryType, PinCategory, PinType, UpdatePinDto } from "@/types/api";
import { PinFormValues } from "../../pin-schema";
import { PinService } from "@/services/pin.service";
import * as turf from "@turf/turf";

interface SubmitProps {
  data: PinFormValues;
  pinMode: "device" | "info";
  dataId: string;
  isEditMode: boolean;
  editingPinId?: string;
  points: { id: number; lat: number; lng: number }[];
  polygonGeometry?: GeoJSON.Polygon;
}

export async function submitPinForm({
  data,
  pinMode,
  dataId,
  isEditMode,
  editingPinId,
  points,
  polygonGeometry,
}: SubmitProps) {
  let geometry;

  if (data.locationType === "pin") {
    geometry = {
      type: GeometryType.POINT,
      coordinates: [points[0].lng, points[0].lat],
      lat: points[0].lat,
      lng: points[0].lng,
    };
  } else {
    // Area mode - use polygon geometry
    if (!polygonGeometry) throw new Error("Polygon geometry missing");
    const centroid = turf.centroid(turf.polygon(polygonGeometry.coordinates));
    geometry = {
      type: GeometryType.POLYGON,
      coordinates: polygonGeometry.coordinates,
      lat: centroid.geometry.coordinates[1],
      lng: centroid.geometry.coordinates[0],
    };
  }

  // Determine type and subtype based on mode
  const finalType = pinMode === "device" ? data.type : PinType.INFO;
  const finalSubtype =
    pinMode === "info" && data.subtype ? data.subtype : undefined;

  const payload: any = {
    title: data.title,
    dataId: dataId || undefined,
    type: finalType === PinType.MONITORING ? PinType.INFO : finalType,
    subtype: finalType === PinType.MONITORING ? "MONITORING" : finalSubtype,
    category:
      data.category === PinCategory.MONITORING
        ? PinCategory.DEVICE
        : data.category,
    isPublic: data.isPublic,
    geometry,
    attributes: data.attributes,
    zoneId: data.zoneId || undefined,
    parcelId: data.parcelId || undefined, // Including optionals that were omitted previously if needed
    floorId: data.floorId || undefined,
  };

  if (isEditMode && editingPinId) {
    await PinService.update(editingPinId, payload as UpdatePinDto);
  } else {
    await PinService.create(payload);
  }
}
