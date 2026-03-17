import { useState, useEffect, useRef } from "react";
import { PinService } from "@/services/pin.service";
import { ApiPin } from "@/types/api";

/**
 * Hook to fetch existing pins for display on create/edit pin maps.
 * Renders pins as reference markers so users can avoid overlapping placement.
 *
 * @param excludePinId - Optional pin ID to exclude (for edit mode)
 */
export function useExistingPins(excludePinId?: string) {
  const [existingPins, setExistingPins] = useState<ApiPin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const fetchPins = async () => {
      setIsLoading(true);

      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const data = await PinService.getAll({ take: 1000 });

        if (!controller.signal.aborted) {
          const pins = excludePinId
            ? data.filter((p: ApiPin) => p.id !== excludePinId)
            : data;
          setExistingPins(pins);
        }
      } catch (error: any) {
        if (error?.name === "AbortError") return;
        console.error("Failed to fetch existing pins:", error);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchPins();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [excludePinId]);

  // Convert to GeoJSON for Mapbox rendering
  const existingPinsGeoJson = {
    type: "FeatureCollection" as const,
    features: existingPins
      .map((pin) => {
        // Extract coordinates from geometry (same pattern as SmartCityMap)
        let coords: [number, number] | null = null;
        if (
          pin.geometry &&
          typeof pin.geometry.coordinates === "object" &&
          Array.isArray(pin.geometry.coordinates)
        ) {
          coords = pin.geometry.coordinates as [number, number];
        } else if (pin.geometry?.lng && pin.geometry?.lat) {
          coords = [pin.geometry.lng, pin.geometry.lat];
        }
        if (!coords) return null;

        return {
          type: "Feature" as const,
          properties: {
            id: pin.id,
            title: pin.title || "",
            type: pin.type || "",
            category: pin.category || "",
          },
          geometry: {
            type: "Point" as const,
            coordinates: coords,
          },
        };
      })
      .filter(Boolean) as GeoJSON.Feature[],
  };

  return { existingPins, existingPinsGeoJson, isLoading };
}
