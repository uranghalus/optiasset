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

export function useOrganizationRoles(p0: {
  pagination: { page: number; pageSize: number };
}) {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["roles", pagination.page, pagination.pageSize],
    queryFn: () => getAllRoles(pagination),
  });

  return {
    data,
    isLoading,
    error,
    pagination,
    setPagination,
  };
}
// Create
export function useCreateOrganizationRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      return createOrganizationRole(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}
// Update
export function useUpdateOrganizationRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: FormData;
    }) => {
      return updateOrganizationRole(id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}
// Delete
export function useDeleteOrganizationRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return deleteOrganizationRole(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}
