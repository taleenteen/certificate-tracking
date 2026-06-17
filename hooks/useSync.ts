import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';

export interface SyncStatusRecord {
  id: string;
  agencyId: string;
  agency: { id: string; code: string; nameTh: string; apiStatus: string; lastSyncedAt: string | null };
  status: 'RUNNING' | 'SUCCESS' | 'FAILED';
  recordsUpdated: number;
  startedAt: string;
  finishedAt: string | null;
  errorMessage: string | null;
}

export function useSyncStatus() {
  return useQuery<SyncStatusRecord[]>({
    queryKey: ['sync-status'],
    queryFn: () => http.get<SyncStatusRecord[]>('sync/status'),
    refetchInterval: 30_000,
  });
}

export function useTriggerDiwImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => http.post<{ jobId: string }>('sync/import/diw'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sync-status'] }),
  });
}
