import { useEffect, useRef } from "react";
import { MapRef } from "react-map-gl/mapbox";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

// Custom draw styles for better visibility
export const DRAW_STYLES = [
  {
    id: "gl-draw-polygon-fill",
    type: "fill",
    filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
    paint: {
      "fill-color": "#16a34a",
      "fill-opacity": 0.2,
    },
  },
  {
    id: "gl-draw-polygon-stroke-active",
    type: "line",
    filter: ["all", ["==", "$type", "Polygon"]],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": "#16a34a", "line-width": 3 },
  },
  {
    id: "gl-draw-line",
    type: "line",
    filter: ["all", ["==", "$type", "LineString"]],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "#16a34a",
      "line-width": 2,
      "line-dasharray": [2, 2],
    },
  },
  {
    id: "gl-draw-polygon-and-line-vertex-active",
    type: "circle",
    filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
    paint: {
      "circle-radius": 6,
      "circle-color": "#fff",
      "circle-stroke-color": "#16a34a",
      "circle-stroke-width": 2,
    },
  },
  {
    id: "gl-draw-polygon-midpoint",
    type: "circle",
    filter: ["all", ["==", "meta", "midpoint"]],
    paint: {
      "circle-radius": 4,
      "circle-color": "#16a34a",
    },
  },
];

interface Point {
  id: number;
  lat: number;
  lng: number;
}

interface UseMapDrawControlsProps {
  mapRef: React.RefObject<MapRef | null>;
  locationType: "pin" | "area";
  onPolygonDrawn: (polygon: GeoJSON.Polygon, points: Point[]) => void;
  onPolygonDeleted: () => void;
  setIsDrawing: (drawing: boolean) => void;
}

export function useMapDrawControls({
  mapRef,
  locationType,
  onPolygonDrawn,
  onPolygonDeleted,
  setIsDrawing,
}: UseMapDrawControlsProps) {
  const drawRef = useRef<MapboxDraw | null>(null);
  const isDrawInitializedRef = useRef(false);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    if (locationType === "area" && !isDrawInitializedRef.current) {
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {},
        styles: DRAW_STYLES,
        clickBuffer: 12,
        touchBuffer: 20,
      });

      map.addControl(draw as unknown as mapboxgl.IControl);
      drawRef.current = draw;
      isDrawInitializedRef.current = true;

      const handleCreateOrUpdate = (e: { features: GeoJSON.Feature[] }) => {
        if (e.features.length > 0) {
          const feature = e.features[0];
          if (feature.geometry.type === "Polygon") {
            const polygonGeom = feature.geometry as GeoJSON.Polygon;
            const coords = polygonGeom.coordinates[0];
            const newPoints = coords.slice(0, -1).map((coord, i) => ({
              id: Date.now() + i,
              lng: coord[0],
              lat: coord[1],
            }));

            onPolygonDrawn(polygonGeom, newPoints);
          }
        }
      };

      const handleDelete = () => {
        onPolygonDeleted();
      };

      map.on("draw.create", handleCreateOrUpdate);
      map.on("draw.update", handleCreateOrUpdate);
      map.on("draw.delete", handleDelete);

      return () => {
        map.off("draw.create", handleCreateOrUpdate);
        map.off("draw.update", handleCreateOrUpdate);
        map.off("draw.delete", handleDelete);
      };
    } else if (locationType === "pin" && isDrawInitializedRef.current) {
      if (drawRef.current && map) {
        try {
          map.removeControl(drawRef.current as unknown as mapboxgl.IControl);
        } catch (e) {}
        drawRef.current = null;
        isDrawInitializedRef.current = false;
      }
    }
  }, [mapRef, locationType, onPolygonDrawn, onPolygonDeleted]);

  const startDrawingPolygon = () => {
    if (drawRef.current) {
      drawRef.current.deleteAll();
      drawRef.current.changeMode("draw_polygon");
      setIsDrawing(true);
      onPolygonDeleted(); // Clear previous state internally
    }
  };

  const clearPolygon = () => {
    if (drawRef.current) {
      drawRef.current.deleteAll();
    }
    onPolygonDeleted(); // Clear internal state
    setIsDrawing(false);
  };

  return { startDrawingPolygon, clearPolygon };
}
