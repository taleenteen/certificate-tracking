import { ApiClient } from "./api-client";

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
    const response = await ApiClient.get<{ data: ApiZone[] }>("/zones");
    return response.data || response;
  },

  getById: async (id: string) => {
    return ApiClient.get<ApiZone>(`/zones/${id}`);
  },

  create: async (data: CreateZoneDto) => {
    return ApiClient.post<ApiZone>("/zones", data);
  },

  update: async (id: string, data: Partial<CreateZoneDto>) => {
    return ApiClient.patch<ApiZone>(`/zones/${id}`, data);
  },

  delete: async (id: string) => {
    return ApiClient.delete<void>(`/zones/${id}`);
  },

  getPinsInZone: async (id: string) => {
    return ApiClient.get<any[]>(`/zones/${id}/pins`);
  },
};
