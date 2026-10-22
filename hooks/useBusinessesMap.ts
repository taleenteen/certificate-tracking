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

export type BusinessesMapFilters = {
  /** Case-insensitive search on name/address (server-side). */
  q?: string;
  /** Province filter (server-side). */
  province?: string;
  /** License type code (server-side). */
  typeCode?: string;
  /** License status (server-side). */
  status?: string;
};

export function licenseStatusToColor(status: string | null): string {
  if (status === 'ACTIVE') return '#3D9A80'; // green
  if (status === 'SUSPENDED') return '#D97706'; // amber
  if (status === 'EXPIRED') return '#D1554A'; // red
  return '#94A3B8'; // slate (unknown/null/revoked/pending)
}

function buildMapPath(filters: BusinessesMapFilters = {}): string {
  const params = new URLSearchParams();
  const q = filters.q?.trim();
  if (q) params.set('q', q);
  if (filters.province?.trim()) params.set('province', filters.province.trim());
  if (filters.typeCode?.trim()) params.set('typeCode', filters.typeCode.trim());
  if (filters.status?.trim()) params.set('status', filters.status.trim());
  const qs = params.toString();
  return qs ? `businesses/map?${qs}` : 'businesses/map';
}

/**
 * GeoJSON map pins for e-map / map views.
 * Pass `q` / `province` / `typeCode` / `status` to filter server-side.
 */
export function useBusinessesMap(filters: BusinessesMapFilters | string = {}) {
  // Back-compat: older callers passed province as a plain string
  const normalized: BusinessesMapFilters =
    typeof filters === 'string' ? { province: filters } : filters;

  const path = buildMapPath(normalized);
  const queryKey = [
    'businesses-map',
    normalized.q?.trim() || '',
    normalized.province?.trim() || '',
    normalized.typeCode?.trim() || '',
    normalized.status?.trim() || '',
  ] as const;

  return useQuery({
    queryKey,
    queryFn: () => http.get<BusinessMapResponse>(path),
    staleTime: 60_000,
  });
}
