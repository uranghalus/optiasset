import {
  createItem,
  deleteItem,
  getAllItems,
  getCategoriesForSelect,
  updateItem,
  getNextItemCode,
} from "@/action/item-action";
import { PaginationState } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Get all items
export function useItems({ page, pageSize }: PaginationState) {
  return useQuery({
    queryKey: ["items", page, pageSize],
    queryFn: () => getAllItems({ page, pageSize }),
  });
}

// Get categories for select dropdown
export function useCategoriesForSelect() {
  return useQuery({
    queryKey: ["categories-for-select"],
    queryFn: () => getCategoriesForSelect(),
  });
}

// Create item
export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createItem(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

// Update item
export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateItem(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

// Delete item
export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

// Get next item code
export function useNextItemCode(assetType: "FIXED" | "SUPPLY", enabled = true) {
  return useQuery({
    queryKey: ["next-item-code", assetType],
    queryFn: () => getNextItemCode(assetType),
    enabled: enabled && !!assetType,
    staleTime: 0, // Always get the latest
  });
}
