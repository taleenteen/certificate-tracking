export interface Pin {
  id: string | number;
  lat: number;
  lng: number;
  type: string;
  title: string;
  subtype?: string; // For info pins
  subtypeNameTh?: string; // Thai name for subtype from API
  label?: string; // For info pins
  // Water specific
  tankId?: string;
  level?: string;
  status?: string;
  // Fire specific
  temp?: string;
  alert?: string;
  // Camera specific
  viewers?: number;
  location?: string;
  time?: string;
  alertMessage?: string;
  // Monitoring specific
  meterId?: string;
  provider?: string;
  // location and status are already in Camera/Water definitions or can be reused
  // Tax specific
  propertyId?: string;
  propertyType?: string;
  owner?: string;
  address?: string;
  appraisalValue?: string;
  taxStatus?: string;
  taxAmount?: string;
  dueDate?: string;
}
