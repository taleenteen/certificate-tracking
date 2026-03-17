import React, { useMemo } from "react";
import Map, { Source, Layer, Marker, ViewState } from "react-map-gl/mapbox";
import {
  LocateFixed,
  MapPin,
  Droplets,
  Flame,
  Video,
  Sun,
  Zap,
} from "lucide-react";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { IconWrapper } from "@/components/icons/IconWrapper";
import { PIN_ICON_MAP } from "../pin-icon-map";
import { ExistingPinsLayer } from "../ExistingPinsLayer";
import { ApiZone } from "@/services/zone.service";
import { ApiParcel } from "@/services/parcel.service";
import { GeometryType } from "@/types/api";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface Point {
  id: number;
  lat: number;
  lng: number;
}

interface PinFormMapPreviewProps {
  mapRef: React.RefObject<any>;
  viewState: ViewState;
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>;
  // Layers Data
  zones: ApiZone[];
  parcels: ApiParcel[];
  selectedZoneId?: string;
  selectedParcelId?: string;
  existingPinsGeoJson: any;
  // Current Drawing Data
  locationType: "pin" | "area";
  points: Point[];
  polygonGeometry?: GeoJSON.Polygon;
  // Options
  type: string;
  category: string;
  subtype: string;
  pinMode: "device" | "info";
  // Actions
  onMapClick: (e: any) => void;
  triggerRefresh: () => void;
}

export function PinFormMapPreview({
  mapRef,
  viewState,
  setViewState,
  zones,
  parcels,
  selectedZoneId,
  selectedParcelId,
  existingPinsGeoJson,
  locationType,
  points,
  polygonGeometry,
  type,
  category,
  subtype,
  pinMode,
  onMapClick,
}: PinFormMapPreviewProps) {
  // Icon resolution mapping
  const resolveIcon = () => {
    let color = "#3B82F6"; // Default blue
    let IconComponent: any = MapPin;

    if (pinMode === "device") {
      switch (type) {
        case "WATER":
          IconComponent = Droplets;
          color = "#0ea5e9";
          break;
        case "FIRE":
          IconComponent = Flame;
          color = "#ef4444";
          break;
        case "CAMERA":
          IconComponent = Video;
          color = "#a855f7";
          break;
        case "SOLAR":
          IconComponent = Sun;
          color = "#eab308";
          break;
        case "MONITORING":
          IconComponent = Zap;
          color = "#f97316";
          break;
        default:
          IconComponent = MapPin;
      }
    } else {
      if (subtype && PIN_ICON_MAP[subtype]) {
        IconComponent = PIN_ICON_MAP[subtype];
      }
      color = "#6366f1"; // Default Info Pin color
    }
    return { IconComponent, color };
  };

  const { IconComponent, color } = resolveIcon();

  const selectedZone = useMemo(
    () => zones.find((z) => z.id === selectedZoneId),
    [zones, selectedZoneId],
  );

  return (
    <div className="col-span-7 relative bg-gray-100 rounded-lg overflow-hidden h-full group/map">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onClick={onMapClick}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        style={{ width: "100%", height: "100%" }}
        interactiveLayerIds={["parcels-fill"]}
        cursor={locationType === "pin" ? "crosshair" : "default"}
      >
        <ExistingPinsLayer geojson={existingPinsGeoJson} />

        {/* Render Selected Zone Polygon */}
        {selectedZone && selectedZone.geometry && (
          <Source
            id="selected-zone"
            type="geojson"
            data={
              {
                type: "Feature",
                geometry: {
                  type: "Polygon",
                  coordinates: (selectedZone.geometry as any).coordinates,
                },
                properties: {
                  name: selectedZone.name,
                  color: selectedZone.color,
                },
              } as any
            }
          >
            <Layer
              id="selected-zone-fill"
              type="fill"
              paint={{
                "fill-color": selectedZone.color || "#0ea5e9",
                "fill-opacity": 0.15,
              }}
            />
            <Layer
              id="selected-zone-line"
              type="line"
              paint={{
                "line-color": selectedZone.color || "#0ea5e9",
                "line-width": 3,
                "line-dasharray": [2, 2],
              }}
            />
          </Source>
        )}

        {/* Render All Zones (Background) */}
        {zones.length > 0 && (
          <Source
            id="all-zones"
            type="geojson"
            data={
              {
                type: "FeatureCollection",
                features: zones
                  .filter(
                    (z) => z.id !== selectedZoneId && z.geometry?.coordinates,
                  )
                  .map((z) => ({
                    type: "Feature",
                    properties: { id: z.id, name: z.name, color: z.color },
                    geometry: {
                      type: "Polygon",
                      coordinates: (z.geometry as any).coordinates,
                    },
                  })),
              } as any
            }
          >
            <Layer
              id="all-zones-fill"
              type="fill"
              paint={{
                "fill-color": ["get", "color"],
                "fill-opacity": 0.1,
              }}
            />
            <Layer
              id="all-zones-outline"
              type="line"
              paint={{
                "line-color": ["get", "color"],
                "line-width": 1,
                "line-opacity": 0.5,
              }}
            />
          </Source>
        )}

        {/* Render Parcels in Selected Zone */}
        {parcels.length > 0 && (
          <Source
            id="zone-parcels"
            type="geojson"
            data={
              {
                type: "FeatureCollection",
                features: parcels
                  .filter((p) => p.geometry?.coordinates)
                  .map((p) => ({
                    type: "Feature",
                    properties: {
                      id: p.id,
                      name: p.name,
                      isSelected: p.id === selectedParcelId,
                    },
                    geometry: {
                      type: "Polygon",
                      coordinates: (p.geometry as any).coordinates,
                    },
                  })),
              } as any
            }
          >
            <Layer
              id="parcels-fill"
              type="fill"
              paint={{
                "fill-color": "#ffffff",
                "fill-opacity": ["case", ["get", "isSelected"], 0.25, 0.12],
              }}
            />
            <Layer
              id="parcels-glow"
              type="line"
              paint={{
                "line-color": "#ffffff",
                "line-width": ["case", ["get", "isSelected"], 5, 4],
                "line-opacity": 0.9,
              }}
            />
            <Layer
              id="parcels-dashed"
              type="line"
              paint={{
                "line-color": [
                  "case",
                  ["get", "isSelected"],
                  "#2563eb",
                  "#1e293b",
                ],
                "line-width": ["case", ["get", "isSelected"], 3, 2],
                "line-dasharray": [5, 3],
              }}
            />
          </Source>
        )}

        {/* Draw Polygon Preview via mapbox-gl-draw (Handled internally by the hook) */}

        {/* Draw Line Placeholder if no MapboxDraw logic applied directly to points */}
        {locationType === "area" && points.length > 1 && !polygonGeometry && (
          <Source
            id="line-preview"
            type="geojson"
            data={{
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: points.map((p) => [p.lng, p.lat]),
              },
              properties: {},
            }}
          >
            <Layer
              id="line-preview-layer"
              type="line"
              paint={{
                "line-color": "#16a34a",
                "line-width": 2,
                "line-dasharray": [2, 2],
              }}
            />
          </Source>
        )}

        {/* Render Markers for point(s) */}
        {points.map((point, index) => (
          <Marker
            key={point.id}
            latitude={point.lat}
            longitude={point.lng}
            anchor="bottom"
          >
            <div
              className={`relative flex flex-col items-center group/marker ${locationType === "area" ? "scale-75 opacity-70" : ""}`}
            >
              <div
                className="w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 relative"
                style={{ backgroundColor: "white", color }}
              >
                <div className="absolute -top-1 -right-1 bg-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border shadow-sm z-10 p-0 text-gray-700">
                  {index + 1}
                </div>
                <IconWrapper color={color} className="w-5 h-5">
                  <IconComponent />
                </IconWrapper>
              </div>
            </div>
          </Marker>
        ))}
      </Map>

      {/* Target Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50 z-10 transition-opacity">
        <LocateFixed className="w-6 h-6 text-gray-400" />
      </div>

      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 z-10">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          {locationType === "pin" ? "📍 ปักหมุด" : "✏️ วาดพื้นที่"}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {locationType === "pin"
            ? "คลิกบนแผนที่เพื่อระบุตำแหน่งที่ตั้ง"
            : "ใช้เครื่องมือทางขวาเพื่อวาดแนวเขต"}
        </p>
      </div>
    </div>
  );
}
