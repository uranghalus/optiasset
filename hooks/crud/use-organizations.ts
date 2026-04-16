import {
  createOrganization,
  deleteOrganization,
  getOrganizations,
  updateOrganization,
} from '@/action/organization-action';
import { PaginationState } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Get all organizations
export function useOrganizations({ page, pageSize }: PaginationState) {
  return useQuery({
    queryKey: ['organizations', page, pageSize],
    queryFn: () => getOrganizations({ page, pageSize }),
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // refetch every 30 seconds
  });
}

// Create organization
export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createOrganization(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

// Update organization
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateOrganization(id, formData),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organizations'],
      });
    },
  });
}

/* =======================
   DELETE
 ======================= */
export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOrganization(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organizations'],
      });
    },
  });
}
