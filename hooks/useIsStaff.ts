import { useAuthStore } from '@/stores/auth';

export function useIsStaff(): boolean {
  const user = useAuthStore((s) => s.user);
  const activePortalMode = useAuthStore((s) => s.activePortalMode);

  if (!user) return false;

  // Officers must be in officer mode to be treated as staff
  if (user.roles.includes('officer') && activePortalMode !== 'officer') {
    return false;
  }

  return user.roles.some((r) => r === 'officer' || r === 'admin' || r === 'super_admin');
}
