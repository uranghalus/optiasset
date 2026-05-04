import {
  createAsset,
  deleteAsset,
  exportAssetPDF,
  generateAssetCode,
  getAllAssets,
  getAssetById,
  getDepartmentsForAssetSelect,
  getItemsForSelect,
  getLocationsForSelect,
  importAssetExcel,
  updateAsset,
} from "@/action/asset-action";
import { PaginationState } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Get all assets
export function useAssets({
  page,
  pageSize,
  condition,
  departmentId,
}: PaginationState) {
  return useQuery({
    queryKey: ["assets", page, pageSize, condition, departmentId], // 🔥 TAMBAHKAN INI
    queryFn: () => getAllAssets({ page, pageSize, condition, departmentId }),
  });
}
interface UseAssetByIdProps {
  id?: string;
  organizationId: string;
}

export function useAssetById({ id, organizationId }: UseAssetByIdProps) {
  return useQuery({
    queryKey: ["asset", id, organizationId],
    queryFn: () => {
      if (!id) throw new Error("Asset ID is required");
      return getAssetById(id);
    },
    enabled: !!id, // hanya jalan kalau ada id
    retry: 1, // biar tidak spam query
  });
}
export function useAssetLookup() {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await getAssetById(id);

      if (!res) {
        throw new Error("Asset tidak ditemukan");
      }

      return res;
    },
  });
}
// Get items for select
export function useItemsForSelect() {
  return useQuery({
    queryKey: ["items-for-select"],
    queryFn: () => getItemsForSelect(),
  });
}

// Get locations for select
export function useLocationsForSelect() {
  return useQuery({
    queryKey: ["locations-for-select"],
    queryFn: () => getLocationsForSelect(),
  });
}

// Get departments for select
export function useDepartmentsForAssetSelect() {
  return useQuery({
    queryKey: ["departments-for-asset-select"],
    queryFn: () => getDepartmentsForAssetSelect(),
  });
}

// Create asset
export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createAsset(formData),
    onMutate: () => {
      // Munculkan toast loading dengan ID khusus
      toast.loading("Menyimpan data aset...", {
        id: "create-asset-toast",
        description: "Proses penyimpanan sedang berlangsung.",
      });
    },
    onSuccess: () => {
      // Timpa loading menjadi success menggunakan ID yang sama
      toast.success("Berhasil!", {
        id: "create-asset-toast",
        description: "Data aset berhasil ditambahkan.",
      });

      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: (error: any) => {
      // Timpa loading menjadi error menggunakan ID yang sama
      toast.error("Gagal menyimpan data", {
        id: "create-asset-toast",
        description: error?.message || "Terjadi kesalahan yang tidak terduga.",
      });
    },
  });
}

// Update asset
export function useUpdateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateAsset(id, formData),
    onMutate: () => {
      // Munculkan toast loading dengan ID khusus
      toast.loading("Menyimpan data aset...", {
        id: "update-asset-toast",
        description: "Proses penyimpanan sedang berlangsung.",
      });
    },
    onSuccess: () => {
      // Timpa loading menjadi success menggunakan ID yang sama
      toast.success("Berhasil!", {
        id: "update-asset-toast",
        description: "Data aset berhasil diupdate.",
      });

      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: (error: any) => {
      // Timpa loading menjadi error menggunakan ID yang sama
      toast.error("Gagal menyimpan data", {
        id: "update-asset-toast",
        description: error?.message || "Terjadi kesalahan yang tidak terduga.",
      });
    },
  });
}

// Delete asset
export function useDeleteAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAsset(id),
    onMutate: () => {
      // Munculkan toast loading dengan ID khusus
      toast.loading("Menghapus data aset...", {
        id: "delete-asset-toast",
        description: "Proses penghapusan sedang berlangsung.",
      });
    },
    onSuccess: () => {
      // Timpa loading menjadi success menggunakan ID yang sama
      toast.success("Berhasil!", {
        id: "delete-asset-toast",
        description: "Data aset berhasil dihapus.",
      });

      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: (error: any) => {
      // Timpa loading menjadi error menggunakan ID yang sama
      toast.error("Gagal menghapus data", {
        id: "delete-asset-toast",
        description: error?.message || "Terjadi kesalahan yang tidak terduga.",
      });
    },
  });
}
// LINK print asset
export function useExportAssets() {
  return useMutation({
    mutationFn: async ({
      type,
      dateFrom,
      dateTo,
      organizationId,
    }: {
      type: "all" | "latest" | "range";
      dateFrom?: Date;
      dateTo?: Date;
      organizationId: string;
    }) => {
      return await exportAssetPDF({
        type,
        dateFrom: dateFrom?.toISOString(),
        dateTo: dateTo?.toISOString(),
        organizationId,
      });
    },
  });
}
// LINK generate asset code
export function useGenerateAssetCode(
  groupId?: string,
  categoryId?: string,
  clusterId?: string,
  subClusterId?: string,
) {
  return useQuery({
    queryKey: [
      "generate-asset-code",
      groupId,
      categoryId,
      clusterId,
      subClusterId,
    ],

    queryFn: () =>
      generateAssetCode(groupId!, categoryId!, clusterId!, subClusterId),

    enabled: !!groupId && !!categoryId && !!clusterId && !!subClusterId,
  });
}
// LINK Import asset
export function useImportAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      formData,
      organizationId,
    }: {
      formData: FormData;
      organizationId: string;
    }) => importAssetExcel(formData, organizationId),
    onMutate: () => {
      // Munculkan toast loading dengan ID khusus
      toast.loading("Mengimpor data aset dari Excel...", {
        id: "import-asset-toast",
        description: "Mohon tunggu, proses ini mungkin membutuhkan waktu.",
      });
    },
    onSuccess: (result) => {
      // Result didapat dari return value server action: { success: number, failed: number, errors: string[] }

      if (result.failed > 0) {
        // Timpa loading menjadi warning jika ada baris yang gagal
        toast.warning("Import selesai dengan peringatan!", {
          id: "import-asset-toast",
          description: `Berhasil: ${result.success} baris. Gagal: ${result.failed} baris.`,
        });
      } else {
        // Timpa loading menjadi success jika semua baris berhasil
        toast.success("Import Berhasil!", {
          id: "import-asset-toast",
          description: `${result.success} data aset berhasil ditambahkan.`,
        });
      }

      // Refresh data tabel asset
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      // Anda juga bisa menambahkan invalidation untuk item dan location jika diperlukan
      // queryClient.invalidateQueries({ queryKey: ["items"] });
      // queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
    onError: (error: any) => {
      // Timpa loading menjadi error menggunakan ID yang sama
      toast.error("Gagal mengimpor data", {
        id: "import-asset-toast",
        description:
          error?.message || "Terjadi kesalahan format Excel atau sistem.",
      });
    },
  });
}
