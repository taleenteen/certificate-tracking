import { ApiClient } from "./api-client";

// Floor types matching backend
export enum FloorType {
  GROUND = "GROUND",
  UPPER = "UPPER",
  BASEMENT = "BASEMENT",
  ROOFTOP = "ROOFTOP",
}

export interface CreateFloorDto {
  level: number; // 1, 2, 3...
  name?: string; // "ชั้น 1", "ดาดฟ้า"
  description?: string;
  type?: FloorType;
  areaSize?: number; // พื้นที่ใช้สอย (ตร.ม.)
  height?: number; // ความสูง (ม.)
  parcelId: string; // required
}

export interface ApiFloor {
  id: string;
  level: number;
  name?: string;
  description?: string;
  type: FloorType;
  areaSize?: number;
  height?: number;
  parcelId: string;
  _count?: { pins: number };
  createdAt: string;
  updatedAt: string;
}

export const FloorService = {
  getAll: async (params?: { parcelId?: string }) => {
    const queryString = params?.parcelId ? `?parcelId=${params.parcelId}` : "";
    const response = await ApiClient.get<{ data: ApiFloor[] }>(
      `/floors${queryString}`,
    );
    return response.data || response;
  },

  getById: async (id: string) => {
    return ApiClient.get<ApiFloor>(`/floors/${id}`);
  },

  getByParcel: async (parcelId: string) => {
    const response = await ApiClient.get<{ data: ApiFloor[] }>(
      `/floors/by-parcel/${parcelId}`,
    );
    return response.data || response;
  },

  create: async (data: CreateFloorDto) => {
    return ApiClient.post<ApiFloor>("/floors", data);
  },

  update: async (id: string, data: Partial<CreateFloorDto>) => {
    return ApiClient.patch<ApiFloor>(`/floors/${id}`, data);
  },

  delete: async (id: string) => {
    return ApiClient.delete<void>(`/floors/${id}`);
  },
};
