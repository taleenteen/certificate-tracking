import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';

type AuthUser = {
  id: string;
  fullName: string;
  roles: string[];
  agencyId?: string | null;
};

type AuthResponse = {
  user?: AuthUser;
  activeJuristicId?: string | null;
  juristicRole?: string | null;
  requiresPasswordChange?: boolean;
  tempToken?: string;
};

type ContextSwitchResponse = {
  activeJuristicId: string | null;
  juristicRole: string | null;
};

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setPendingTempToken = useAuthStore((s) => s.setPendingTempToken);
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: { username?: string; password?: string; totpCode?: string; mToken?: string; type: 'tang-rat' | 'password' | 'self' }) => {
      const { type, ...body } = credentials;
      if (type === 'tang-rat') return http.post<AuthResponse>('auth/tang-rat', { mToken: body.mToken });
      if (type === 'self') return http.post<AuthResponse>('auth/self', { username: body.username, password: body.password, totpCode: body.totpCode });
      return http.post<AuthResponse>('auth/login', { username: body.username, password: body.password });
    },
    onSuccess: (data) => {
      // Backend returns this shape when the account requires a password change
      // (seeded accounts with mustChangePassword: true, or first-time admin login).
      if (data?.requiresPasswordChange && data?.tempToken) {
        setPendingTempToken(data.tempToken);
        router.push('/auth/change-password');
        return;
      }

      setAuth({
        user: data.user,
        activeJuristicId: data.activeJuristicId,
        juristicRole: data.juristicRole,
      });
      const roles: string[] = data.user?.roles ?? [];
      if (roles.includes('super_admin')) router.push('/super-admin/dashboard');
      else if (roles.includes('admin')) router.push('/agency-admin/inspections');
      else router.push('/home');
    },
  });
}

/** Called from the forced-change-password page. Uses the tempToken (not the
 *  cookie-based session) to authorise the PATCH, then redirects to login. */
export function useForceChangePassword() {
  const tempToken = useAuthStore((s) => s.pendingTempToken);
  const setPendingTempToken = useAuthStore((s) => s.setPendingTempToken);
  const router = useRouter();

  return useMutation({
    mutationFn: (newPassword: string) => {
      if (!tempToken) throw new Error('No pending session — please log in again');
      // Pass the tempToken explicitly; BFF proxy forwards it as Bearer since
      // there is no access_token cookie in the change-password flow.
      return http.post<{ success: boolean }>('auth/change-password', { newPassword }, { bearerToken: tempToken });
    },
    onSuccess: () => {
      setPendingTempToken(null);
      router.push('/auth/login');
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: async (userData: {
      username: string;
      email: string;
      password: string;
      fullName: string;
      phone: string;
    }) => {
      return http.post<AuthResponse>('auth/register', userData);
    },
    onSuccess: (data) => {
      setAuth({
        user: data.user,
        activeJuristicId: data.activeJuristicId,
        juristicRole: data.juristicRole,
      });
      router.push('/home');
    },
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => http.post('auth/logout'),
    onSuccess: () => {
      clear();
      queryClient.clear();
      router.push('/auth/login');
    },
  });
}

export function useSwitchContext() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (juristicId: string | null) => {
      return http.post<ContextSwitchResponse>('auth/context', { juristicId });
    },
    onSuccess: (data) => {
      setAuth({
        activeJuristicId: data.activeJuristicId,
        juristicRole: data.juristicRole,
      });
      // MANDATORY: Clear cache on context switch to prevent data leakage
      queryClient.clear();
    },
  });
}
