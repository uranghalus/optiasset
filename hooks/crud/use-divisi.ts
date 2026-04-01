import {
  createDivisi,
  deleteDivisi,
  getAllDivisi,
  getDepartmentsForSelect,
  updateDivisi,
} from "@/action/divisi-action";
import { PaginationState } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Get all divisi
export function useDivisi({ page, pageSize }: PaginationState) {
  return useQuery({
    queryKey: ["divisi", page, pageSize],
    queryFn: () => getAllDivisi({ page, pageSize }),
  });
}

// Get departments for select dropdown
export function useDepartmentsForSelect() {
  return useQuery({
    queryKey: ["departments-for-select"],
    queryFn: () => getDepartmentsForSelect(),
  });
}

// Create divisi
export function useCreateDivisi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createDivisi(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["divisi"] });
    },
  });
}

// Update divisi
export function useUpdateDivisi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateDivisi(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["divisi"] });
    },
  });
}

// Delete divisi
export function useDeleteDivisi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDivisi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["divisi"] });
    },
  });
}
