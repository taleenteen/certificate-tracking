import {
  ApiPin,
  CreatePinDto,
  GeometryType,
  PinStatus,
  UpdatePinDto,
} from "@/types/api";
import { cloneMock, mockPinCategories, mockPins } from "./mock-map-data";

export interface PinFilterParams {
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
  take?: number;
  type?: string;
}

export const PinService = {
  getAll: async (params?: PinFilterParams) => {
    const take = params?.take ?? mockPins.length;
    const filtered = mockPins.filter((pin) => {
      if (params?.type && pin.type !== params.type) return false;

      const coordinates =
        pin.geometry?.type === GeometryType.POINT &&
        Array.isArray(pin.geometry.coordinates)
          ? (pin.geometry.coordinates as [number, number])
          : null;

      if (!coordinates) return true;

      const [lng, lat] = coordinates;
      if (params?.minLat !== undefined && lat < params.minLat) return false;
      if (params?.maxLat !== undefined && lat > params.maxLat) return false;
      if (params?.minLng !== undefined && lng < params.minLng) return false;
      if (params?.maxLng !== undefined && lng > params.maxLng) return false;

      return true;
    });

    return cloneMock(filtered.slice(0, take));
  },

  getById: async (id: string) => {
    const pin = mockPins.find((item) => item.id === id);
    if (!pin) throw new Error("Pin not found");
    return cloneMock(pin);
  },

  create: async (data: CreatePinDto) => {
    const now = new Date().toISOString();
    const pin: ApiPin = {
      id: `pin-${Date.now()}`,
      ...data,
      tags: data.tags ?? [],
      status: data.status ?? PinStatus.NORMAL,
      isPublic: data.isPublic ?? true,
      images: data.images ?? [],
      createdAt: now,
      updatedAt: now,
    };
    mockPins.unshift(pin);
    return cloneMock(pin);
  },

  update: async (id: string, data: UpdatePinDto) => {
    const index = mockPins.findIndex((item) => item.id === id);
    if (index === -1) throw new Error("Pin not found");

    const updated = {
      ...mockPins[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    mockPins[index] = updated;
    return cloneMock(updated);
  },

  delete: async (id: string) => {
    const index = mockPins.findIndex((item) => item.id === id);
    if (index !== -1) {
      mockPins.splice(index, 1);
    }
  },

  getCategories: async () => {
    return cloneMock(mockPinCategories);
  },
};
