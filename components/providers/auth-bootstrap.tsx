'use client';

import { ReactNode, useEffect } from 'react';
import { useSessionHydration } from '@/hooks/useSession';
import { useAuthStore } from '@/stores/auth';

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const setHydrated = useAuthStore((s) => s.setHydrated);
  // Always makes a backend round-trip to verify the session.
  // On 401 the hook clears the store, so stale sessionStorage users are ejected.
  const { isSuccess, isError } = useSessionHydration();

  useEffect(() => {
    if (isSuccess || isError) setHydrated(true);
  }, [isSuccess, isError, setHydrated]);

  return <>{children}</>;
}
