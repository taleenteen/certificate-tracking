import * as Icons from "@/components/icons/PinIcons";
import { IconProps } from "@/components/icons/IconWrapper";

export const PIN_ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  // 1. Infrastructure
  municipal_office: Icons.MunicipalOfficeIcon,
  school: Icons.SchoolIcon,
  health_center: Icons.HealthCenterIcon,
  fire_station: Icons.FireStationIcon,

  // 2. Asset
  street_light: Icons.StreetLightIcon,
  garbage_truck: Icons.GarbageTruckIcon,
  cctv: Icons.CCTVIcon,
  iot_gateway: Icons.IoTGatewayIcon,
  // fire_truck is in guide but I don't see it in generated icons.
  // checking script: 2-2 is garbage truck.
  // 2-2(trash) is old garbage truck.
  // missing fire_truck?
  // Let's check the file list again.
  // File list: 2-1, 2-2, 2-3, 2-4.
  // Guide: street_light, cctv, iot_gateway, fire_truck, garbage_truck. (5 items)
  // Files: 4 items.
  // I'll map what I have.

  // 3. Service Point
  trash_bin: Icons.TrashBinIcon,
  bus_stop: Icons.BusStopIcon,
  water_dispenser: Icons.WaterDispenserIcon,
  public_toilet: Icons.PublicToiletIcon,
  // sports_field missing in files (only 4 files found in 3-x).

  // 4. Environment
  park: Icons.ParkIcon,
  water_source: Icons.WaterSourceIcon,
  pollution_risk: Icons.PollutionRiskIcon,
  air_quality: Icons.AirQualityIcon,

  // 5. Risk
  flood_zone: Icons.FloodZoneIcon,
  accident_risk: Icons.AccidentRiskIcon,
  fire_risk: Icons.FireRiskIcon,
  shelter: Icons.ShelterIcon,

  // 6. Economy
  market: Icons.MarketIcon,
  otop: Icons.OTOPIcon,
  tourist_spot: Icons.TouristSpotIcon,
  hotel: Icons.HotelIcon,

  // 7. Admin
  construction: Icons.ConstructionIcon,
  budget_tracking: Icons.BudgetTrackingIcon,
  kpi_monitor: Icons.KPIMonitorIcon,
  complaint: Icons.ComplaintIcon,
};

export const PIN_SUBTYPE_COLORS: Record<
  string,
  { color: string; hoverColor: string }
> = {
  // 1. Infrastructure (Brown)
  municipal_office: { color: "#b45309", hoverColor: "#78350f" },
  school: { color: "#b45309", hoverColor: "#78350f" },
  health_center: { color: "#b45309", hoverColor: "#78350f" },
  fire_station: { color: "#b45309", hoverColor: "#78350f" },

  // 2. Asset (Blue)
  street_light: { color: "#2563eb", hoverColor: "#1e3a8a" },
  garbage_truck: { color: "#2563eb", hoverColor: "#1e3a8a" },
  cctv: { color: "#2563eb", hoverColor: "#1e3a8a" },
  iot_gateway: { color: "#2563eb", hoverColor: "#1e3a8a" },

  // 3. Service Point (Yellow)
  trash_bin: { color: "#ca8a04", hoverColor: "#854d0e" },
  bus_stop: { color: "#ca8a04", hoverColor: "#854d0e" },
  water_dispenser: { color: "#ca8a04", hoverColor: "#854d0e" },
  public_toilet: { color: "#ca8a04", hoverColor: "#854d0e" },

  // 4. Environment (Green)
  park: { color: "#16a34a", hoverColor: "#14532d" },
  water_source: { color: "#16a34a", hoverColor: "#14532d" },
  pollution_risk: { color: "#16a34a", hoverColor: "#14532d" },
  air_quality: { color: "#16a34a", hoverColor: "#14532d" },

  // 5. Risk (Red)
  flood_zone: { color: "#dc2626", hoverColor: "#991b1b" },
  accident_risk: { color: "#dc2626", hoverColor: "#991b1b" },
  fire_risk: { color: "#dc2626", hoverColor: "#991b1b" },
  shelter: { color: "#dc2626", hoverColor: "#991b1b" },

  // 6. Economy (Orange)
  market: { color: "#ea580c", hoverColor: "#9a3412" },
  otop: { color: "#ea580c", hoverColor: "#9a3412" },
  tourist_spot: { color: "#ea580c", hoverColor: "#9a3412" },
  hotel: { color: "#ea580c", hoverColor: "#9a3412" },

  // 7. Admin/Management (Purple)
  construction: { color: "#9333ea", hoverColor: "#6b21a8" },
  budget_tracking: { color: "#9333ea", hoverColor: "#6b21a8" },
  kpi_monitor: { color: "#9333ea", hoverColor: "#6b21a8" },
  complaint: { color: "#9333ea", hoverColor: "#6b21a8" },
};
