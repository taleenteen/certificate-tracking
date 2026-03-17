// 8 หมวดหมู่ Pin ตาม FRONTEND_BRIEF
export enum PinCategory {
  INFRASTRUCTURE = "INFRASTRUCTURE", // โครงสร้างพื้นฐาน
  ASSET = "ASSET", // ครุภัณฑ์
  SERVICE_POINT = "SERVICE_POINT", // จุดบริการ
  ENVIRONMENT = "ENVIRONMENT", // สิ่งแวดล้อม
  RISK = "RISK", // ความเสี่ยง
  ECONOMY = "ECONOMY", // เศรษฐกิจ
  MANAGEMENT = "MANAGEMENT", // ข้อมูลบริหาร
  DEVICE = "DEVICE", // อุปกรณ์ IoT (e-Service)
  SOLAR = "SOLAR", // โซล่าเซลล์
  MONITORING = "MONITORING", // ระบบ Monitoring
}

// PinType ใช้สำหรับ Device pins
export enum PinType {
  WATER = "WATER",
  FIRE = "FIRE",
  CAMERA = "CAMERA",
  SOLAR = "SOLAR",
  TAX = "TAX",
  INFO = "INFO",
  INFRASTRUCTURE = "INFRASTRUCTURE",
  MONITORING = "MONITORING",
}

export enum PinStatus {
  NORMAL = "NORMAL",
  WARNING = "WARNING",
  DANGER = "DANGER",
  MAINTENANCE = "MAINTENANCE",
  OFFLINE = "OFFLINE",
}

export enum GeometryType {
  POINT = "POINT",
  POLYGON = "POLYGON",
  LINESTRING = "LINESTRING",
}

export enum ZoneType {
  WATER_ZONE = "WATER_ZONE",
  FIRE_ZONE = "FIRE_ZONE",
  CAMERA_ZONE = "CAMERA_ZONE",
}

export enum AlertType {
  HIGH = "HIGH",
  LOW = "LOW",
}

export interface GeometryDto {
  type: GeometryType;
  coordinates: unknown; // GeoJSON coordinates
  lat?: number;
  lng?: number;
}

export interface CreatePinDto {
  title: string;
  dataId?: string;
  description?: string;
  category: PinCategory; // Added category
  type: PinType;
  subtype?: string;
  tags?: string[];
  status?: PinStatus;
  isPublic?: boolean;
  geometry: GeometryDto;
  attributes?: Record<string, unknown>;
  images?: string[];
  zoneId?: string; // Optional zone association
}

export type UpdatePinDto = Partial<CreatePinDto>;

export interface ApiPin {
  id: string;
  dataId?: string;
  title: string;
  description?: string;
  category: PinCategory; // Added category
  type: PinType;
  subtype?: string;
  subtypeNameTh?: string;
  tags: string[];
  status: PinStatus;
  isPublic: boolean;
  geometry?: {
    type: GeometryType;
    coordinates: unknown;
    lat?: number;
    lng?: number;
  };
  attributes?: Record<string, unknown>;
  images: string[];
  zoneId?: string;
  parcelId?: string;
  floorId?: string;
  createdAt: string;
  updatedAt: string;
}

// ============ Zone Types ============

export interface ZoneGeometryDto {
  type: GeometryType;
  coordinates: unknown; // GeoJSON polygon coordinates
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
}

export interface CreateZoneDto {
  name: string;
  description?: string;
  // type removed
  color?: string; // Hex color for MapBox styling
  isActive?: boolean;
  geometry?: ZoneGeometryDto;
}

export interface ApiZone {
  id: string;
  name: string;
  description?: string;
  type?: ZoneType;
  color?: string;
  isActive: boolean;
  geometry?: ZoneGeometryDto;
  pins?: ApiPin[];
  createdAt: string;
  updatedAt: string;
}

// ============ Water Tank Types ============

export interface CreateWaterTankDto {
  name: string;
  description?: string;
  capacity: number; // liters
  shape: string; // "CYLINDER", "RECTANGLE"
  dimensions?: {
    diameter?: number;
    height?: number;
    width?: number;
    length?: number;
  };
  pinId?: string;
}

export interface ApiWaterTank {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  shape: string;
  dimensions?: Record<string, number>;
  pinId?: string;
  pin?: ApiPin;
  createdAt: string;
  updatedAt: string;
}

// ============ Water Sensor Reading Types ============

export interface CreateReadingDto {
  tankId: string;
  // Water Quality
  ph?: number;
  turbidity?: number; // NTU
  freeChlorine?: number; // mg/L
  dissolvedOxygen?: number; // mg/L
  conductivity?: number; // µS/cm (EC)
  temperature?: number; // °C
  // Water Quantity
  waterLevel?: number; // cm
  waterVolume?: number; // liters
  volumePercent?: number; // %
  pressure?: number; // bar
  flowRate?: number; // L/min
}

export interface ApiWaterReading {
  id: string;
  tankId: string;
  tank?: { id: string; name: string };
  ph?: number;
  turbidity?: number;
  freeChlorine?: number;
  dissolvedOxygen?: number;
  conductivity?: number;
  temperature?: number;
  waterLevel?: number;
  waterVolume?: number;
  volumePercent?: number;
  pressure?: number;
  flowRate?: number;
  recordedAt: string;
}

// ============ Water Threshold Types ============

export interface CreateThresholdDto {
  tankId: string;
  parameter: string; // "ph", "turbidity", "waterLevel", etc.
  minValue?: number;
  maxValue?: number;
  isActive?: boolean;
}

export interface ApiWaterThreshold {
  id: string;
  tankId: string;
  tank?: { id: string; name: string };
  parameter: string;
  minValue?: number;
  maxValue?: number;
  isActive: boolean;
}

// ============ Water Alert Types ============

export interface ApiWaterAlert {
  id: string;
  thresholdId: string;
  threshold?: {
    parameter: string;
    tank?: { id: string; name: string };
  };
  alertType: AlertType;
  value: number;
  message?: string;
  isAcknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  createdAt: string;
}

// ============ Pump Types ============

export type PumpControlType = "MANUAL" | "AUTO" | "REMOTE";

export interface ApiPump {
  id: string;
  name: string;
  tankId: string;
  canControl: boolean;
  controlType?: PumpControlType;
  isRunning: boolean;
  deviceId?: string;
  todayVolume?: number;
  totalVolume?: number;
  lastToggleAt?: string;
  lastToggleBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TogglePumpResponse {
  pump: ApiPump;
  message: string;
}

export interface PumpStats {
  id: string;
  name: string;
  isRunning: boolean;
  todayVolume: number;
  totalVolume: number;
  lastToggleAt?: string;
  canControl: boolean;
  controlType?: PumpControlType;
}
