import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { useAuthStore } from '@/stores/auth';

export type LicenseStatus = 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'REVOKED' | 'PENDING';

export interface LicenseResponse {
  id: string;
  licenseNumber: string;
  issuedAt: string;
  expiresAt: string | null;
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

  return useQuery({
    queryKey: ['my-licenses', activeJuristicId],
    queryFn: async () => {
      const mode = activeJuristicId ? 'juristic' : 'personal';
      return http.get<LicenseResponse[]>(`my/licenses?mode=${mode}`);
    },
  });
}

export function useDevSeedLicense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => http.post<LicenseResponse>('my/dev/seed-license'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-licenses'] });
    },
  });
}
