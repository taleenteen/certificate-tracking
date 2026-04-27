import { cloneMock, mockFloors } from "./mock-map-data";

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
    const floors = params?.parcelId
      ? mockFloors.filter((floor) => floor.parcelId === params.parcelId)
      : mockFloors;
    return cloneMock(floors);
  },

  getById: async (id: string) => {
    const floor = mockFloors.find((item) => item.id === id);
    if (!floor) throw new Error("Floor not found");
    return cloneMock(floor);
  },

  getByParcel: async (parcelId: string) => {
    return cloneMock(mockFloors.filter((floor) => floor.parcelId === parcelId));
  },

  create: async (data: CreateFloorDto) => {
    const now = new Date().toISOString();
    const floor: ApiFloor = {
      id: `floor-${Date.now()}`,
      type: data.type ?? FloorType.GROUND,
      createdAt: now,
      updatedAt: now,
      ...data,
    };
    mockFloors.unshift(floor);
    return cloneMock(floor);
  },

  update: async (id: string, data: Partial<CreateFloorDto>) => {
    const index = mockFloors.findIndex((item) => item.id === id);
    if (index === -1) throw new Error("Floor not found");

    const updated = {
      ...mockFloors[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    mockFloors[index] = updated;
    return cloneMock(updated);
  },

  delete: async (id: string) => {
    const index = mockFloors.findIndex((item) => item.id === id);
    if (index !== -1) {
      mockFloors.splice(index, 1);
    }
  },
};
