import { useState, useEffect } from "react";
import { ZoneService, ApiZone } from "@/services/zone.service";
import { ParcelService, ApiParcel } from "@/services/parcel.service";
import { FloorService, ApiFloor } from "@/services/floor.service";
import { toast } from "sonner";
import * as turf from "@turf/turf";

export function useCascadingLocation({
  initialZoneId,
  initialParcelId,
}: {
  initialZoneId?: string;
  initialParcelId?: string;
}) {
  const [zones, setZones] = useState<ApiZone[]>([]);
  const [isLoadingZones, setIsLoadingZones] = useState(true);

  const [parcels, setParcels] = useState<ApiParcel[]>([]);
  const [isLoadingParcels, setIsLoadingParcels] = useState(false);

  const [floors, setFloors] = useState<ApiFloor[]>([]);
  const [isLoadingFloors, setIsLoadingFloors] = useState(false);

  // Initialize Zones
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const data = await ZoneService.getAll();
        setZones(data || []);
      } catch (error) {
        console.error("Failed to fetch zones:", error);
        toast.error("ไม่สามารถโหลดรายการโซนได้");
      } finally {
        setIsLoadingZones(false);
      }
    };
    fetchZones();
  }, []);

  // Initialize cascading data based on initial values (for edit mode)
  useEffect(() => {
    if (initialZoneId) {
      setIsLoadingParcels(true);
      ParcelService.getByZone(initialZoneId)
        .then((data) => setParcels(data || []))
        .catch((err) => console.error("Failed to fetch parcels:", err))
        .finally(() => setIsLoadingParcels(false));
    }
    if (initialParcelId) {
      setIsLoadingFloors(true);
      FloorService.getByParcel(initialParcelId)
        .then((data) => setFloors(data || []))
        .catch((err) => console.error("Failed to fetch floors:", err))
        .finally(() => setIsLoadingFloors(false));
    }
  }, [initialZoneId, initialParcelId]);

  const loadParcels = async (zoneId: string) => {
    setIsLoadingParcels(true);
    try {
      const data = await ParcelService.getByZone(zoneId);
      setParcels(data || []);
      setFloors([]); // Reset floors down the chain
    } catch (err) {
      console.error("Failed to fetch parcels:", err);
    } finally {
      setIsLoadingParcels(false);
    }
  };

  const loadFloors = async (parcelId: string) => {
    setIsLoadingFloors(true);
    try {
      const data = await FloorService.getByParcel(parcelId);
      setFloors(data || []);
    } catch (err) {
      console.error("Failed to fetch floors:", err);
    } finally {
      setIsLoadingFloors(false);
    }
  };

  const getZoneCenter = (zoneId: string): [number, number] | null => {
    const zone = zones.find((z) => z.id === zoneId);
    if (zone?.geometry?.coordinates) {
      try {
        const polygon = turf.polygon(zone.geometry.coordinates as number[][][]);
        const centroid = turf.centroid(polygon);
        return centroid.geometry.coordinates as [number, number];
      } catch (err) {
        console.error("Failed to calculate zone center", err);
      }
    }
    return null;
  };

  const getParcelCenter = (parcelId: string): [number, number] | null => {
    const parcel = parcels.find((p) => p.id === parcelId);
    if (parcel?.geometry?.coordinates) {
      try {
        const polygon = turf.polygon(
          parcel.geometry.coordinates as number[][][],
        );
        const centroid = turf.centroid(polygon);
        return centroid.geometry.coordinates as [number, number];
      } catch (err) {
        console.error("Failed to calculate parcel center", err);
      }
    }
    return null;
  };

  return {
    zones,
    isLoadingZones,
    parcels,
    isLoadingParcels,
    loadParcels,
    floors,
    isLoadingFloors,
    loadFloors,
    setParcels,
    setFloors,
    getZoneCenter,
    getParcelCenter,
  };
}
