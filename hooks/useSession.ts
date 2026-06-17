import { useAuthStore } from '@/stores/auth';
import { http } from '@/lib/http';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';

interface ProfileResponse {
  id: string;
  displayName: string;
  roles: string[];
  agencyId: string | null;
  citizenIdVerified: boolean;
  citizenIdLast4: string | null;
  primaryChannel: string;
}

export function useSessionHydration() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clear = useAuthStore((s) => s.clear);

  const hydrate = useMutation({
    mutationFn: () => http.get<ProfileResponse>('my/profile'),
    onSuccess: (data) => {
      setAuth({
        user: {
          id: data.id,
          fullName: data.displayName,
          roles: data.roles,
          agencyId: data.agencyId,
        },
      });
    },
    onError: () => {
      // 401 means no valid session cookie — clear any stale display state.
      clear();
    },
  });

  useEffect(() => {
    // Always verify against the backend — never trust sessionStorage alone.
    // onError calls clear() which removes the stale user from the store.
    hydrate.mutate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return hydrate;
}
