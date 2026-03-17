import { PinType, PinCategory } from "@/types/api";

export const DEVICE_TYPE_OPTIONS = [
  { value: PinType.WATER, label: "น้ำ (Water)" },
  { value: PinType.FIRE, label: "ไฟ (Fire)" },
  { value: PinType.CAMERA, label: "กล้อง CCTV" },
  { value: PinType.SOLAR, label: "☀️ โซล่าเซลล์ (Solar)" },
  { value: PinType.MONITORING, label: "⚡️ ระบบ Monitoring" },
];

export interface AttributeConfig {
  label: string;
  key: string;
  defaultValue: string;
  unit?: string;
  group?: string; // e.g., 'quality', 'quantity', 'electrical'
}

export const DEVICE_ATTRIBUTE_CONFIG: Partial<
  Record<PinType, AttributeConfig[]>
> = {
  [PinType.WATER]: [
    {
      label: "ค่า pH",
      key: "ph",
      defaultValue: "7.2",
      unit: "",
      group: "quality",
    },
    {
      label: "ความขุ่น (NTU)",
      key: "turbidity",
      defaultValue: "0.5",
      unit: "NTU",
      group: "quality",
    },
    {
      label: "คลอรีนอิสระ",
      key: "freeChlorine",
      defaultValue: "1.2",
      unit: "mg/L",
      group: "quality",
    },
    {
      label: "ออกซิเจนละลาย",
      key: "dissolvedOxygen",
      defaultValue: "6.5",
      unit: "mg/L",
      group: "quality",
    },
    {
      label: "ค่าความนำไฟฟ้า",
      key: "conductivity",
      defaultValue: "300",
      unit: "µS/cm",
      group: "quality",
    },
    {
      label: "อุณหภูมิน้ำ",
      key: "temperature",
      defaultValue: "28.5",
      unit: "°C",
      group: "quality",
    },
    {
      label: "ระดับน้ำ",
      key: "waterLevel",
      defaultValue: "150",
      unit: "cm",
      group: "quantity",
    },
    {
      label: "ปริมาตรน้ำ",
      key: "waterVolume",
      defaultValue: "5000",
      unit: "ลิตร",
      group: "quantity",
    },
    {
      label: "% ความจุ",
      key: "volumePercent",
      defaultValue: "75",
      unit: "%",
      group: "quantity",
    },
    {
      label: "แรงดันน้ำ",
      key: "pressure",
      defaultValue: "2.5",
      unit: "bar",
      group: "quantity",
    },
    {
      label: "อัตราการไหล",
      key: "flowRate",
      defaultValue: "120",
      unit: "L/min",
      group: "quantity",
    },
    {
      label: "ความจุถังสูงสุด",
      key: "tankCapacity",
      defaultValue: "10000",
      unit: "ลิตร",
      group: "tank",
    },
    {
      label: "รูปทรงถัง",
      key: "tankShape",
      defaultValue: "CYLINDER",
      unit: "",
      group: "tank",
    },
  ],
  [PinType.FIRE]: [
    { label: "อุณหภูมิ (°C)", key: "temp", defaultValue: "32" },
    { label: "ระดับการแจ้งเตือน", key: "alert", defaultValue: "Normal" },
  ],
  [PinType.CAMERA]: [
    { label: "สถานะกล้อง", key: "status", defaultValue: "Online" },
    { label: "ความละเอียด", key: "resolution", defaultValue: "1080p" },
  ],
  [PinType.SOLAR]: [
    {
      label: "พลังงานที่ผลิตได้",
      key: "power_generated",
      defaultValue: "0",
      unit: "kWh",
    },
    {
      label: "กำลังผลิตติดตั้ง",
      key: "installed_capacity",
      defaultValue: "5",
      unit: "kW",
    },
    { label: "ยี่ห้อแผง", key: "brand", defaultValue: "JA Solar" },
    { label: "ยี่ห้อ Inverter", key: "inverter", defaultValue: "-" },
  ],
};

export const INFO_ATTRIBUTE_CONFIG: Partial<
  Record<PinCategory, AttributeConfig[]>
> = {
  [PinCategory.MANAGEMENT]: [
    {
      label: "หน่วยงานที่รับผิดชอบ",
      key: "department",
      defaultValue: "สำนักการช่าง",
    },
    { label: "เบอร์ติดต่อ", key: "contact", defaultValue: "02-xxx-xxxx" },
    { label: "สถานะ", key: "status", defaultValue: "ใช้งานได้ปกติ" },
    {
      label: "การซ่อมบำรุงล่าสุด",
      key: "last_maintenance",
      defaultValue: "2024-01-15",
    },
  ],
};

export const EMPTY_ATTRIBUTES: AttributeConfig[] = [];
