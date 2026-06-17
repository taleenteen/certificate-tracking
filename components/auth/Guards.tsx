"use client";

import { useAuthStore } from '@/stores/auth';
import { ReactNode, useEffect, useState } from 'react';

interface RoleGateProps {
  children: ReactNode;
  roles: string[];
  fallback?: ReactNode;
}

// Module-level stable reference — prevents getServerSnapshot from returning a
// new array object on every call, which React treats as an infinite loop.
const EMPTY_ROLES: string[] = [];

export function RoleGate({ children, roles, fallback = null }: RoleGateProps) {
  // Zustand persist reads from sessionStorage, which doesn't exist during SSR.
  // Wait until the client has mounted (and the store has rehydrated) before
  // making any role decision — this prevents a flash of "Access Denied" on
  // the first render when the user is actually logged in.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Use ?? (not ||) with the stable module-level constant so the selector
  // always returns the same reference when user is null.
  const userRoles = useAuthStore((s) => s.user?.roles ?? EMPTY_ROLES);

  if (!mounted) return null;

  const hasRole = roles.some((role) => userRoles.includes(role));
  if (!hasRole) return <>{fallback}</>;
  return <>{children}</>;
}

interface JuristicGateProps {
  children: ReactNode;
  minRole?: 'OWNER' | 'ADMIN' | 'MEMBER';
  fallback?: ReactNode;
}

const ROLE_RANK = {
  OWNER: 2,
  ADMIN: 1,
  MEMBER: 0,
};

export function JuristicGate({ children, minRole = 'MEMBER', fallback = null }: JuristicGateProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const activeJuristicId = useAuthStore((s) => s.activeJuristicId);
  const currentRole = useAuthStore((s) => s.juristicRole) as keyof typeof ROLE_RANK | null;

  if (!mounted) return null;
  if (!activeJuristicId || !currentRole) return <>{fallback}</>;
  if (ROLE_RANK[currentRole] < ROLE_RANK[minRole]) return <>{fallback}</>;
  return <>{children}</>;
}
