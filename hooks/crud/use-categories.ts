import {
  createCategory,
  deleteCategory,
  deleteManyCategories,
  getAllCategories,
  updateCategory,
} from '@/action/category-action';
import { PaginationState } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
  const mutation = useMutation({
    mutationFn: (formData: FormData) => createCategory(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
  const mutateWithToast = (formData: FormData) => {
    // toast.promise menerima promise dari mutation.mutateAsync
    toast.promise(mutation.mutateAsync(formData), {
      loading: 'Membuat kategori...',
      success: 'Kategori berhasil dibuat!',
      error: 'Gagal membuat kategori.',
    });
    return {
      ...mutation,
      mutate: mutateWithToast, // Meng-override mutate biasa dengan versi toast
    };
  };

}
// Update category
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateCategory(id, formData),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
    },
  });
  const mutateWithToast = ({ id, formData }: { id: string; formData: FormData }) => {
    // toast.promise menerima promise dari mutation.mutateAsync
    toast.promise(mutation.mutateAsync({ id, formData }), {
      loading: 'Memperbarui kategori...',
      success: 'Kategori berhasil diperbarui!',
      error: 'Gagal memperbarui kategori.',
    });
    return {
      ...mutation,
      mutate: mutateWithToast, // Meng-override mutate biasa dengan versi toast
    };
  };
}
// Delete category
/* =======================
   DELETE
 ======================= */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
    },
  });
  const mutateWithToast = (id: string) => {
    // toast.promise menerima promise dari mutation.mutateAsync
    toast.promise(mutation.mutateAsync(id), {
      loading: 'Menghapus kategori...',
      success: 'Kategori berhasil dihapus!',
      error: 'Gagal menghapus kategori.',
    });
    return {
      ...mutation,
      mutate: mutateWithToast, // Meng-override mutate biasa dengan versi toast
    };
  };
}
// LINK MultiDelete Categories
export function useMultiDeleteCategories() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (ids: string[]) => deleteManyCategories(ids),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
    },
  });
  const mutateWithToast = (ids: string[]) => {
    // toast.promise menerima promise dari mutation.mutateAsync
    toast.promise(mutation.mutateAsync(ids), {
      loading: 'Menghapus kategori...',
      success: 'Kategori berhasil dihapus!',
      error: 'Gagal menghapus kategori.',
    });
    return {
      ...mutation,
      mutate: mutateWithToast, // Meng-override mutate biasa dengan versi toast
    };
  };
}
