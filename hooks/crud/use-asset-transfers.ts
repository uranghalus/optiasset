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
  status?: string[];
};

// Get all transfers
export function useAssetTransfers({
  page,
  pageSize,
  assetId,
  status,
}: TransferQueryProps) {
  return useQuery({
    queryKey: ["asset-transfers", page, pageSize, assetId, status],
    queryFn: () => getAllTransfers({ page, pageSize, assetId, status }),
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

// Approve or reject transfer
export function useApproveAssetTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) => {
      // Import here to avoid circular dependencies if any, but since it's a server action, it's fine.
      return import("@/action/asset-transfer-action").then((m) =>
        m.approveAssetTransferAction(id, status)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["asset-transfers"] });
      toast.success("Mutasi aset berhasil di-update");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal meng-update mutasi aset");
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
