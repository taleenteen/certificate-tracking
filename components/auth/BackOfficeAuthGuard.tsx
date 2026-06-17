'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';

export function BackOfficeAuthGuard({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !user) {
      router.replace('/auth/login');
    }
  }, [hydrated, user, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#114e4b]">
        <p className="text-white/60 animate-pulse text-sm">กำลังโหลด...</p>
      </div>
    );
  }

  if (!user) return null; // redirect in flight

  return <>{children}</>;
}
