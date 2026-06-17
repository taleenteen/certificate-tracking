import { useAuthStore } from '@/stores/auth';
import { ReactNode } from 'react';

interface RoleGateProps {
  children: ReactNode;
  roles: string[];
  fallback?: ReactNode;
}

export function RoleGate({ children, roles, fallback = null }: RoleGateProps) {
  const userRoles = useAuthStore((s) => s.user?.roles || []);
  
  const hasRole = roles.some(role => userRoles.includes(role));
  
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
  const activeJuristicId = useAuthStore((s) => s.activeJuristicId);
  const currentRole = useAuthStore((s) => s.juristicRole) as keyof typeof ROLE_RANK | null;

  if (!activeJuristicId || !currentRole) return <>{fallback}</>;

  if (ROLE_RANK[currentRole] < ROLE_RANK[minRole]) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
