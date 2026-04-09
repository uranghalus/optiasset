import { getAllStocks, recordStockTransaction } from "@/action/stock-action";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type StockQueryProps = {
  page: number;
  pageSize: number;
};

// Get all stocks
export function useStocks({ page, pageSize }: StockQueryProps) {
  return useQuery({
    queryKey: ["stocks", page, pageSize],
    queryFn: () => getAllStocks({ page, pageSize }),
  });
}

// Record stock transaction
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      toast.success("Transaksi stok berhasil dicatat");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal mencatat transaksi stok");
    },
  });
}
