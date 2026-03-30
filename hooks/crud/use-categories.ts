import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from '@/action/category-action';
import { PaginationState } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Get all categories
export function useCategories({ page, pageSize }: PaginationState) {
  return useQuery({
    queryKey: ['categories', page, pageSize],
    queryFn: () => getAllCategories({ page, pageSize }),
  });
}

// Create category
export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createCategory(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
// Update category
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateCategory(id, formData),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
    },
  });
}
// Delete category
/* =======================
   DELETE
 ======================= */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
    },
  });
}
