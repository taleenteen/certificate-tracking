import { useAuthStore } from '@/stores/auth';

export function useIsStaff(): boolean {
  const roles = useAuthStore((s) => s.user?.roles ?? []);
  return roles.some((r) => r === 'officer' || r === 'admin' || r === 'super_admin');
}
