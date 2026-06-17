import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';

export interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
}

export interface InspectionTaskDetail {
  id: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'APPROVED' | 'RETURNED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  business: {
    id: string;
    nameTh: string;
    address: string;
    province: string | null;
  };
  license: {
    id: string;
    licenseNumber: string;
    licenseType: { id: string; code: string; nameTh: string; agency: string };
  } | null;
  assignee: {
    id: string;
    fullName: string;
  } | null;
  zone: { id: string; name: string } | null;
  checklistTemplate: {
    id: string;
    items: ChecklistItem[];
  } | null;
  report: {
    id: string;
    result: 'PASSED' | 'FAILED' | null;
    note: string | null;
    reviewComment: string | null;
    isDraft: boolean;
    evidence: { id: string; url: string; filename: string }[];
  } | null;
}

export function useInspectionTask(id: string) {
  return useQuery({
    queryKey: ['inspection-task', id],
    queryFn: () => http.get<InspectionTaskDetail>(`inspection-tasks/${id}`),
    enabled: !!id,
  });
}

export function useStartTask(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => http.patch(`inspection-tasks/${taskId}/start`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inspection-task', taskId] }),
  });
}

export function useUpdateReport(reportId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { note?: string; result?: 'PASSED' | 'FAILED' }) =>
      http.put(`inspection-reports/${reportId}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inspection-task', taskId] }),
  });
}

export function useSubmitReport(reportId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => http.patch(`inspection-reports/${reportId}/submit`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inspection-task', taskId] }),
  });
}

export function useUploadEvidence(reportId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return http.post(`inspection-reports/${reportId}/evidence`, form);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inspection-task', taskId] }),
  });
}

export function useDeleteEvidence(reportId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) =>
      http.delete(`inspection-reports/${reportId}/evidence/${docId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inspection-task', taskId] }),
  });
}
