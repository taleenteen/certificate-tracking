import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';

export interface Zone {
  id: string;
  code: string;
  nameTh: string;
  province: string;
  isActive: boolean;
}

export interface CreateZonePayload {
  code: string;
  nameTh: string;
  province: string;
}

export interface UpdateZonePayload {
  nameTh?: string;
  province?: string;
  isActive?: boolean;
}

const QUERY_KEY = 'zones';

export function useZones() {
  return useQuery<Zone[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => http.get<Zone[]>('zones'),
  });
}

export function useCreateZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateZonePayload) => http.post<Zone>('zones', dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateZone(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateZonePayload) => http.put<Zone>(`zones/${id}`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
