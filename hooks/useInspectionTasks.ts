import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { useAuthStore } from '@/stores/auth';

export interface InspectionTaskSummary {
  id: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'APPROVED' | 'RETURNED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  business: {
    id: string;
    nameTh: string;
    address: string;
    province: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  license: {
    id: string;
    licenseNumber: string;
    licenseType: { id: string; code: string; nameTh: string; agency: string };
  } | null;
  assignee: {
    id: string;
    fullName: string;
    agency: string | null;
    roles: string[];
  } | null;
  zone: { id: string; name: string } | null;
}

export function useInspectionTasks(status?: string) {
  const activeJuristicId = useAuthStore((s) => s.activeJuristicId);
  const path = status
    ? `inspection-tasks?status=${status}`
    : 'inspection-tasks';

  return useQuery({
    queryKey: ['inspection-tasks', status ?? 'all', activeJuristicId],
    queryFn: () => http.get<InspectionTaskSummary[]>(path),
  });
}
