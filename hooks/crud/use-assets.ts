import {
  createAsset,
  deleteAsset,
  exportAssetPDF,
  getAllAssets,
  getAssetById,
  getDepartmentsForAssetSelect,
  getItemsForSelect,
  getLocationsForSelect,
  updateAsset,
} from '@/action/asset-action';
import { PaginationState } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Get all assets
export function useAssets({
  page,
  pageSize,
  condition,
  departmentId,
}: PaginationState) {
  return useQuery({
    queryKey: ['assets', page, pageSize, condition, departmentId], // 🔥 TAMBAHKAN INI
    queryFn: () => getAllAssets({ page, pageSize, condition, departmentId }),
  });
}
interface UseAssetByIdProps {
  id?: string;
  organizationId: string;
}

export function useAssetById({ id, organizationId }: UseAssetByIdProps) {
  return useQuery({
    queryKey: ['asset', id, organizationId],
    queryFn: () => {
      if (!id) throw new Error('Asset ID is required');
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
        throw new Error('Asset tidak ditemukan');
      }

      return res;
    },
  });
}
// Get items for select
export function useItemsForSelect() {
  return useQuery({
    queryKey: ['items-for-select'],
    queryFn: () => getItemsForSelect(),
  });
}

// Get locations for select
export function useLocationsForSelect() {
  return useQuery({
    queryKey: ['locations-for-select'],
    queryFn: () => getLocationsForSelect(),
  });
}

// Get departments for select
export function useDepartmentsForAssetSelect() {
  return useQuery({
    queryKey: ['departments-for-asset-select'],
    queryFn: () => getDepartmentsForAssetSelect(),
  });
}

// Create asset
export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createAsset(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

// Update asset
export function useUpdateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateAsset(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

// Delete asset
export function useDeleteAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
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
      type: 'all' | 'latest' | 'range';
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
