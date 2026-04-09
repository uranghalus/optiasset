import {
  getAllTransfers,
  transferAssetAction,
} from "@/action/asset-transfer-action";
import { getDivisiForSelect } from "@/action/divisi-action";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type TransferQueryProps = {
  page: number;
  pageSize: number;
  assetId?: string;
};

// Get all transfers
export function useAssetTransfers({
  page,
  pageSize,
  assetId,
}: TransferQueryProps) {
  return useQuery({
    queryKey: ["asset-transfers", page, pageSize, assetId],
    queryFn: () => getAllTransfers({ page, pageSize, assetId }),
  });
}

// Perform transfer
export function useTransferAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => transferAssetAction(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["asset-transfers"] });
      toast.success("Aset berhasil dipindahkan");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal memindahkan aset");
    },
  });
}

// Get divisions for select
export function useDivisiForSelect(departmentId?: string) {
  return useQuery({
    queryKey: ["divisions-for-select", departmentId],
    queryFn: () => getDivisiForSelect(departmentId),
  });
}
