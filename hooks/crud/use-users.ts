'use client';

import {
  createUserAction,
  deleteUserAction,
  getAllUsers,
  getUsersByDepartmentForSelect,
  updateUserAction,
} from '@/action/user-action';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

/* =========================
   QUERY KEYS
========================= */

export const userKeys = {
  all: ['users'] as const,

  lists: () => [...userKeys.all, 'list'] as const,

  list: (params: { page: number; limit: number; search?: string }) =>
    [...userKeys.lists(), params] as const,

  departments: () => ['users-by-department'] as const,

  department: (departmentId: string) =>
    [...userKeys.departments(), departmentId] as const,
};

/* =========================
   USERS TABLE QUERY
========================= */

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
    queryKey: userKeys.list({
      page,
      limit,
      search,
    }),

    queryFn: async () => {
      const res = await getAllUsers({
        page,
        limit,
        search,
      });

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

    staleTime: 1000 * 60 * 5,
  });
}

/* =========================
 USERS FOR SELECT BY DEPT
========================= */

export function useUsersByDepartment(departmentId?: string) {
  return useQuery({
    queryKey: departmentId
      ? userKeys.department(departmentId)
      : ['users-by-department-empty'],

    queryFn: () => getUsersByDepartmentForSelect(departmentId!),

    enabled: !!departmentId,

    staleTime: 1000 * 60 * 5,
  });
}

/* =========================
   CREATE USER
========================= */

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createUserAction(formData),

    onSuccess: (result) => {
      // refresh users table
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });

      // refresh all department selects
      queryClient.invalidateQueries({
        queryKey: userKeys.departments(),
      });

      /*
      Optional:
      kalau createUserAction return
      departmentId, bisa spesifik:

      queryClient.invalidateQueries({
        queryKey:
         userKeys.department(
          result.departmentId
         )
      })
      */
    },
  });
}

/* =========================
   UPDATE USER
========================= */

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateUserAction(id, formData),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: userKeys.departments(),
      });
    },
  });
}

/* =========================
   DELETE USER
========================= */

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUserAction(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: userKeys.departments(),
      });
    },
  });
}
