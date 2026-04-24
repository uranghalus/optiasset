import {
  getAllDisposals,
  createDisposalAction,
} from "@/action/asset-disposal-action";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type DisposalQueryProps = {
  page: number;
  pageSize: number;
  assetId?: string;
  status?: string[];
};

// Get all disposals
export function useAssetDisposals({
  page,
  pageSize,
  assetId,
  status,
}: DisposalQueryProps) {
  return useQuery({
    queryKey: ["asset-disposals", page, pageSize, assetId, status],
    queryFn: () => getAllDisposals({ page, pageSize, assetId, status }),
  });
}

// Create disposal
export function useCreateDisposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createDisposalAction(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["asset-disposals"] });
      toast.success("Penghapusan aset berhasil diajukan");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal mengajukan penghapusan aset");
    },
  });
}

// Approve or reject disposal
export function useApproveDisposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action, role }: { id: string; action: 'APPROVE' | 'REJECT', role: string }) => {
      return import("@/action/asset-disposal-action").then((m) =>
        m.approveDisposalAction(id, action, role)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["asset-disposals"] });
      toast.success("Persetujuan penghapusan berhasil di-update");
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal memproses persetujuan penghapusan");
    },
  });
}
