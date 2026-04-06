"use client";

import {
  createOrganizationRole,
  deleteOrganizationRole,
  getAllRoles,
  updateOrganizationRole,
} from "@/action/role-action";
import { PaginationState } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
export const ROLE_QUERY_KEY = "roles";

export function useRoles(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: [ROLE_QUERY_KEY, page, limit],
    queryFn: async () => {
      return await getAllRoles({ page, limit });
    },
  });
}
// Create
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return await createOrganizationRole(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ROLE_QUERY_KEY],
      });
    },
  });
}
// Update
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: FormData;
    }) => {
      return await updateOrganizationRole(id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ROLE_QUERY_KEY],
      });
    },
  });
}
// Delete
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteOrganizationRole(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ROLE_QUERY_KEY],
      });
    },
  });
}
