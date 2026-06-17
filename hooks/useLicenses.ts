import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { useAuthStore } from '@/stores/auth';

export type LicenseStatus = 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'REVOKED' | 'PENDING';

export interface LicenseResponse {
  id: string;
  licenseNumber: string;
  issuedAt: string;
  expiresAt: string;
  status: LicenseStatus;
  licenseType: {
    id: string;
    code: string;
    nameTh: string;
    nameEn: string;
    agency: string;
  };
  business: {
    id: string;
    nameTh: string;
    registrationId: string;
  };
}

export function useLicenses() {
  const activeJuristicId = useAuthStore((s) => s.activeJuristicId);
  
  // Rule from FRONTEND_GUIDE_AI: tenant-scoped keys include activeJuristicId
  return useQuery({
    queryKey: ['my-licenses', activeJuristicId],
    queryFn: async () => {
      // API accepts 'mode' query param: 'personal' or 'juristic'
      // If we have an activeJuristicId, the BFF proxy handles the scoping via the token context,
      // but the API also looks at the query mode.
      const mode = activeJuristicId ? 'juristic' : 'personal';
      return http.get<LicenseResponse[]>(`my/licenses?mode=${mode}`);
    },
  });
}
