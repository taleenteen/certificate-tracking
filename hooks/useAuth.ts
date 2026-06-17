import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: { username?: string; password?: string; totpCode?: string; mToken?: string; type: 'tang-rat' | 'password' | 'self' }) => {
      const { type, ...body } = credentials;
      if (type === 'tang-rat') return http.post<any>('auth/tang-rat', { mToken: body.mToken });
      if (type === 'self') return http.post<any>('auth/self', { username: body.username, password: body.password, totpCode: body.totpCode });
      return http.post<any>('auth/login', { username: body.username, password: body.password });
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
      return http.post<any>('auth/register', userData);
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
      return http.post<any>('auth/context', { juristicId });
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
