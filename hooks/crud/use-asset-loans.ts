/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getAllLoans,
  requestLoanAction,
  approveLoanAction,
  rejectLoanAction,
  returnAssetAction,
} from '@/action/asset-loan-action';
import { getUsersForSelect } from '@/action/user-action';
import {
  getDepartmentsForAssetSelect,
  getAvailableAssetsForLoanSelect,
  assignAssetAction,
} from '@/action/asset-action';
import { getDivisiForSelect } from '@/action/divisi-action';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type LoanArgs = {
  page?: number;
  pageSize?: number;
  assetId?: string;
  status?: string;
};

// Get all loans
export function useAssetLoans({ page, pageSize, assetId, status }: LoanArgs) {
  return useQuery({
    queryKey: ['asset-loans', page, pageSize, assetId, status],
    queryFn: () => getAllLoans({ page, pageSize, assetId, status }),
  });
}

// Request loan (Pending)
export function useRequestLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => requestLoanAction(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-loans'] });
      toast.success('Permintaan peminjaman telah dikirim');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal mengirim permintaan');
    },
  });
}

// Approve loan
export function useApproveLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (loanId: string) => approveLoanAction(loanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-loans'] });
      toast.success('Peminjaman disetujui');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menyetujui peminjaman');
    },
  });
}

// Reject loan
export function useRejectLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ loanId, reason }: { loanId: string; reason: string }) =>
      rejectLoanAction(loanId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-loans'] });
      toast.success('Peminjaman ditolak');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menolak peminjaman');
    },
  });
}

// Process return
export function useReturnAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      loanId,
      formData,
    }: {
      loanId: string;
      formData: FormData;
    }) => returnAssetAction(loanId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-loans'] });
      toast.success('Aset berhasil dikembalikan');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal memproses pengembalian');
    },
  });
}

// Get users for select
export function useUsersForSelect() {
  return useQuery({
    queryKey: ['users-for-select'],
    queryFn: () => getUsersForSelect(),
  });
}

// Get departments for loan
export function useLoanDepartments() {
  return useQuery({
    queryKey: ['loan-departments'],
    queryFn: () => getDepartmentsForAssetSelect(),
  });
}

// Get divisis by department
export function useLoanDivisis(departmentId?: string) {
  return useQuery({
    queryKey: ['loan-divisis', departmentId],
    queryFn: () => getDivisiForSelect(departmentId),
    enabled: !!departmentId,
  });
}

// Get available assets for loan
export function useAvailableLoanAssets(
  departmentId?: string,
  divisiId?: string,
) {
  return useQuery({
    queryKey: ['available-loan-assets', departmentId, divisiId],
    queryFn: () =>
      getAvailableAssetsForLoanSelect({
        departmentId: departmentId!,
        divisiId,
      }),
    enabled: !!departmentId,
  });
}
type AssignPayload = {
  assetId: string;
  departmentId: string;
  userId: string;
};

export function useAssignAsset(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (payload: AssignPayload) => assignAssetAction(payload),

    onSuccess: () => {
      toast.success('Asset berhasil diserahkan');

      onSuccess?.();
    },

    onError: (err: any) => {
      toast.error(err.message ?? 'Gagal assign asset');
    },
  });
}
