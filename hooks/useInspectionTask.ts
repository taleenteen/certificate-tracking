import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';

export interface ChecklistQuestion {
  no: number;
  question_th: string;
  weight: number;
  required: boolean;
}

export interface ChecklistTemplate {
  id: string;
  nameTh: string;
  passingScore: number;
  items: ChecklistQuestion[];
}

export interface InspectionDocument {
  id: string;
  url: string;
  filename: string;
}

export interface InspectionReport {
  id: string;
  taskId: string;
  inspectorId: string;
  checklistTemplateId: string;
  result: 'PASSED' | 'FAILED' | null;
  score: number | null;
  findings: { no: number; answer: boolean; note: string }[] | null;
  summaryNote: string | null;
  isDraft: boolean;
  submittedAt: string | null;
  reviewComment: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  checklistTemplate: ChecklistTemplate;
  documents: InspectionDocument[];
}

export interface InspectionTaskDetail {
  id: string;
  taskNo: string;
  businessId: string;
  licenseId: string;
  assignedTo: string;
  createdBy: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'APPROVED' | 'RETURNED' | 'CANCELLED';
  dueDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;

  business: {
    id: string;
    nameTh: string;
    address: string;
    province: string | null;
    latitude: number | null;
    longitude: number | null;
    phone?: string;
  };

  license: {
    id: string;
    licenseNo: string;
    status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'PENDING';
    issueDate: string;
    expireDate: string | null;
    licenseType: {
      id: string;
      code: string;
      nameTh: string;
      nameEn?: string;
    };
  } | null;

  assignee: {
    id: string;
    fullName: string;
    agencyId: string | null;
    roles: string[];
  } | null;

  reports: InspectionReport[];
}

export interface UpdateReportDto {
  score?: number;
  result?: 'PASSED' | 'FAILED';
  findings?: { no: number; answer: boolean; note: string }[];
  summaryNote?: string;
}

export function useInspectionTask(id: string) {
  return useQuery({
    queryKey: ['inspection-task', id],
    queryFn: () => http.get<InspectionTaskDetail>(`inspection-tasks/${id}`),
    enabled: !!id,
  });
}

export function useInspectionTaskByLicense(licenseId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['inspection-task-by-license', licenseId],
    queryFn: () => http.get<InspectionTaskDetail>(`inspection-tasks/by-license/${licenseId}`),
    enabled: options?.enabled !== false && !!licenseId,
    retry: false,
  });
}

export function useStartTask(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => http.patch(`inspection-tasks/${taskId}/start`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inspection-task', taskId] });
      qc.invalidateQueries({ queryKey: ['inspection-task-by-license'] });
    },
  });
}

export function useUpdateReport(reportId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateReportDto) =>
      http.put(`inspection-reports/${reportId}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inspection-task', taskId] });
      qc.invalidateQueries({ queryKey: ['inspection-task-by-license'] });
    },
  });
}

export function useSubmitReport(reportId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => http.patch(`inspection-reports/${reportId}/submit`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inspection-task', taskId] });
      qc.invalidateQueries({ queryKey: ['inspection-task-by-license'] });
    },
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inspection-task', taskId] });
      qc.invalidateQueries({ queryKey: ['inspection-task-by-license'] });
    },
  });
}

export function useDeleteEvidence(reportId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) =>
      http.delete(`inspection-reports/${reportId}/evidence/${docId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inspection-task', taskId] });
      qc.invalidateQueries({ queryKey: ['inspection-task-by-license'] });
    },
  });
}

export function useApproveReport(reportId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => http.patch(`inspection-reports/${reportId}/approve`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inspection-task', taskId] });
    },
  });
}

export function useReturnReport(reportId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { reviewComment: string }) =>
      http.patch(`inspection-reports/${reportId}/return`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inspection-task', taskId] });
    },
  });
}
