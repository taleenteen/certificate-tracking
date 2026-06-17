import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';

export interface ProfileResponse {
  id: string;
  displayName: string;
  roles: string[];
  agencyId: string | null;
  citizenIdVerified: boolean;
  citizenIdLast4: string | null;
  primaryChannel: string;
}

export function useMyProfile() {
  return useQuery<ProfileResponse>({
    queryKey: ['my-profile'],
    queryFn: () => http.get<ProfileResponse>('my/profile'),
  });
}
