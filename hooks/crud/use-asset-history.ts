import { getAllAssetHistory } from "@/action/asset-history-action";
import { PaginationState } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface AssetHistoryQueryProps extends PaginationState {
  assetId?: string;
}

// Get all asset history
export function useAssetHistory({
  page,
  pageSize,
  assetId,
}: AssetHistoryQueryProps) {
  return useQuery({
    queryKey: ["asset-history", page, pageSize, assetId],
    queryFn: () => getAllAssetHistory({ page, pageSize, assetId }),
  });
}
