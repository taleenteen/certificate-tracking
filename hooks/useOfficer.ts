import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/http";

export interface OfficerQrProfileResponse {
  officerId: string;
  qrToken: string;
  verifyUrl: string;
  issuedAt: string;
  expiresAt: string;
  expiresInSeconds: number;
}

export interface VerifyOfficerSuccessResponse {
  valid: true;
  scannedAt: string;
  officer: {
    fullName: string;
    agency: {
      id: string;
      code: string;
      nameTh: string;
    };
    permissions: {
      agency: string;
      labelTh: string;
      licenseTypeCodes: string[];
    }[];
  };
}

export interface VerifyOfficerFailedResponse {
  valid: false;
  scannedAt: string;
  reason: "INVALID_TOKEN" | "EXPIRED_TOKEN" | "NOT_OFFICER" | "OFFICER_NOT_ACTIVE";
}

export type VerifyOfficerResponse = VerifyOfficerSuccessResponse | VerifyOfficerFailedResponse;

export function useOfficerQrProfile(officerId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["officer-qr-profile", officerId],
    queryFn: () => http.get<OfficerQrProfileResponse>(`officers/${officerId}/qr-profile`),
    enabled: enabled && !!officerId,
    refetchInterval: 50_000, // Re-mint the token every 50 seconds to prevent expiration
    staleTime: 45_000,
  });
}

export function useVerifyOfficer(token: string) {
  return useQuery({
    queryKey: ["verify-officer", token],
    queryFn: () => http.get<VerifyOfficerResponse>(`public/officers/verify/${token}`),
    enabled: !!token,
    retry: false,
    staleTime: 0, // Always fetch fresh validation status
  });
}

export interface OfficerLicensesFilters {
  q?: string;
  licenseNumber?: string;
  status?: string;
  juristicId?: string;
  businessId?: string;
  agencyId?: string;
  page?: number;
  limit?: number;
}

export interface OfficerLicensesResponse {
  data: {
    id: string;
    licenseNumber: string;
    status: string;
    issuedAt: string;
    expiresAt: string | null;
    licenseType: {
      id: string;
      code: string;
      nameTh: string;
      agency: {
        id: string;
        code: string;
        nameTh: string;
      };
    };
    business: {
      id: string;
      nameTh: string;
      province: string;
      juristic?: {
        id: string;
        registrationId: string;
        nameTh: string;
      };
    };
  }[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export function useOfficerLicenses(filters: OfficerLicensesFilters, enabled: boolean) {
  const queryParams = new URLSearchParams();
  if (filters.q) queryParams.set("q", filters.q);
  if (filters.licenseNumber) queryParams.set("licenseNumber", filters.licenseNumber);
  if (filters.status) queryParams.set("status", filters.status);
  if (filters.juristicId) queryParams.set("juristicId", filters.juristicId);
  if (filters.businessId) queryParams.set("businessId", filters.businessId);
  if (filters.agencyId) queryParams.set("agencyId", filters.agencyId);
  if (filters.page) queryParams.set("page", String(filters.page));
  if (filters.limit) queryParams.set("limit", String(filters.limit));

  return useQuery({
    queryKey: ["officer-licenses", filters],
    queryFn: () => http.get<OfficerLicensesResponse>(`officer/licenses?${queryParams.toString()}`),
    enabled: enabled,
  });
}

export interface CreateOfficerInspectionItemDto {
  licenseId: string;
  // result is NOT sent per spec §2 — no item-level pass/fail status
  detailNote: string;
  findings?: Record<string, unknown>;
}

export interface CreateOfficerInspectionDto {
  businessId: string;
  inspectedAt: string;
  summaryNote: string;
  items: CreateOfficerInspectionItemDto[];
}

export interface CreateOfficerInspectionResponse {
  id: string;
  inspectionNo: string;
  status: string;
  businessId: string;
  juristicPersonId: string;
  itemCount: number;
  items: {
    id: string;
    licenseId: string;
    sequence: number;
    // result is not present in response per spec §2
  }[];
  createdAt: string;
}

export function useCreateOfficerInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateOfficerInspectionDto) =>
      http.post<CreateOfficerInspectionResponse>("officer/inspections", dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-licenses"] });
      qc.invalidateQueries({ queryKey: ["my-juristic-license-groups"] });
    },
  });
}

export async function uploadInspectionEvidence(
  inspectionId: string,
  itemId: string,
  file: File
) {
  const formData = new FormData();
  formData.append("file", file);
  return http.post(`officer/inspections/${inspectionId}/items/${itemId}/evidence`, formData);
}
