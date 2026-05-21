import {
  createCategory,
  deleteCategory,
  deleteManyCategories,
  getAllCategories,
  importCategoryExcel,
  updateCategory,
} from '@/action/category-action';
import { PaginationState } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Get all categories
export function useCategories({ page, pageSize, search }: PaginationState) {
  return useQuery({
    queryKey: ['categories', page, pageSize, search],
    queryFn: () => getAllCategories({ page, pageSize, search }),
  });
}

// Create category
export function useCreateCategory() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: FormData) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const mutateWithToast = (data: FormData) => {
    // toast.promise membungkus promise dari mutateAsync
    toast.promise(mutation.mutateAsync(data), {
      loading: 'Membuat kategori baru...',
      success: 'Kategori berhasil dibuat!',
      error: 'Gagal membuat kategori.',
    });
  };

  return {
    ...mutation, // Ini yang mengirimkan `isPending` keluar
    mutate: mutateWithToast, // Ini meng-override mutate biasa dengan versi toast
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

  const mutateWithToast = ({
    id,
    formData,
  }: {
    id: string;
    formData: FormData;
  }) => {
    // toast.promise menerima promise dari mutation.mutateAsync
    toast.promise(mutation.mutateAsync({ id, formData }), {
      loading: 'Memperbarui kategori...',
      success: 'Kategori berhasil diperbarui!',
      error: 'Gagal memperbarui kategori.',
    });
  };

  // KOREKSI: Pindahkan return ke sini (di luar fungsi mutateWithToast)
  return {
    ...mutation,
    mutate: mutateWithToast, // Meng-override mutate biasa dengan versi toast
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
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const mutateWithToast = (id: string) => {
    toast.promise(mutation.mutateAsync(id), {
      loading: 'Menghapus kategori...',
      success: 'Kategori berhasil dihapus!',
      error: 'Gagal menghapus kategori.',
    });
  };

  return {
    ...mutation, // <-- Ini otomatis mengekspor isPending, isSuccess, error, dll.
    mutate: mutateWithToast,
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
// LINK Import Excel Categories
export function useImportCategoriesExcel() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await importCategoryExcel(formData);

      // Jika action mengembalikan error, throw agar masuk ke state error di toast
      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
    },
  });

  const mutateWithToast = (
    formData: FormData,
    p0: { onSuccess: () => void },
  ) => {
    // toast.promise menerima promise dari mutation.mutateAsync
    toast.promise(mutation.mutateAsync(formData), {
      loading: 'Mengimpor kategori dari Excel...',
      // Menampilkan pesan sukses langsung dari response server jika ada
      success: (data) => data.success || 'Kategori berhasil diimport!',
      // Menampilkan pesan error dari throw Error di atas
      error: (err) => err.message || 'Gagal mengimpor kategori.',
    });
  };

  return {
    ...mutation,
    mutate: mutateWithToast, // Meng-override mutate biasa dengan versi toast
  };
}
