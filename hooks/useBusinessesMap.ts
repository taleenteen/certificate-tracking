import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';

export interface BusinessMapFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: {
    id: string;
    nameTh: string;
    lat: number;
    lng: number;
    licenseStatus: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'REVOKED' | 'PENDING' | null;
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
