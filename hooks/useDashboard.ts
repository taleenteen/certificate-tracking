import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { useAuthStore } from '@/stores/auth';

// Officer dashboard — personal task counts + zone-level aggregates
export interface OfficerDashboardResponse {
  myPendingTasks: number;
  myInProgress: number;
  myReturnedToFix: number;
  myCompletedThisMonth: number;
  recentTasks: {
    id: string;
    status: string;
    business: { id: string; nameTh: string };
    updatedAt: string;
  }[];
  taskCountsByStatus: Record<string, number>;
  pendingReviewCount: number;
  complianceRate: number;
}

// Admin dashboard — system-wide counts
export interface AdminDashboardResponse {
  userCounts: Record<string, number>;
  zoneCount: number;
  licenseCounts: Record<string, number>;
  lastSync: unknown[];
}

export function primaryRole(roles: string[]): 'admin' | 'officer' | 'public' {
  if (roles.includes('super_admin') || roles.includes('admin')) return 'admin';
  if (roles.includes('officer')) return 'officer';
  return 'public';
}

export function effectivePrimaryRole(
  roles: string[],
  activePortalMode?: 'public' | 'officer' | null,
): 'admin' | 'officer' | 'public' {
  if (roles.includes('super_admin') || roles.includes('admin')) return 'admin';
  if (roles.includes('officer') && activePortalMode === 'officer') return 'officer';
  return 'public';
}

type DashboardData = OfficerDashboardResponse | AdminDashboardResponse | null;

export function useDashboard() {
  const roles = useAuthStore((s) => s.user?.roles ?? []);
  const activePortalMode = useAuthStore((s) => s.activePortalMode);
  const role = effectivePrimaryRole(roles, activePortalMode);

  return useQuery<DashboardData>({
    queryKey: ['dashboard', role],
    queryFn: (): Promise<DashboardData> => {
      if (role === 'admin') return http.get<AdminDashboardResponse>('dashboard/admin');
      if (role === 'officer') return http.get<OfficerDashboardResponse>('dashboard/officer');
      return Promise.resolve(null);
    },
    enabled: roles.length > 0,
  });
}

export { primaryRole as default };
