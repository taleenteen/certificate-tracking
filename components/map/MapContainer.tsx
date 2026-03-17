"use client";

import { useRef, useEffect, useState } from "react";
import { MapRef } from "react-map-gl/mapbox";
import { useSearchParams } from "next/navigation";
import { MapTools } from "./MapTools";
import SmartCityMap from "./SmartCityMap";
import { useMapStore } from "@/stores/useMapStore";
import { ApiPin } from "@/types/api";

interface MapContainerProps {
  canCreatePin?: boolean;
}

export function MapContainer({ canCreatePin = false }: MapContainerProps) {
  const mapRef = useRef<MapRef>(null);
  const searchParams = useSearchParams();
  const layerParam = searchParams.get("layer");

  // Use Zustand store
  const activeLayer = useMapStore((state) => state.activeLayer);
  const isCreatePinMode = useMapStore((state) => state.isCreatePinMode);
  const { setActiveLayer, toggleCreatePinMode, reset } = useMapStore(
    (state) => state.actions,
  );

  // Local state for UI cards and editing
  const [activeCard, setActiveCard] = useState<
    | "placeholder"
    | "create-pin"
    | "create-zone"
    | "manage-zone"
    | "edit-pin"
    | "manage-pin"
    | null
  >(null);
  const [editingPin, setEditingPin] = useState<ApiPin | null>(null);

  const handleEditPin = (pin: ApiPin) => {
    setEditingPin(pin);
    setActiveCard("edit-pin");
  };

  const handleFlyTo = (lng: number, lat: number) => {
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: 16,
      duration: 1500,
    });
    // Optional: close card on fly to?
    // setActiveCard(null);
  };

  // Set active layer from URL param on mount
  useEffect(() => {
    if (layerParam) {
      setActiveLayer(layerParam);
    }
  }, [layerParam, setActiveLayer]);

  // Reset store on unmount
  useEffect(() => {
    return () => reset();
  }, [reset]);

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const handleReset = () => {
    mapRef.current?.flyTo({
      center: [100.515, 13.715],
      zoom: 13.5,
      duration: 2000,
    });
    reset();
  };

  const handleCreatePin = () => {
    if (canCreatePin) {
      toggleCreatePinMode();
    }
  };

  return (
    <div className="relative w-full h-full bg-gray-100">
      <div className="absolute inset-0 z-0">
        <SmartCityMap
          activeLayer={activeLayer}
          mapRef={mapRef}
          onEditPin={handleEditPin}
        />
      </div>

      <MapTools
        activeLayer={activeLayer}
        onLayerChange={setActiveLayer}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        onCreatePin={canCreatePin ? handleCreatePin : undefined}
        isCreatePinMode={isCreatePinMode}
        activeCard={activeCard}
        onActiveCardChange={setActiveCard}
        editingPin={editingPin}
        onEditPin={handleEditPin}
        onFlyTo={handleFlyTo}
      />
    </div>
  );
}
