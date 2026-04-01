import {
  createAsset,
  deleteAsset,
  getAllAssets,
  getDepartmentsForAssetSelect,
  getItemsForSelect,
  getLocationsForSelect,
  updateAsset,
} from "@/action/asset-action";
import { PaginationState } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Get all assets
export function useAssets({ page, pageSize }: PaginationState) {
  return useQuery({
    queryKey: ["assets", page, pageSize],
    queryFn: () => getAllAssets({ page, pageSize }),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
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
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}

// Delete asset
export function useDeleteAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}
