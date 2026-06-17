import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { useAuthStore } from '@/stores/auth';

// Inspector dashboard — task counts for the current inspector
export interface InspectorDashboardResponse {
  pendingTasks: number;
  inProgress: number;
  returnedToFix: number;
  completedThisMonth: number;
  recentTasks: {
    id: string;
    status: string;
    business: { id: string; nameTh: string };
    updatedAt: string;
  }[];
}

// Supervisor dashboard — zone/task aggregates
export interface SupervisorDashboardResponse {
  zoneSummary: { zoneId: string; status: string; _count: number }[];
  pendingReviewCount: number;
  taskCountsByStatus: Record<string, number>;
  complianceRate: number;
}

// Admin dashboard — system-wide counts
export interface AdminDashboardResponse {
  userCounts: Record<string, number>;
  zoneCount: number;
  licenseCounts: Record<string, number>;
  lastSync: unknown[];
}

function primaryRole(roles: string[]): 'admin' | 'supervisor' | 'inspector' | 'public' {
  if (roles.includes('super_admin') || roles.includes('admin')) return 'admin';
  if (roles.includes('supervisor')) return 'supervisor';
  if (roles.includes('inspector')) return 'inspector';
  return 'public';
}

type DashboardData = InspectorDashboardResponse | SupervisorDashboardResponse | AdminDashboardResponse | null;

export function useDashboard() {
  const roles = useAuthStore((s) => s.user?.roles ?? []);
  const role = primaryRole(roles);

  return useQuery<DashboardData>({
    queryKey: ['dashboard', role],
    queryFn: (): Promise<DashboardData> => {
      if (role === 'admin') return http.get<AdminDashboardResponse>('dashboard/admin');
      if (role === 'supervisor') return http.get<SupervisorDashboardResponse>('dashboard/supervisor');
      if (role === 'inspector') return http.get<InspectorDashboardResponse>('dashboard/inspector');
      return Promise.resolve(null);
    },
    enabled: roles.length > 0,
  });
}

export { primaryRole };
