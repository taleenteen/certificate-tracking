import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';

export interface LicenseDocument {
  id: string;
  objectKey: string;
  docType: string;
  url: string;
  urlExpiresInSeconds: number;
}

export interface LicenseDetailResponse {
  id: string;
  licenseNo: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'REVOKED' | 'PENDING';
  issuedAt: string;
  expiresAt: string | null;
  suspensionReason: string | null;
  licenseType: {
    id: string;
    code: string;
    nameTh: string;
    nameEn: string;
    agency: string;
    agencyId: string | null;
  };
  business: {
    id: string;
    nameTh: string;
    address: string;
    province: string;
    latitude: number | null;
    longitude: number | null;
    ownerUserId?: string | null;
  };
  documents: LicenseDocument[];
  ownership?: {
    type: 'INDIVIDUAL' | 'JURISTIC';
    labelTh: string;
    contextId: string | null;
    displayNameTh: string;
    registrationId: string | null;
  };
}

export function useLicense(id: string) {
  return useQuery({
    queryKey: ['license', id],
    queryFn: () => http.get<LicenseDetailResponse>(`licenses/${id}`),
    enabled: !!id,
  });
}
