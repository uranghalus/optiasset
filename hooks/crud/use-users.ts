"use client";

// IMPORT TOAST LIBRARY ANDA DI SINI
import { toast } from "sonner"; // sesuaikan jika menggunakan react-hot-toast

import {
  createUserAction,
  deleteManyUser,
  deleteUserAction,
  getAllUsers,
  getUsersByDepartmentForSelect,
  unbanManyUser,
  updateUserAction,
  bannedUser,
  unbanUser,
} from "@/action/user-action";
import { BanUserInput } from "@/schema/user-schema";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

/* =========================
   QUERY KEYS
========================= */

export const userKeys = {
  all: ["users"] as const,

  lists: () => [...userKeys.all, "list"] as const,

  list: (params: { page: number; limit: number; search?: string }) =>
    [...userKeys.lists(), params] as const,

  departments: () => ["users-by-department"] as const,

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
      : ["users-by-department-empty"],

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
    mutationFn: async (formData: FormData) => {
      // Modifikasi promise agar melempar error jika server action return object { error }
      const promise = createUserAction(formData).then((res: any) => {
        if (res?.error) throw new Error(res.error);
        return res;
      });

      return toast.promise(promise, {
        loading: "Creating user...",
        success: (data: any) => data?.message || "User has been created",
        error: (err) => err.message || "Error creating user",
      });
    },

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
   UPDATE USER
========================= */

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: FormData;
    }) => {
      const promise = updateUserAction(id, formData).then((res: any) => {
        if (res?.error) throw new Error(res.error);
        return res;
      });

      return toast.promise(promise, {
        loading: "Updating user...",
        success: (data: any) => data?.message || "User has been updated",
        error: (err) => err.message || "Error updating user",
      });
    },

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
    mutationFn: async (id: string) => {
      const promise = deleteUserAction(id).then((res: any) => {
        if (res?.error) throw new Error(res.error);
        return res;
      });

      return toast.promise(promise, {
        loading: "Deleting user...",
        success: (data: any) => data?.message || "User has been deleted",
        error: (err) => err.message || "Error deleting user",
      });
    },

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
   BAN USER
========================= */

export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    // Tambahkan async di sini opsional, tapi membantu memperjelas flow
    mutationFn: async ({ id, data }: { id: string; data: BanUserInput }) => {
      const promise = bannedUser(id, data).then((res: any) => {
        if (res?.error) throw new Error(res.error);
        return res;
      });

      // 1. Panggil toast.promise tanpa me-return nilainya ke mutationFn
      toast.promise(promise, {
        loading: "Banning user...",
        success: (data: any) => data?.message || "User has been banned",
        error: (err) => err.message || "Error banning user",
      });

      // 2. Return promise aslinya agar React Query bisa mendeteksi status sukses/error
      return promise;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });
    },
  });
}

/* =========================
   UNBAN USER
========================= */

export function useUnbanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const promise = unbanUser(id).then((res: any) => {
        if (res?.error) throw new Error(res.error);
        return res;
      });

      return toast.promise(promise, {
        loading: "Unbanning user...",
        success: (data: any) => data?.message || "User has been unbanned",
        error: (err) => err.message || "Error unbanning user",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });
    },
  });
}

// LINK multi delete User
export function useDeleteManyUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const promise = deleteManyUser(ids).then((res: any) => {
        if (res?.error) throw new Error(res.error);
        return res;
      });

      return toast.promise(promise, {
        loading: "Deleting users...",
        success: (data: any) => data?.message || "Users have been deleted",
        error: (err) => err.message || "Error deleting users",
      });
    },

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

// LINK multi unban User
export function useUnbanManyUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const promise = unbanManyUser(ids).then((res: any) => {
        if (res?.error) throw new Error(res.error);
        return res;
      });

      return toast.promise(promise, {
        loading: "Unbanning users...",
        success: (data: any) => data?.message || "Users have been unbanned",
        error: (err) => err.message || "Error unbanning users",
      });
    },

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
