import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';

export interface LicenseTypeRecord {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string | null;
  agencyId: string;
  validityYears: number;
  requiresInspection: boolean;
  suspendedOnNonpayment: boolean;
  description: string | null;
  isActive: boolean;
}

export interface CreateLicenseTypePayload {
  code: string;
  nameTh: string;
  nameEn?: string;
  agencyId: string;
  validityYears: number;
  requiresInspection?: boolean;
  suspendedOnNonpayment?: boolean;
  description?: string;
}

export interface UpdateLicenseTypePayload {
  nameTh?: string;
  nameEn?: string;
  agencyId?: string;
  validityYears?: number;
  requiresInspection?: boolean;
  suspendedOnNonpayment?: boolean;
  description?: string;
  isActive?: boolean;
}

const QUERY_KEY = 'license-types';

export function useLicenseTypes() {
  return useQuery<LicenseTypeRecord[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => http.get<LicenseTypeRecord[]>('license-types'),
  });
}

export function useCreateLicenseType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateLicenseTypePayload) => http.post<LicenseTypeRecord>('license-types', dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateLicenseType(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateLicenseTypePayload) => http.put<LicenseTypeRecord>(`license-types/${id}`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
