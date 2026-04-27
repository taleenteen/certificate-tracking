"use client";

import React, { useState, useCallback, useRef } from "react";
import Map, {
  Source,
  Layer,
  Popup,
  MapRef,
  MapMouseEvent,
} from "react-map-gl/mapbox";
import type { Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPinned, UserRound } from "lucide-react";
import { PinService } from "@/services/pin.service";
import { ZoneService, ApiZone } from "@/services/zone.service";
import { ParcelService, ApiParcel } from "@/services/parcel.service";
import { ApiPin, PinType, PinCategory } from "@/types/api";
import { Pin } from "@/types/map";
import MapPopup from "./MapPopup";
import PinHoverTooltip from "./PinHoverTooltip";
import { generatePinImage } from "@/utils/map-style-utils";
import { useMapRefreshCounter } from "@/stores/useMapStore";
import {
  MdOutlineWaterDrop,
  MdLocalFireDepartment,
  MdHome,
  MdOutlineSolarPower,
  MdApartment,
  MdInventory2,
  MdPlace,
  MdPark,
  MdReportProblem,
  MdShoppingBag,
  MdBarChart,
  MdMemory,
  MdInfo,
  MdBolt,
} from "react-icons/md";
import { PiSecurityCamera } from "react-icons/pi";
import { ZoneInfoPanel } from "./ZoneInfoPanel";
import { ParcelCreateModal } from "./ParcelCreateModal";
import { PIN_ICON_MAP, PIN_SUBTYPE_COLORS } from "./pin-icon-map";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Category labels mapping (Thai)
const CATEGORY_LABELS: Record<string, string> = {
  [PinCategory.INFRASTRUCTURE]: "โครงสร้างพื้นฐาน",
  [PinCategory.ASSET]: "ครุภัณฑ์",
  [PinCategory.SERVICE_POINT]: "จุดบริการ",
  [PinCategory.ENVIRONMENT]: "สิ่งแวดล้อม",
  [PinCategory.RISK]: "ความเสี่ยง",
  [PinCategory.ECONOMY]: "เศรษฐกิจ",
  [PinCategory.MANAGEMENT]: "ข้อมูลบริหาร",
  [PinCategory.DEVICE]: "อุปกรณ์ IoT",
  [PinCategory.SOLAR]: "โซล่าเซลล์",
  [PinCategory.MONITORING]: "ระบบ Monitoring",
};

interface SmartCityMapProps {
  activeLayer: string | null;
  mapRef: React.RefObject<MapRef | null>;
  onEditPin?: (pin: ApiPin) => void;
}

export default function SmartCityMap({
  activeLayer,
  mapRef,
  onEditPin,
}: SmartCityMapProps) {
  const [popupInfo, setPopupInfo] = useState<Pin | null>(null);
  const [pins, setPins] = useState<ApiPin[]>([]);
  const [zones, setZones] = useState<ApiZone[]>([]);
  const [parcels, setParcels] = useState<ApiParcel[]>([]);
  const [hoverInfo, setHoverInfo] = useState<{
    zoneName: string;
    lng: number;
    lat: number;
  } | null>(null);

  // Pin hover state
  const [pinHoverInfo, setPinHoverInfo] = useState<{
    title: string;
    type?: string;
    category?: string;
    subtype?: string;
    lng: number;
    lat: number;
  } | null>(null);

  // Zone selection state for ZoneInfoPanel
  const [selectedZone, setSelectedZone] = useState<ApiZone | null>(null);
  const [showParcelModal, setShowParcelModal] = useState(false);
  const [selectedZoneForParcel, setSelectedZoneForParcel] =
    useState<string>("");

  // Parcel hover state
  const [parcelHoverInfo, setParcelHoverInfo] = useState<{
    parcelName: string;
    ownerName?: string;
    type?: string;
    lng: number;
    lat: number;
  } | null>(null);

  // Get refresh counter from store
  const refreshCounter = useMapRefreshCounter();

  // Hovered pin ID ref for feature state
  const hoveredPinIdRef = useRef<string | number | null>(null);

  // Load mock map data from the in-memory services. This keeps the map route
  // deterministic and avoids hidden backend fetches while the app is mocked.
  React.useEffect(() => {
    let isMounted = true;

    Promise.all([
      PinService.getAll(),
      ZoneService.getAll(),
      ParcelService.getAll(),
    ])
      .then(([nextPins, nextZones, nextParcels]) => {
        if (!isMounted) return;

        setPins(nextPins || []);
        setZones(nextZones || []);
        setParcels(nextParcels || []);
      })
      .catch((error) => {
        console.error("Failed to load mock map data:", error);
      });

    return () => {
      isMounted = false;
    };
  }, [refreshCounter]);

  // Filter pins based on activeLayer
  const filteredPins = React.useMemo(() => {
    if (!activeLayer) return pins;

    return pins.filter((pin) => {
      const layer = activeLayer.toLowerCase();
      const type = pin.type?.toLowerCase() || "";
      const category = pin.category?.toLowerCase() || "";

      // Precise mapping for e-Services
      if (layer === "water") return type === "water";
      if (layer === "tax") return type === "tax";
      if (layer === "security") return type === "camera"; // Security -> Camera
      if (layer === "disaster") return type === "fire" || category === "risk"; // Disaster -> Fire/Risk
      if (layer === "waste") return category === "environment"; // Waste -> Environment
      if (layer === "license")
        return category === "management" || category === "economy"; // License -> Management/Economy
      if (layer === "monitoring")
        return type === "monitoring" || category === "monitoring";

      // Fallback: check matches in type or category
      return type === layer || category === layer;
    });
  }, [pins, activeLayer]);

  // Separate pins into points and zones
  const pointPins = filteredPins.filter(
    (pin) => !pin.geometry || pin.geometry.type === "POINT",
  );
  const pointsGeoJson = React.useMemo<GeoJSON.FeatureCollection>(() => {
    return {
      type: "FeatureCollection",
      features: pointPins.map((pin) => {
        // Determine icon based on type and category
        let icon = "pin-info";
        const upperType = pin.type?.toUpperCase();
        const upperCategory = pin.category?.toUpperCase();

        // Device types (main pins)
        switch (upperType) {
          case PinType.WATER:
            icon = "pin-water";
            break;
          case PinType.FIRE:
            icon = "pin-fire";
            break;
          case PinType.CAMERA:
            icon = "pin-camera";
            break;
          case PinType.SOLAR:
            icon = "pin-solar";
            break;
          case PinType.TAX:
            icon = "pin-tax";
            break;
          case PinType.MONITORING:
            icon = "pin-monitoring";
            break;
          default:
            // Info categories (smaller pins)
            switch (upperCategory) {
              case PinCategory.INFRASTRUCTURE:
                icon = "pin-infrastructure";
                break;
              case PinCategory.ASSET:
                icon = "pin-asset";
                break;
              case PinCategory.SERVICE_POINT:
                icon = "pin-service-point";
                break;
              case PinCategory.ENVIRONMENT:
                icon = "pin-environment";
                break;
              case PinCategory.RISK:
                icon = "pin-risk";
                break;
              case PinCategory.ECONOMY:
                icon = "pin-economy";
                break;
              case PinCategory.MANAGEMENT:
                icon = "pin-management";
                break;
              case PinCategory.DEVICE:
                icon = "pin-device";
                break;
              default:
                icon = "pin-info";
            }
        }

        // Override icon if device is INFO and has a known subtype
        if (
          upperType === PinType.INFO &&
          pin.subtype &&
          PIN_ICON_MAP[pin.subtype]
        ) {
          icon = `pin-sub-${pin.subtype}`;
        }

        // Handle geometry (support both legacy lat/lng and GeoJSON)
        let coordinates = [100.515, 13.715]; // Default
        if (
          pin.geometry &&
          typeof pin.geometry.coordinates === "object" &&
          Array.isArray(pin.geometry.coordinates)
        ) {
          coordinates = pin.geometry.coordinates as number[];
        } else if (pin.geometry?.lng && pin.geometry?.lat) {
          coordinates = [pin.geometry.lng, pin.geometry.lat];
        }

        return {
          type: "Feature",
          id: pin.id,
          properties: {
            id: pin.id,
            title: pin.title,
            description: pin.description,
            type: pin.type,
            subtype: pin.subtype,
            subtypeNameTh: pin.subtypeNameTh,
            category: pin.category, // Added category
            status: pin.status,
            updatedAt: pin.updatedAt,
            lat: coordinates[1],
            lng: coordinates[0],
            // Helper property for icon-image expression
            icon,
            // Map attributes to display properties if needed
            ...pin.attributes,
            // Add category label for INFO pins (exclude main device pins)
            categoryLabel:
              upperType === PinType.INFO && pin.category
                ? CATEGORY_LABELS[pin.category] || ""
                : "",
          },
          geometry: {
            type: "Point",
            coordinates,
          },
        };
      }),
    };
  }, [pointPins]);

  const [cursor, setCursor] = useState<string>("auto");

  const onMapLoad = useCallback(
    (e: { target: MapboxMap }) => {
      const map = e.target;

      // Register mouseleave on pin layers for reliable hover clearing
      const clearHover = () => {
        if (hoveredPinIdRef.current) {
          map.setFeatureState(
            { source: "pins", id: hoveredPinIdRef.current },
            { hover: false },
          );
          hoveredPinIdRef.current = null;
        }
      };
      map.on("mouseleave", "unclustered-point", clearHover);
      map.on("mouseleave", "unclustered-point-hover", clearHover);
      // Generate device pin images (main size)
      const iconStyle = { width: "24px", height: "24px", color: "white" };

      const pinConfigs = [
        // Main Pins
        {
          id: "pin-water",
          color: "#3b82f6",
          hoverColor: "#1e40af",
          icon: <MdOutlineWaterDrop style={iconStyle} />,
        },
        {
          id: "pin-fire",
          color: "#ef4444",
          hoverColor: "#b91c1c",
          icon: <MdLocalFireDepartment style={iconStyle} />,
        },
        {
          id: "pin-camera",
          color: "#3F2A1D",
          hoverColor: "#3F2A1D",
          icon: <PiSecurityCamera style={iconStyle} />,
        },
        {
          id: "pin-tax",
          color: "#374151",
          hoverColor: "#111827",
          icon: <MdHome style={iconStyle} />,
        },
        {
          id: "pin-solar",
          color: "#22D3EE", // Requested color
          hoverColor: "#06B6D4", // Cyan-400 for hover
          icon: <MdOutlineSolarPower style={iconStyle} />,
        },
        {
          id: "pin-monitoring",
          color: "#fbbf24", // Amber-400 (Lightning color)
          hoverColor: "#f59e0b", // Amber-500
          icon: <MdBolt style={iconStyle} />,
          // removed scale to use default 1.0 (main pin size)
        },
        // Info Category Pins (Smaller)
        {
          id: "pin-infrastructure",
          color: "#b45309",
          hoverColor: "#78350f",
          icon: <MdApartment style={iconStyle} />,
          scale: 0.65,
        },
        {
          id: "pin-asset",
          color: "#2563eb",
          hoverColor: "#1e3a8a",
          icon: <MdInventory2 style={iconStyle} />,
          scale: 0.65,
        },
        {
          id: "pin-service-point",
          color: "#ca8a04",
          hoverColor: "#854d0e",
          icon: <MdPlace style={iconStyle} />,
          scale: 0.65,
        },
        {
          id: "pin-environment",
          color: "#16a34a",
          hoverColor: "#14532d",
          icon: <MdPark style={iconStyle} />,
          scale: 0.65,
        },
        {
          id: "pin-risk",
          color: "#dc2626",
          hoverColor: "#991b1b",
          icon: <MdReportProblem style={iconStyle} />,
          scale: 0.65,
        },
        {
          id: "pin-economy",
          color: "#ea580c",
          hoverColor: "#9a3412",
          icon: <MdShoppingBag style={iconStyle} />,
          scale: 0.65,
        },
        {
          id: "pin-management",
          color: "#9333ea",
          hoverColor: "#6b21a8",
          icon: <MdBarChart style={iconStyle} />,
          scale: 0.65,
        },
        {
          id: "pin-device",
          color: "#0284c7",
          hoverColor: "#075985",
          icon: <MdMemory style={iconStyle} />,
          scale: 0.65,
        },
        {
          id: "pin-info",
          color: "#0891b2",
          hoverColor: "#155e75",
          icon: <MdInfo style={iconStyle} />,
          scale: 0.65,
        },
      ];

      pinConfigs.forEach((config) => {
        // Normal state
        generatePinImage(
          map,
          config.id,
          config.color,
          config.icon,
          config.scale || 1.0,
        );
        // Hover state
        generatePinImage(
          map,
          `${config.id}-hover`,
          config.hoverColor,
          config.icon,
          config.scale || 1.0,
        );
      });

      // Generate subtype pin images
      Object.entries(PIN_ICON_MAP).forEach(([subtype, IconComponent]) => {
        const colors = PIN_SUBTYPE_COLORS[subtype] || {
          color: "#0891b2",
          hoverColor: "#155e75",
        }; // Default to INFO category colors

        const pinId = `pin-sub-${subtype}`;
        const iconElement = <IconComponent style={iconStyle} />;

        // Normal state (Subtypes use 0.65 scale like other INFO pins)
        generatePinImage(map, pinId, colors.color, iconElement, 0.65);
        // Hover state
        generatePinImage(
          map,
          `${pinId}-hover`,
          colors.hoverColor,
          iconElement,
          0.65,
        );
      });
    },
    [],
  );

  const onMouseEnter = useCallback(() => setCursor("pointer"), []);

  const onClick = (event: MapMouseEvent) => {
    const feature = event.features?.[0];
    if (!feature) {
      setPopupInfo(null);
      setSelectedZone(null);
      return;
    }

    const clusterId = feature.properties?.cluster_id;
    const layerId = feature.layer?.id;

    // Check if clicked on a zone
    if (layerId === "zone-fills" || layerId === "zone-lines") {
      const zoneId = feature.properties?.id;
      const zone = zones.find((z) => z.id === zoneId);
      if (zone) {
        setSelectedZone(zone);
        setPopupInfo(null);
        return;
      }
    }

    // Clear zone selection when clicking elsewhere
    setSelectedZone(null);

    if (clusterId) {
      // Clicked on a cluster
      const mapboxSource = mapRef.current?.getMap().getSource("pins");
      const clusterSource = mapboxSource as
        | {
            getClusterExpansionZoom: (
              clusterId: number,
              callback: (error: Error | null, zoom: number) => void,
            ) => void;
          }
        | undefined;

      clusterSource?.getClusterExpansionZoom(
        clusterId,
        (err, zoom) => {
          if (err) return;

          const coordinates =
            "coordinates" in feature.geometry
              ? (feature.geometry.coordinates as [number, number])
              : undefined;

          if (!coordinates) return;

          mapRef.current?.flyTo({
            center: coordinates,
            zoom,
            duration: 500,
          });
        },
      );
    } else {
      // Clicked on a pin
      const pin = feature.properties as Pin;
      // Only set popup for points, not zones/lines for now (unless requested)
      if (feature.geometry.type === "Point") {
        setPopupInfo(pin);
      }
    }
  };

  // Handle add parcel from ZoneInfoPanel
  const handleAddParcel = (zoneId: string) => {
    setSelectedZoneForParcel(zoneId);
    setShowParcelModal(true);
    setSelectedZone(null);
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-gray-900">
      <style jsx global>{`
        .mapboxgl-ctrl-logo,
        .mapboxgl-ctrl-bottom-right,
        .mapboxgl-ctrl-attrib {
          display: none !important;
        }
        .mapboxgl-popup-content {
          padding: 0 !important;
          border-radius: 8px !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
          background-color: transparent !important;
        }
      `}</style>

      <Map
        ref={mapRef}
        initialViewState={{
          latitude: 13.5481,
          longitude: 99.8275,
          zoom: 15,
        }}
        onLoad={onMapLoad}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={() => {
          setCursor("auto");
          setHoverInfo(null);
          setPinHoverInfo(null);
          setParcelHoverInfo(null);

          if (hoveredPinIdRef.current) {
            mapRef.current
              ?.getMap()
              .setFeatureState(
                { source: "pins", id: hoveredPinIdRef.current },
                { hover: false },
              );
            hoveredPinIdRef.current = null;
          }
        }}
        onMouseMove={(e) => {
          const features = e.features;
          if (features && features.length > 0) {
            const feature = features[0];
            const layerId = feature.layer?.id;

            // Parcel hover (priority over zone!)
            if (layerId === "parcel-fills" || layerId === "parcel-lines") {
              const parcelName = feature.properties?.name;
              if (parcelName) {
                setParcelHoverInfo({
                  parcelName,
                  ownerName: feature.properties?.ownerName,
                  type: feature.properties?.type,
                  lng: e.lngLat.lng,
                  lat: e.lngLat.lat,
                });
                setHoverInfo(null);
                setPinHoverInfo(null);
                setCursor("pointer");
                return;
              }
            }

            // Zone hover
            const zoneName = feature.properties?.name;
            if (zoneName && layerId === "zone-fills") {
              setHoverInfo({
                zoneName,
                lng: e.lngLat.lng,
                lat: e.lngLat.lat,
              });
              setParcelHoverInfo(null);
              setPinHoverInfo(null);
              setCursor("pointer");
              return;
            }

            // Pin hover (unclustered points only)
            if (
              (layerId === "unclustered-point" ||
                layerId === "unclustered-point-hover") &&
              !feature.properties?.cluster_id
            ) {
              const props = feature.properties;
              setPinHoverInfo({
                title: props?.title || "Unknown",
                type: props?.type,
                category: props?.category,
                subtype: props?.subtype,
                lng: e.lngLat.lng,
                lat: e.lngLat.lat,
              });
              setHoverInfo(null);
              setParcelHoverInfo(null);
              setCursor("pointer");

              // Handle feature state for hover effect
              const pinId = feature.id as string | number | undefined;
              if (
                pinId !== undefined &&
                pinId !== null &&
                pinId !== hoveredPinIdRef.current
              ) {
                // Clear previous
                if (hoveredPinIdRef.current) {
                  e.target.setFeatureState(
                    { source: "pins", id: hoveredPinIdRef.current },
                    { hover: false },
                  );
                }
                // Set new
                hoveredPinIdRef.current = pinId;
                e.target.setFeatureState(
                  { source: "pins", id: pinId },
                  { hover: true },
                );
              }
              return;
            }
          }
          setHoverInfo(null);
          setPinHoverInfo(null);
          setParcelHoverInfo(null);

          // Clear hover state if not on pin
          if (hoveredPinIdRef.current) {
            e.target.setFeatureState(
              { source: "pins", id: hoveredPinIdRef.current },
              { hover: false },
            );
            hoveredPinIdRef.current = null;
          }
        }}
        cursor={cursor}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={false}
        reuseMaps
        interactiveLayerIds={[
          "clusters",
          "unclustered-point",
          "unclustered-point-hover",
          "parcel-fills",
          "zone-fills",
        ]}
        language="th"
      >
        <Source
          id="zones-api"
          type="geojson"
          data={{
            type: "FeatureCollection",
            features: zones
              .filter((z) => z.geometry?.coordinates)

              .map((z) => ({
                type: "Feature" as const,
                properties: {
                  id: z.id,
                  name: z.name,
                  color: z.color || "#3B82F6",
                  type: z.type,
                },
                geometry: {
                  type: "Polygon" as const,
                  coordinates: z.geometry!.coordinates,
                },
              })),
          }}
        >
          {/* Zone Fills */}
          <Layer
            id="zone-fills"
            type="fill"
            paint={{
              "fill-color": ["get", "color"],
              "fill-opacity": 0.15,
            }}
          />
          {/* Zone Outlines - Solid thick */}
          <Layer
            id="zone-lines"
            type="line"
            paint={{
              "line-color": ["get", "color"],
              "line-width": 3,
            }}
          />
        </Source>

        {/* Parcels Source - Dashed Lines */}
        <Source
          id="parcels-api"
          type="geojson"
          data={{
            type: "FeatureCollection",
            features: parcels
              .filter((p) => p.geometry?.coordinates)
              .map((p) => ({
                type: "Feature" as const,
                properties: {
                  id: p.id,
                  name: p.name,
                  ownerName: p.ownerName,
                  color: p.strokeColor || p.fillColor || "#6B7280",
                  type: p.type,
                },
                geometry: {
                  type: "Polygon" as const,
                  coordinates: p.geometry!.coordinates,
                },
              })),
          }}
        >
          {/* Parcel Fills - Very subtle */}
          <Layer
            id="parcel-fills"
            type="fill"
            paint={{
              "fill-color": "#ffffff",
              "fill-opacity": 0.12,
            }}
          />
          {/* Parcel Outline - White glow behind dashed line */}
          <Layer
            id="parcel-lines-glow"
            type="line"
            paint={{
              "line-color": "#ffffff",
              "line-width": 4,
              "line-opacity": 0.9,
            }}
          />
          {/* Parcel Outlines - Contrasting dashed line */}
          <Layer
            id="parcel-lines"
            type="line"
            paint={{
              "line-color": "#1e293b",
              "line-width": 2,
              "line-dasharray": [5, 3],
            }}
          />
        </Source>

        <Source
          id="pins"
          type="geojson"
          data={pointsGeoJson}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
          promoteId="id"
        >
          {/* Cluster Circles */}
          <Layer
            id="clusters"
            type="circle"
            filter={["has", "point_count"]}
            paint={{
              "circle-color": [
                "step",
                ["get", "point_count"],
                "#51bbd6", // < 100
                100,
                "#f1f075", // < 750
                750,
                "#f28cb1", // >= 750
              ],
              "circle-radius": [
                "step",
                ["get", "point_count"],
                20, // < 100
                100,
                30, // < 750
                750,
                40, // >= 750
              ],
              "circle-stroke-width": 2,
              "circle-stroke-color": "#fff",
            }}
          />

          {/* Cluster Counts */}
          <Layer
            id="cluster-count"
            type="symbol"
            filter={["has", "point_count"]}
            layout={{
              "text-field": "{point_count_abbreviated}",
              "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
              "text-size": 12,
            }}
            paint={{
              "text-color": "#ffffff",
            }}
          />

          {/* Unclustered Points (Icon) - Normal State */}
          <Layer
            id="unclustered-point"
            type="symbol"
            filter={["!", ["has", "point_count"]]}
            layout={{
              "icon-image": ["get", "icon"],
              "icon-size": 0.8,
              "icon-allow-overlap": true,
              "icon-anchor": "bottom",
            }}
            paint={{
              "icon-opacity": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                0,
                1,
              ],
              "icon-opacity-transition": { duration: 200, delay: 0 },
            }}
          />

          {/* Unclustered Points (Icon) - Hover State */}
          <Layer
            id="unclustered-point-hover"
            type="symbol"
            filter={["!", ["has", "point_count"]]}
            layout={{
              "icon-image": ["concat", ["get", "icon"], "-hover"],
              "icon-size": 0.8,
              "icon-allow-overlap": true,
              "icon-anchor": "bottom",
            }}
            paint={{
              "icon-opacity": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                1,
                0,
              ],
              "icon-opacity-transition": { duration: 200, delay: 0 },
            }}
          />

          {/* Badge Background (Circle) - exclude CAMERA pins (they have their own badge) */}
          <Layer
            id="pin-badge-bg"
            type="circle"
            filter={[
              "all",
              ["!", ["has", "point_count"]],
              ["!=", ["get", "type"], "CAMERA"], // Exclude camera pins
              ["any", ["has", "level"], ["has", "viewers"], ["has", "alert"]],
            ]}
            paint={{
              "circle-radius": 7,
              "circle-color": [
                "case",
                ["has", "level"],
                "#2563eb", // blue-600
                ["has", "viewers"],
                "#ef4444", // red-500
                ["has", "alert"],
                "#eab308", // yellow-500
                "#000000",
              ],
              "circle-stroke-width": 1.5,
              "circle-stroke-color": "#ffffff",
              "circle-translate": [16, -42], // Adjusted to top-right like CCTV
            }}
          />

          {/* Badge Text - exclude CAMERA pins */}
          <Layer
            id="pin-badge-text"
            type="symbol"
            filter={[
              "all",
              ["!", ["has", "point_count"]],
              ["!=", ["get", "type"], "CAMERA"], // Exclude camera pins
              ["any", ["has", "level"], ["has", "viewers"], ["has", "alert"]],
            ]}
            layout={{
              "text-field": [
                "case",
                ["has", "level"],
                ["get", "level"],
                ["has", "viewers"],
                ["to-string", ["get", "viewers"]],
                ["has", "alert"],
                "!",
                "",
              ],
              "text-size": 10,
              "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
              "text-allow-overlap": true,
            }}
            paint={{
              "text-color": "#ffffff",
              "text-translate": [16, -42], // Matches circle-translate
            }}
          />

          {/* Label (Bottom) - Existing generic label */}
          <Layer
            id="pin-label"
            type="symbol"
            filter={["all", ["!", ["has", "point_count"]], ["has", "label"]]}
            layout={{
              "text-field": ["get", "label"],
              "text-size": 12,
              "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
              "text-anchor": "top",
              "text-offset": [0, 1.5], // Below the icon
              "text-allow-overlap": false,
            }}
            paint={{
              "text-color": "#ffffff",
              "text-halo-color": "rgba(0,0,0,0.7)",
              "text-halo-width": 2,
            }}
          />

          {/* Info Pin Category Label (New Layer) */}
          <Layer
            id="info-pin-category"
            type="symbol"
            filter={[
              "all",
              ["!", ["has", "point_count"]],
              ["has", "categoryLabel"],
              ["!=", ["get", "categoryLabel"], ""],
            ]}
            layout={{
              "text-field": ["get", "title"], // Show pin title instead of category
              "text-size": 13,
              "text-font": ["Arial Unicode MS Regular"], // Use Regular for cleaner strokes
              "text-anchor": "top",
              "text-offset": [0, 0.4], // Move text closer to pin
              "text-allow-overlap": false,
              "text-max-width": 15, // Limit width for long titles
            }}
            paint={{
              "text-color": "#ffffff",
              "text-halo-color": "rgba(0,0,0,0.7)",
              "text-halo-width": 1,
            }}
          />

          {/* Tax Pin Title Label (displays pin title as chip) */}
          <Layer
            id="tax-pin-title"
            type="symbol"
            filter={[
              "all",
              ["!", ["has", "point_count"]],
              ["==", ["get", "type"], "TAX"],
            ]}
            layout={{
              "text-field": ["get", "title"],
              "text-size": 11,
              "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
              "text-anchor": "left",
              "text-offset": [1.8, 0],
              "text-allow-overlap": true,
              "text-max-width": 15,
            }}
            paint={{
              "text-color": "#ffffff",
              "text-halo-color": "rgba(0,0,0,0.7)",
              "text-halo-width": 2,
            }}
          />
          <Layer
            id="cctv-status-badge-bg"
            type="circle"
            filter={[
              "all",
              ["!", ["has", "point_count"]],
              ["==", ["get", "type"], "CAMERA"],
            ]}
            paint={{
              "circle-radius": 7,
              "circle-color": "#22c55e", // Always green (online)
              "circle-stroke-width": 1.5,
              "circle-stroke-color": "#ffffff",
              "circle-translate": [16, -42],
            }}
          />

          {/* CCTV Status Icon (Signal symbol using text) */}
          <Layer
            id="cctv-status-icon"
            type="symbol"
            filter={[
              "all",
              ["!", ["has", "point_count"]],
              ["==", ["get", "type"], "CAMERA"],
            ]}
            layout={{
              "text-field": "◉",
              "text-size": 10,
              "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
              "text-allow-overlap": true,
            }}
            paint={{
              "text-color": "#ffffff",
              "text-translate": [16, -42],
            }}
          />
        </Source>

        {/* Zone Hover Popup */}
        {hoverInfo && (
          <Popup
            longitude={hoverInfo.lng}
            latitude={hoverInfo.lat}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            offset={10}
            maxWidth="265px"
          >
            <div className="px-3 py-2 w-[220px] bg-white rounded-lg shadow-lg text-sm flex flex-col gap-2">
              <div className="font-semibold text-gray-800 flex flex-row items-center gap-2">
                <MapPinned className="w-5 h-5 mt-0.5 shrink-0" />
                <span className="leading-tight text-lg">
                  {hoverInfo.zoneName}
                </span>
              </div>
            </div>
          </Popup>
        )}

        {/* Parcel Hover Popup */}
        {parcelHoverInfo && (
          <Popup
            longitude={parcelHoverInfo.lng}
            latitude={parcelHoverInfo.lat}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            offset={10}
            maxWidth="265px"
          >
            <div className="px-3 py-2 w-[220px] bg-white rounded-lg shadow-lg text-sm flex flex-col gap-2">
              <div className="font-semibold text-gray-800 flex flex-row items-center gap-2">
                <MapPinned className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="leading-tight text-lg">
                  {parcelHoverInfo.parcelName}
                </span>
              </div>

              <hr className="border-gray-200" />

              {parcelHoverInfo.ownerName && (
                <div className="text-xs text-gray-500 flex flex-col items-start justify-center gap-2">
                  <p className="text-sm">เพิ่มโดย</p>
                  <span className="text-gray-800 flex flex-row items-center justify-center gap-2">
                    <UserRound className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="leading-tight">
                      {parcelHoverInfo.ownerName}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </Popup>
        )}

        {/* Pin Hover Tooltip */}
        {pinHoverInfo && !popupInfo && (
          <Popup
            longitude={pinHoverInfo.lng}
            latitude={pinHoverInfo.lat}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            offset={15}
          >
            <PinHoverTooltip
              title={pinHoverInfo.title}
              type={pinHoverInfo.type}
              category={pinHoverInfo.category}
              subtype={pinHoverInfo.subtype}
            />
          </Popup>
        )}

        {popupInfo && (
          <MapPopup
            popupInfo={popupInfo}
            onClose={() => setPopupInfo(null)}
            onEdit={() => {
              const fullPin = pins.find((p) => p.id === String(popupInfo.id));
              if (fullPin && onEditPin) {
                onEditPin(fullPin);
              }
            }}
          />
        )}
      </Map>

      {/* Zone Info Panel */}
      {selectedZone && (
        <div className="absolute top-18 right-18 z-50">
          <ZoneInfoPanel
            zone={selectedZone}
            parcels={parcels}
            onClose={() => setSelectedZone(null)}
            onAddParcel={handleAddParcel}
          />
        </div>
      )}

      {/* Parcel Create Modal */}
      {showParcelModal && (
        <ParcelCreateModal
          zoneId={selectedZoneForParcel}
          zones={zones}
          onClose={() => setShowParcelModal(false)}
        />
      )}
    </div>
  );
}
