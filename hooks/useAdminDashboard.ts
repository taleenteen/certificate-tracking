import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';

export interface AdminDashboardData {
  userCounts: Record<string, number>;
  zoneCount: number;
  licenseCounts: Record<string, number>;
  lastSync: Array<{
    id: string;
    agencyId: string;
    agency: { id: string; code: string; nameTh: string };
    status: string;
    recordsUpdated: number;
    startedAt: string;
    finishedAt: string | null;
  }>;
}

export function useAdminDashboard() {
  return useQuery<AdminDashboardData>({
    queryKey: ['admin-dashboard'],
    queryFn: () => http.get<AdminDashboardData>('dashboard/admin'),
    staleTime: 30_000,
  });
}
