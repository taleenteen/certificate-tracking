import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';

export interface AgencyRecord {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string | null;
  dataSource: 'API' | 'MANUAL_IMPORT';
  apiStatus: 'CONNECTED' | 'MANUAL' | 'DISCONNECTED';
  lastSyncedAt: string | null;
  isActive: boolean;
  licenseTypeCount: number;
  adminCount: number;
  officerCount: number;
  licenseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgencyPayload {
  code: string;
  nameTh: string;
  nameEn?: string;
  dataSource: 'API' | 'MANUAL_IMPORT';
  apiStatus: 'CONNECTED' | 'MANUAL' | 'DISCONNECTED';
}

export interface UpdateAgencyPayload {
  nameTh?: string;
  nameEn?: string;
  dataSource?: 'API' | 'MANUAL_IMPORT';
  apiStatus?: 'CONNECTED' | 'MANUAL' | 'DISCONNECTED';
  isActive?: boolean;
}

const QUERY_KEY = 'agencies';

export function useAgencies() {
  return useQuery<AgencyRecord[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => http.get<AgencyRecord[]>('agencies'),
  });
}

export function useCreateAgency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateAgencyPayload) => http.post<AgencyRecord>('agencies', dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateAgency(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateAgencyPayload) => http.put<AgencyRecord>(`agencies/${id}`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
