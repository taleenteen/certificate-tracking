import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';

export interface BusinessLicense {
  id: string;
  licenseNumber: string;
  licenseNo?: string;
  status: string;
  issuedAt: string;
  expiresAt: string | null;
  previewUrl?: string | null;
  licenseType: { id: string; code: string; nameTh: string; nameEn: string; agencyId: string };
}

export interface BusinessSummary {
  id: string;
  nameTh: string;
  address: string;
  province: string | null;
  latitude: number | null;
  longitude: number | null;
  licenses: BusinessLicense[];
}

export interface BusinessListResponse {
  data: BusinessSummary[];
  meta: { page: number; limit: number; total: number };
}

export interface BusinessDetailResponse {
  id: string;
  nameTh: string;
  address: string;
  province: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  zone: { id: string; name: string } | null;
  licenses: BusinessLicense[];
  ownership?: {
    type: 'INDIVIDUAL' | 'JURISTIC';
    labelTh: string;
    contextId: string | null;
    displayNameTh: string;
    registrationId: string | null;
  };
}

export function useBusinesses(query: string, hasFilters?: boolean) {
  return useQuery({
    queryKey: ['businesses', query],
    queryFn: () =>
      http.get<BusinessListResponse>(
        query ? `businesses?q=${encodeURIComponent(query)}&limit=50` : 'businesses?limit=50',
      ),
    enabled: query.length > 0 || !!hasFilters,
  });
}

/**
 * Lightweight suggestions for navbar search dropdowns (e-map / businesses).
 * Debounce the query in the caller before enabling.
 */
export function useBusinessSearchSuggestions(
  query: string,
  options?: { enabled?: boolean; limit?: number },
) {
  const q = query.trim();
  const limit = options?.limit ?? 8;
  const enabled = (options?.enabled ?? true) && q.length >= 1;

  return useQuery({
    queryKey: ['business-search-suggestions', q, limit],
    queryFn: () =>
      http.get<BusinessListResponse>(
        `businesses?q=${encodeURIComponent(q)}&limit=${limit}`,
      ),
    enabled,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useAdminBusinesses(query?: string) {
  return useQuery({
    queryKey: ['admin-businesses', query ?? ''],
    queryFn: () =>
      http.get<BusinessListResponse>(
        query ? `businesses?q=${encodeURIComponent(query)}&limit=50` : 'businesses?limit=50',
      ),
  });
}

export function useBusiness(id: string) {
  return useQuery({
    queryKey: ['business', id],
    queryFn: () => http.get<BusinessDetailResponse>(`businesses/${id}`),
    enabled: !!id,
  });
}

export interface JuristicBusinessDetailResponse {
  id: string;
  nameTh: string;
  address: string;
  province: string;
  latitude: string | null;
  longitude: string | null;
  phone: string | null;
  email: string | null;
  zone: {
    id: string;
    code: string;
    nameTh: string;
    province: string;
  } | null;
  juristic: {
    id: string;
    nameTh: string;
    nameEn: string | null;
    registrationId: string;
    myRole: string;
  };
  licenseSummary: {
    total: number;
    active: number;
    suspended: number;
    expired: number;
    pending: number;
    revoked: number;
  };
  licenses: {
    id: string;
    licenseNumber: string;
    issuedAt: string;
    expiresAt: string | null;
    status: string;
    suspendedAt: string | null;
    suspensionReason: string | null;
    licenseType: {
      id: string;
      code: string;
      nameTh: string;
      nameEn: string;
      agency: string;
    };
  }[];
}

export function useJuristicBusiness(id: string) {
  return useQuery({
    queryKey: ['my-juristic-business', id],
    queryFn: () => http.get<JuristicBusinessDetailResponse>(`my/juristic-businesses/${id}`),
    enabled: !!id,
  });
}
