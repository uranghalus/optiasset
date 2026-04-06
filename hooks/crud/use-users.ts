"use client";

import {
  createUserAction,
  deleteUserAction,
  getAllUsers,
  updateUserAction,
} from "@/action/user-action";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const USER_QUERY_KEY = "users";
export function useUsers({
  page,
  limit,
  search,
}: {
  page: number;
  limit: number;
  search?: string;
}) {
  return useQuery({
    queryKey: [USER_QUERY_KEY, { page, limit, search }],
    queryFn: () => getAllUsers({ page, limit, search }),

    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}
//LINK Use Create User
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createUserAction(formData),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [USER_QUERY_KEY],
        exact: false,
      });
    },
  });
}
// LINK use update user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateUserAction(id, formData),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [USER_QUERY_KEY],
      });
    },
  });
}
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUserAction(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [USER_QUERY_KEY],
      });
    },
  });
}
