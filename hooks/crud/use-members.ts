"use client";

import {
  createMemberAction,
  deleteMemberAction,
  getAllMembers,
  updateMemberAction,
} from "@/action/member-action";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const MEMBER_QUERY_KEY = "members";

export function useMembers({
  page,
  limit,
  search,
}: {
  page: number;
  limit: number;
  search?: string;
}) {
  return useQuery({
    queryKey: [MEMBER_QUERY_KEY, { page, limit, search }],
    queryFn: async () => {
      const res = await getAllMembers({ page, limit, search });

      return {
        data: Array.isArray(res?.data) ? res.data : [],
        pagination: {
          page: res?.pagination?.page ?? page,
          limit: res?.pagination?.limit ?? limit,
          total: res?.pagination?.total ?? 0,
          totalPages:
            res?.pagination?.totalPages && !isNaN(res.pagination.totalPages)
              ? res.pagination.totalPages
              : 1,
        },
      };
    },

    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createMemberAction(formData),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [MEMBER_QUERY_KEY],
        exact: false,
      });
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateMemberAction(id, formData),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [MEMBER_QUERY_KEY],
      });
    },
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMemberAction(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [MEMBER_QUERY_KEY],
      });
    },
  });
}
