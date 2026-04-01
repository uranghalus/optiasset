import {
  createDepartment,
  deleteDepartment,
  getAllDepartments,
  updateDepartment,
} from "@/action/department-action";
import { PaginationState } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Get all departments
export function useDepartments({ page, pageSize }: PaginationState) {
  return useQuery({
    queryKey: ["departments", page, pageSize],
    queryFn: () => getAllDepartments({ page, pageSize }),
  });
}

// Create department
export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createDepartment(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

// Update department
export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateDepartment(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["departments"],
      });
    },
  });
}

// Delete department
export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["departments"],
      });
    },
  });
}
