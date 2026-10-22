import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';

export interface AuditLogRow {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  beforeValue: Record<string, unknown> | null;
  afterValue: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    roles: string[];
    agencyId: string | null;
  } | null;
}

export interface AuditLogPage {
  data: AuditLogRow[];
  meta: { page: number; limit: number; total: number };
}

export interface AuditLogFilters {
  q?: string;
  entityType?: string;
  from?: string;
  to?: string;
  page?: number;
}

const QUERY_KEY = 'audit-logs';

export function useAuditLogs(filters: AuditLogFilters = {}) {
  const search = new URLSearchParams();
  if (filters.q) search.set('q', filters.q);
  if (filters.entityType) search.set('entityType', filters.entityType);
  if (filters.from) search.set('from', filters.from);
  if (filters.to) search.set('to', filters.to);
  if (filters.page) search.set('page', String(filters.page));
  const qs = search.toString();

  return useQuery<AuditLogPage>({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => http.get<AuditLogPage>(qs ? `audit-logs?${qs}` : 'audit-logs'),
  });
}

export function exportAuditLogsCsv(filters: AuditLogFilters = {}) {
  const search = new URLSearchParams();
  if (filters.q) search.set('q', filters.q);
  if (filters.entityType) search.set('entityType', filters.entityType);
  if (filters.from) search.set('from', filters.from);
  if (filters.to) search.set('to', filters.to);
  const qs = search.toString();
  window.open(`/api/audit-logs/export${qs ? `?${qs}` : ''}`, '_blank');
}
