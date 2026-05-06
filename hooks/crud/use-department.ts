import {
  createDepartment,
  deleteDepartment,
  getAllDepartments,
  selectDepartment,
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
      // PANGGIL DUA KALI UNTUK KEY YANG BERBEDA
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["departments-select"] });
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
      // PANGGIL DUA KALI UNTUK KEY YANG BERBEDA
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["departments-select"] });
    },
  });
}

// Delete department
export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: () => {
      // PANGGIL DUA KALI UNTUK KEY YANG BERBEDA
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["departments-select"] });
    },
  });
}

// Select Department
export function useSelectDepartment() {
  return useQuery({
    queryKey: ["departments-select"],
    queryFn: () => selectDepartment(),
  });
}