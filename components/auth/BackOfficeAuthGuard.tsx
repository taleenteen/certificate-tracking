'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';

export function BackOfficeAuthGuard({ children, requireAdmin = false }: { children: ReactNode; requireAdmin?: boolean }) {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !user) {
      router.replace(requireAdmin ? '/portal/access' : '/auth/login');
      return;
    }
    if (hydrated && user && requireAdmin && !user.roles.some((role) => role === 'admin' || role === 'super_admin')) {
      router.replace('/home');
    }
  }, [hydrated, user, requireAdmin, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#114e4b]">
        <p className="text-white/60 animate-pulse text-sm">กำลังโหลด...</p>
      </div>
    );
  }

  if (!user || (requireAdmin && !user.roles.some((role) => role === 'admin' || role === 'super_admin'))) return null;

  return <>{children}</>;
}
