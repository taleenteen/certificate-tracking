import { ApiClient } from "./api-client";

// Parcel types matching backend
export enum ParcelType {
  RESIDENTIAL = "RESIDENTIAL",
  COMMERCIAL = "COMMERCIAL",
  INDUSTRIAL = "INDUSTRIAL",
  AGRICULTURAL = "AGRICULTURAL",
  GOVERNMENT = "GOVERNMENT",
  MIXED_USE = "MIXED_USE",
}

export enum ParcelStatus {
  ACTIVE = "ACTIVE",
  VACANT = "VACANT",
  UNDER_CONSTRUCTION = "UNDER_CONSTRUCTION",
  PENDING_APPROVAL = "PENDING_APPROVAL",
}

export interface ParcelGeometry {
  type: "POLYGON";
  coordinates: number[][][]; // GeoJSON polygon format
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
}

export interface CreateParcelDto {
  name: string;
  address?: string;
  description?: string;
  type?: ParcelType;
  status?: ParcelStatus;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  areaSize?: number; // ตร.ม.
  landTitle?: string; // เลขโฉนด
  strokeStyle?: string; // "dashed" | "solid" | "dotted"
  strokeColor?: string;
  fillColor?: string;
  fillOpacity?: number;
  zoneId: string; // required
  geometry?: ParcelGeometry;
}

export interface ApiParcel {
  id: string;
  name: string;
  address?: string;
  description?: string;
  type: ParcelType;
  status: ParcelStatus;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  areaSize?: number;
  landTitle?: string;
  strokeStyle?: string;
  strokeColor?: string;
  fillColor?: string;
  fillOpacity?: number;
  zoneId: string;
  geometry?: ParcelGeometry & { id: string };
  _count?: { floors: number; pins: number };
  createdAt: string;
  updatedAt: string;
}

export const ParcelService = {
  getAll: async (params?: { zoneId?: string }) => {
    const queryString = params?.zoneId ? `?zoneId=${params.zoneId}` : "";
    const response = await ApiClient.get<{ data: ApiParcel[] }>(
      `/parcels${queryString}`,
    );
    return response.data || response;
  },

  getById: async (id: string) => {
    return ApiClient.get<ApiParcel>(`/parcels/${id}`);
  },

  getByZone: async (zoneId: string) => {
    const response = await ApiClient.get<{ data: ApiParcel[] }>(
      `/parcels/by-zone/${zoneId}`,
    );
    return response.data || response;
  },

  create: async (data: CreateParcelDto) => {
    return ApiClient.post<ApiParcel>("/parcels", data);
  },

  update: async (id: string, data: Partial<CreateParcelDto>) => {
    return ApiClient.patch<ApiParcel>(`/parcels/${id}`, data);
  },

  delete: async (id: string) => {
    return ApiClient.delete<void>(`/parcels/${id}`);
  },
};
