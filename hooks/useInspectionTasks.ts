import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { useAuthStore } from '@/stores/auth';

export type AdminTaskStatus =
  | 'WAITING_ASSIGNMENT'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'RETURNED'
  | 'CANCELLED';

export interface InspectionTaskSummary {
  id: string;
  taskNo: string;
  status: AdminTaskStatus;
  dueDate: string | null;
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
    licenseType: { id: string; code: string; nameTh: string; agencyId: string };
  } | null;
  assignee: {
    id: string;
    fullName: string;
    agencyId: string | null;
    roles: string[];
  } | null;
  zone: { id: string; nameTh: string } | null;
}

export interface CreateTaskPayload {
  businessId: string;
  licenseId?: string;
  assignedTo?: string;
  dueDate?: string;
}

export interface AssignTaskPayload {
  assignedTo: string;
}

const QUERY_KEY = 'inspection-tasks';

export function useInspectionTasks(status?: string) {
  const activeJuristicId = useAuthStore((s) => s.activeJuristicId);
  const path = status
    ? `inspection-tasks?status=${status}`
    : 'inspection-tasks';

  return useQuery<InspectionTaskSummary[]>({
    queryKey: [QUERY_KEY, status ?? 'all', activeJuristicId],
    queryFn: () => http.get<InspectionTaskSummary[]>(path),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTaskPayload) =>
      http.post<InspectionTaskSummary>('inspection-tasks', dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useAssignTask(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: AssignTaskPayload) =>
      http.patch<InspectionTaskSummary>(`inspection-tasks/${taskId}/assign`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useCancelTask(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) =>
      http.patch<InspectionTaskSummary>(`inspection-tasks/${taskId}/cancel`, { reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

/** Display label for admin task status (maps APPROVED → เสร็จสิ้น). */
export function taskStatusLabel(status: AdminTaskStatus): string {
  const labels: Record<AdminTaskStatus, string> = {
    WAITING_ASSIGNMENT: 'รอมอบหมาย',
    ASSIGNED: 'มอบหมายแล้ว',
    IN_PROGRESS: 'กำลังดำเนินการ',
    PENDING_REVIEW: 'รอตรวจสอบ',
    APPROVED: 'เสร็จสิ้น',
    RETURNED: 'ส่งกลับแก้ไข',
    CANCELLED: 'ยกเลิก',
  };
  return labels[status] ?? status;
}
