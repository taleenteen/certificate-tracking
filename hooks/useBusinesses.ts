import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';

export interface BusinessLicense {
  id: string;
  licenseNumber: string;
  status: string;
  issuedAt: string;
  expiresAt: string | null;
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
  zone: { id: string; name: string } | null;
  licenses: BusinessLicense[];
}

export function useBusinesses(query: string) {
  return useQuery({
    queryKey: ['businesses', query],
    queryFn: () =>
      http.get<BusinessListResponse>(
        query ? `businesses?q=${encodeURIComponent(query)}&limit=20` : 'businesses?limit=20',
      ),
    enabled: query.length > 0,
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
