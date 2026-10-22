import React from "react";
import { Source, Layer } from "react-map-gl/mapbox";

interface ExistingPinsLayerProps {
  /** GeoJSON FeatureCollection from useExistingPins hook */
  geojson: GeoJSON.FeatureCollection;
}

/**
 * Renders existing pins as semi-transparent circle markers on the map.
 * Designed to be lightweight and non-intrusive — acts as a reference
 * layer so users can see where existing pins are when placing new ones.
 */
export function ExistingPinsLayer({ geojson }: ExistingPinsLayerProps) {
  if (!geojson.features.length) return null;

  return (
    <Source id="existing-pins" type="geojson" data={geojson}>
      {/* Outer ring (white halo) */}
      <Layer
        id="existing-pins-halo"
        type="circle"
        paint={{
          "circle-radius": 7,
          "circle-color": "#ffffff",
          "circle-opacity": 0.6,
        }}
      />
      {/* Inner colored dot */}
      <Layer
        id="existing-pins-dot"
        type="circle"
        paint={{
          "circle-radius": 5,
          "circle-color": [
            "match",
            ["get", "type"],
            "WATER",
            "#3B82F6",
            "FIRE",
            "#EF4444",
            "CAMERA",
            "#8B5CF6",
            "SOLAR",
            "#22D3EE",
            "TAX",
            "#F59E0B",
            "MONITORING",
            "#fbbf24",
            /* fallback: check category via case */
            "#6B7280",
          ],
          "circle-opacity": 0.55,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-opacity": 0.4,
        }}
      />
      {/* Title label (only at higher zoom) */}
      <Layer
        id="existing-pins-label"
        type="symbol"
        minzoom={16}
        layout={{
          "text-field": ["get", "title"],
          "text-size": 10,
          "text-font": ["Arial Unicode MS Regular"],
          "text-anchor": "top",
          "text-offset": [0, 0.8],
          "text-allow-overlap": false,
          "text-max-width": 10,
        }}
        paint={{
          "text-color": "#ffffff",
          "text-halo-color": "rgba(0,0,0,0.6)",
          "text-halo-width": 1,
          "text-opacity": 0.7,
        }}
      />
    </Source>
  );
}
