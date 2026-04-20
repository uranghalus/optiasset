'use client';
import { authClient } from '@/lib/auth-client';
import { useQuery } from '@tanstack/react-query';

export function useActiveMemberRole() {
  return useQuery({
    queryKey: ['active-member-role'],
    queryFn: async () => {
      const res = await authClient.organization.getActiveMemberRole();

      if (res.error) {
        throw new Error(res.error.message || 'Failed to fetch role');
      }

      return res.data?.role;
    },
    staleTime: 1000 * 60 * 5, // cache 5 menit (optional)
    retry: 1, // optional
  });
}
