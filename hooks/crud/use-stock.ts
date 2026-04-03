import { getLocationsForSelect } from "@/action/location-action";
import {
  getStockByItem,
  getStockTransactions,
  recordStockTransaction,
} from "@/action/stock-action";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Get all stocks for an item
export function useItemStocks(itemId: string | undefined) {
  return useQuery({
    queryKey: ["item-stocks", itemId],
    queryFn: () => getStockByItem(itemId!),
    enabled: !!itemId,
  });
}

// Get locations for select
export function useLocationsForSelect() {
  return useQuery({
    queryKey: ["locations-for-select"],
    queryFn: () => getLocationsForSelect(),
  });
}

// Get stock transactions
export function useStockTransactions(stockId: string | undefined) {
  return useQuery({
    queryKey: ["stock-transactions", stockId],
    queryFn: () => getStockTransactions(stockId!),
    enabled: !!stockId,
  });
}

// Record transaction
export function useRecordStockTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      stockId?: string;
      itemId?: string;
      locationId?: string | null;
      type: "IN" | "OUT" | "ADJUSTMENT";
      quantity: number;
      reference?: string;
      notes?: string;
    }) => recordStockTransaction(data),
    onSuccess: (_, variables) => {
      if (variables.stockId) {
        queryClient.invalidateQueries({
          queryKey: ["stock-transactions", variables.stockId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["item-stocks"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}
