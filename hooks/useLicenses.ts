import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
export type LicenseStatusUpdate = 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'EXPIRED' | 'PENDING';
import { http } from '@/lib/http';
import { useAuthStore } from '@/stores/auth';

export type LicenseStatus = 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'REVOKED' | 'PENDING';

export interface LicenseResponse {
  id: string;
  licenseNumber: string;
  issuedAt: string;
  expiresAt: string | null;
  status: LicenseStatus;
  previewUrl?: string | null;
  licenseType: {
    id: string;
    code: string;
    nameTh: string;
    nameEn: string;
    agency: string;
  };
  business: {
    id: string;
    nameTh: string;
    registrationId: string;
  };
}

export function useLicenses() {
  const activeJuristicId = useAuthStore((s) => s.activeJuristicId);

  return useQuery({
    queryKey: ['my-licenses', activeJuristicId ?? 'personal'],
    queryFn: () => http.get<LicenseResponse[]>('my/licenses'),
  });
}

export interface CitizenLicensesSearchFilters {
  q?: string;
  licenseNumber?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CitizenLicensesSearchResponse {
  data: LicenseResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export function useCitizenLicensesSearch(filters: CitizenLicensesSearchFilters, enabled: boolean) {
  const queryParams = new URLSearchParams();
  if (filters.q) queryParams.set("q", filters.q);
  if (filters.licenseNumber) queryParams.set("licenseNumber", filters.licenseNumber);
  if (filters.status) queryParams.set("status", filters.status);
  if (filters.page) queryParams.set("page", String(filters.page));
  if (filters.limit) queryParams.set("limit", String(filters.limit));

  return useQuery({
    queryKey: ["citizen-licenses-search", filters],
    queryFn: () => http.get<CitizenLicensesSearchResponse>(`licenses/search?${queryParams.toString()}`),
    enabled: enabled,
  });
}

export interface CitizenLicensesSearchGroupedResponse {
  data: {
    id: string;
    nameTh: string;
    address: string;
    province: string;
    latitude: string;
    longitude: string;
    juristic?: {
      id: string;
      nameTh: string;
      registrationId: string;
    };
    ownership?: {
      mode: string;
    };
    licenseCount: number;
    licenses: {
      id: string;
      licenseNumber: string;
      status: LicenseStatus;
      issuedAt: string;
      expiresAt: string | null;
      licenseType: {
        id: string;
        code: string;
        nameTh: string;
        agency: {
          id: string;
          code: string;
          nameTh: string;
        };
      };
      previewUrl?: string | null;
    }[];
  }[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

// VERSION NOTE: There are 2 versions of citizen license search:
// 1. Flattened list: useCitizenLicensesSearch (GET /api/licenses/search)
// 2. Grouped by business: useCitizenLicensesSearchGrouped (GET /api/licenses/search/grouped-by-business)
// Currently, we use the Grouped version (Version 2) as requested.
export function useCitizenLicensesSearchGrouped(filters: CitizenLicensesSearchFilters, enabled: boolean) {
  const queryParams = new URLSearchParams();
  if (filters.q) queryParams.set("q", filters.q);
  if (filters.licenseNumber) queryParams.set("licenseNumber", filters.licenseNumber);
  if (filters.status) queryParams.set("status", filters.status);
  if (filters.page) queryParams.set("page", String(filters.page));
  if (filters.limit) queryParams.set("limit", String(filters.limit));

  return useQuery({
    queryKey: ["citizen-licenses-search-grouped", filters],
    queryFn: () => http.get<CitizenLicensesSearchGroupedResponse>(`licenses/search/grouped-by-business?${queryParams.toString()}`),
    enabled: enabled,
  });
}

export function useUpdateLicenseStatus(licenseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { status: LicenseStatusUpdate; note?: string }) =>
      http.patch(`licenses/${licenseId}/status`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-licenses'] });
      qc.invalidateQueries({ queryKey: ['license', licenseId] });
    },
  });
}

export function useDevSeedLicense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => http.post<LicenseResponse>('my/dev/seed-license'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-licenses'] });
      qc.invalidateQueries({ queryKey: ['businesses-map'] });
    },
  });
}

export interface DevSeedDemoDataResponse {
  success: boolean;
  personal: {
    businessId: string;
    licenseIds: string[];
  };
  juristic: {
    juristicId: string;
    businessIds: string[];
    licenseIds: string[];
    corporateLicenseIds: string[];
  };
  messageTh: string;
}

export function useDevSeedDemoData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => http.post<DevSeedDemoDataResponse>('my/dev/seed-demo-data'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-licenses'] });
      qc.invalidateQueries({ queryKey: ['my-juristic-license-groups'] });
      qc.invalidateQueries({ queryKey: ['my-juristic-memberships'] });
      qc.invalidateQueries({ queryKey: ['businesses-map'] });
    },
  });
}

export interface JuristicMembershipResponse {
  juristicId: string;
  nameTh: string;
  nameEn?: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  position?: string;
  joinedAt: string;
}

export function useJuristicMemberships() {
  return useQuery({
    queryKey: ['my-juristic-memberships'],
    queryFn: () => http.get<JuristicMembershipResponse[]>('juristic'),
  });
}

export interface JuristicLicenseGroupResponse {
  juristicId: string;
  nameTh: string;
  nameEn?: string;
  registrationId: string;
  myRole: string;
  businessCount: number;
  corporateLicenseCount: number;
  businessLicenseCount: number;
  licenseCount: number;
  corporateLicenses: {
    id: string;
    licenseNumber: string;
    issuedAt: string;
    expiresAt: string | null;
    status: LicenseStatus;
    previewUrl?: string | null;
    licenseType: {
      id: string;
      code: string;
      nameTh: string;
      nameEn: string;
      agency: string;
    };
  }[];
  businesses: {
    id: string;
    nameTh: string;
    province: string;
    licenseCount: number;
    licenses: {
      id: string;
      licenseNumber: string;
      issuedAt: string;
      expiresAt: string | null;
      status: LicenseStatus;
      previewUrl?: string | null;
      licenseType: {
        id: string;
        code: string;
        nameTh: string;
        nameEn: string;
        agency: string;
      };
    }[];
  }[];
}

export function useJuristicLicenseGroups() {
  return useQuery({
    queryKey: ['my-juristic-license-groups'],
    queryFn: () => http.get<JuristicLicenseGroupResponse[]>('my/juristic-license-groups'),
  });
}

export function useDevSeedJuristicLicense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => http.post<{ success: boolean }>('my/dev/seed-juristic-license-demo'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-juristic-license-groups'] });
      qc.invalidateQueries({ queryKey: ['my-juristic-memberships'] });
      qc.invalidateQueries({ queryKey: ['businesses-map'] });
    },
  });
}
