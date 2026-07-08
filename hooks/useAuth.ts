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

type DgaAuthorizeResponse = {
  authorizeUrl: string;
  state: string;
  expiresAt: string;
};

type LogoutResponse = {
  success: boolean;
  endSessionUrl?: string;
};

const DGA_STATE_KEY = "dga_oidc_state";
const DGA_REDIRECT_URI_KEY = "dga_oidc_redirect_uri";

function routeAfterLogin(
  roles: string[],
  router: ReturnType<typeof useRouter>,
  setActivePortalMode: (mode: 'public' | 'officer' | null) => void,
) {
  if (roles.includes('super_admin')) {
    setActivePortalMode(null);
    router.push('/super-admin/dashboard');
  } else if (roles.includes('admin')) {
    setActivePortalMode(null);
    router.push('/agency-admin/inspections');
  } else if (roles.includes('officer')) {
    setActivePortalMode(null);
    router.push('/role-select');
  } else {
    setActivePortalMode('public');
    router.push('/home?entry=public');
  }
}

export function dgaRedirectUri() {
  if (process.env.NEXT_PUBLIC_DGA_REDIRECT_URI) {
    return process.env.NEXT_PUBLIC_DGA_REDIRECT_URI;
  }
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}/auth/login-callback`;
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setActivePortalMode = useAuthStore((s) => s.setActivePortalMode);
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
      routeAfterLogin(data.user?.roles ?? [], router, setActivePortalMode);
    },
  });
}

export function useDgaAuthorize() {
  return useMutation({
    mutationFn: async () => {
      const redirectUri = dgaRedirectUri();
      const response = await http.post<DgaAuthorizeResponse>('auth/dga/authorize', {
        redirectUri,
        scope: 'openid citizen_id given_name family_name',
      });
      sessionStorage.setItem(DGA_STATE_KEY, response.state);
      if (redirectUri) sessionStorage.setItem(DGA_REDIRECT_URI_KEY, redirectUri);
      else sessionStorage.removeItem(DGA_REDIRECT_URI_KEY);
      return response;
    },
  });
}

export function useDgaCallback() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setActivePortalMode = useAuthStore((s) => s.setActivePortalMode);
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ code, state }: { code: string; state: string }) => {
      const expectedState = sessionStorage.getItem(DGA_STATE_KEY);
      const redirectUri = sessionStorage.getItem(DGA_REDIRECT_URI_KEY);
      if (!expectedState || !redirectUri) {
        throw new Error('ไม่พบ session การเข้าสู่ระบบทางรัฐ กรุณาเริ่มเข้าสู่ระบบใหม่');
      }
      if (expectedState !== state) {
        throw new Error('State จากทางรัฐไม่ตรงกับ session ปัจจุบัน');
      }
      return http.post<AuthResponse>('auth/dga/callback', {
        code,
        state,
        redirectUri,
      });
    },
    onSuccess: (data) => {
      sessionStorage.removeItem(DGA_STATE_KEY);
      sessionStorage.removeItem(DGA_REDIRECT_URI_KEY);
      setAuth({
        user: data.user,
        activeJuristicId: data.activeJuristicId,
        juristicRole: data.juristicRole,
      });
      routeAfterLogin(data.user?.roles ?? [], router, setActivePortalMode);
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
  const setActivePortalMode = useAuthStore((s) => s.setActivePortalMode);
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
      setActivePortalMode('public');
      router.push('/home?entry=public');
    },
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => http.post<LogoutResponse>('auth/logout'),
    onSuccess: (data) => {
      clear();
      queryClient.clear();
      if (data.endSessionUrl) {
        window.location.href = data.endSessionUrl;
        return;
      }
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
