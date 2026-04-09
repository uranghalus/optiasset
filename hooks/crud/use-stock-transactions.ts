import { getAllStockTransactions } from "@/action/stock-action";
import { useQuery } from "@tanstack/react-query";

export type TransactionQueryProps = {
  page: number;
  pageSize: number;
};

// Get all stock transactions
export function useStockTransactions({
  page,
  pageSize,
}: TransactionQueryProps) {
  return useQuery({
    queryKey: ["stock-transactions", page, pageSize],
    queryFn: () => getAllStockTransactions({ page, pageSize }),
  });
}
