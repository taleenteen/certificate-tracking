import { cloneMock, mockPins, mockZones } from "./mock-map-data";

// Zone types matching backend
export enum ZoneType {
  WATER_ZONE = "WATER_ZONE",
  FIRE_ZONE = "FIRE_ZONE",
  CAMERA_ZONE = "CAMERA_ZONE",
}

export interface ZoneGeometry {
  type: "POLYGON";
  coordinates: number[][][]; // GeoJSON polygon format
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
}

export interface CreateZoneDto {
  name: string;
  description?: string;
  type?: ZoneType;
  color?: string;
  isActive?: boolean;
  siteId?: string;
  geometry?: ZoneGeometry;
}

export interface ApiZone {
  id: string;
  name: string;
  description?: string;
  type?: ZoneType;
  color?: string;
  isActive: boolean;
  siteId?: string;
  geometry?: ZoneGeometry & { id: string };
  _count?: { pins: number };
  createdAt: string;
  updatedAt: string;
}

export const ZoneService = {
  getAll: async () => {
    return cloneMock(mockZones);
  },

  getById: async (id: string) => {
    const zone = mockZones.find((item) => item.id === id);
    if (!zone) throw new Error("Zone not found");
    return cloneMock(zone);
  },

  create: async (data: CreateZoneDto) => {
    const now = new Date().toISOString();
    const zone: ApiZone = {
      id: `zone-${Date.now()}`,
      name: data.name,
      description: data.description,
      type: data.type,
      color: data.color,
      isActive: data.isActive ?? true,
      siteId: data.siteId,
      geometry: data.geometry
        ? { ...data.geometry, id: `geom-zone-${Date.now()}` }
        : undefined,
      _count: { pins: 0 },
      createdAt: now,
      updatedAt: now,
    };
    mockZones.unshift(zone);
    return cloneMock(zone);
  },

  update: async (id: string, data: Partial<CreateZoneDto>) => {
    const index = mockZones.findIndex((item) => item.id === id);
    if (index === -1) throw new Error("Zone not found");

    const updated = {
      ...mockZones[index],
      ...data,
      geometry: data.geometry
        ? { ...data.geometry, id: mockZones[index].geometry?.id || id }
        : mockZones[index].geometry,
      updatedAt: new Date().toISOString(),
    };
    mockZones[index] = updated;
    return cloneMock(updated);
  },

  delete: async (id: string) => {
    const index = mockZones.findIndex((item) => item.id === id);
    if (index !== -1) {
      mockZones.splice(index, 1);
    }
  },

  getPinsInZone: async (id: string) => {
    return cloneMock(mockPins.filter((pin) => pin.zoneId === id));
  },
};
