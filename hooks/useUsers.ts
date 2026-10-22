import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';

export interface SystemUserSummary {
  id: string;
  username: string | null;
  email: string | null;
  fullName: string;
  phone: string | null;
  roles: string[];
  agencyId: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  primaryChannel: 'domain' | 'tang_rat';
  hasTangRatIdentity: boolean;
  citizenIdVerified: boolean;
  citizenIdLast4: string | null;
  userZones: Array<{ zone: { id: string; nameTh: string; code: string } }>;
}

export interface CreateUserPayload {
  fullName: string;
  username?: string;
  email?: string;
  phone?: string;
  roles: string[];
  agencyId: string;
  zoneIds: string[];
  initialPassword?: string;
}

const QUERY_KEY = 'users';

export function useUsers(params?: { q?: string; role?: string; status?: boolean }) {
  const search = new URLSearchParams();
  if (params?.q) search.set('q', params.q);
  if (params?.role) search.set('role', params.role);
  if (params?.status !== undefined) search.set('status', String(params.status));
  const qs = search.toString();

  return useQuery<SystemUserSummary[]>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => http.get<SystemUserSummary[]>(qs ? `users?${qs}` : 'users'),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateUserPayload) => http.post<SystemUserSummary>('users', dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateUserRoles(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roles: string[]) => http.patch<SystemUserSummary>(`users/${id}/roles`, { roles }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateUserAgency(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (agencyId: string) => http.patch<SystemUserSummary>(`users/${id}/agency`, { agencyId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateUserAccess(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { roles: string[]; agencyId?: string }) =>
      http.patch<SystemUserSummary>(`users/${id}/access`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useSuspendUser(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => http.patch<SystemUserSummary>(`users/${id}/suspend`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
