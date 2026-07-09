import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';

export interface BusinessMapFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: {
    id: string;
    nameTh: string;
    address: string;
    province: string;
    lat: number;
    lng: number;
    licenseCount: number;
    licenseStatus: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'REVOKED' | 'PENDING' | null;
    primaryLicense: {
      id: string;
      licenseNo: string;
      status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'REVOKED' | 'PENDING';
      typeCode: string;
      typeNameTh: string;
    } | null;
    statusCounts: {
      active: number;
      suspended: number;
      expired: number;
      pending: number;
      revoked: number;
    };
    ownership: {
      type: 'INDIVIDUAL' | 'JURISTIC';
      labelTh: string;
      contextId: string | null;
      displayNameTh: string;
      registrationId: string | null;
    };
  };
}

export interface BusinessMapResponse {
  type: 'FeatureCollection';
  features: BusinessMapFeature[];
}

export function licenseStatusToColor(status: string | null): string {
  if (status === 'ACTIVE') return '#3D9A80';      // green
  if (status === 'SUSPENDED') return '#D97706';    // amber
  if (status === 'EXPIRED') return '#D1554A';      // red
  return '#94A3B8';                                // slate (unknown/null/revoked/pending)
}

export function useBusinessesMap(province?: string) {
  const path = province
    ? `businesses/map?province=${encodeURIComponent(province)}`
    : 'businesses/map';

  return useQuery({
    queryKey: ['businesses-map', province ?? 'all'],
    queryFn: () => http.get<BusinessMapResponse>(path),
    staleTime: 60_000,
  });
}
