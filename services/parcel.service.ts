import { cloneMock, mockParcels } from "./mock-map-data";

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
    const parcels = params?.zoneId
      ? mockParcels.filter((parcel) => parcel.zoneId === params.zoneId)
      : mockParcels;
    return cloneMock(parcels);
  },

  getById: async (id: string) => {
    const parcel = mockParcels.find((item) => item.id === id);
    if (!parcel) throw new Error("Parcel not found");
    return cloneMock(parcel);
  },

  getByZone: async (zoneId: string) => {
    return cloneMock(mockParcels.filter((parcel) => parcel.zoneId === zoneId));
  },

  create: async (data: CreateParcelDto) => {
    const now = new Date().toISOString();
    const parcel: ApiParcel = {
      id: `parcel-${Date.now()}`,
      type: data.type ?? ParcelType.MIXED_USE,
      status: data.status ?? ParcelStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
      ...data,
      geometry: data.geometry
        ? { ...data.geometry, id: `geom-parcel-${Date.now()}` }
        : undefined,
    };
    mockParcels.unshift(parcel);
    return cloneMock(parcel);
  },

  update: async (id: string, data: Partial<CreateParcelDto>) => {
    const index = mockParcels.findIndex((item) => item.id === id);
    if (index === -1) throw new Error("Parcel not found");

    const updated = {
      ...mockParcels[index],
      ...data,
      geometry: data.geometry
        ? { ...data.geometry, id: mockParcels[index].geometry?.id || id }
        : mockParcels[index].geometry,
      updatedAt: new Date().toISOString(),
    };
    mockParcels[index] = updated;
    return cloneMock(updated);
  },

  delete: async (id: string) => {
    const index = mockParcels.findIndex((item) => item.id === id);
    if (index !== -1) {
      mockParcels.splice(index, 1);
    }
  },
};
