"use client";

import { getAssetHistoryByAssetId } from "@/action/asset-history-action";
import { useQuery } from "@tanstack/react-query";

interface UseAssetByIdProps {
    id?: string;
}
export function useAssetHistoryById({ id }: UseAssetByIdProps) {
    return useQuery({
        queryKey: ["asset-history", id],
        queryFn: () => {
            if (!id) throw new Error("Asset ID is required");
            return getAssetHistoryByAssetId(id);
        },
        enabled: !!id, // hanya jalan kalau ada id
        retry: 1, // biar tidak spam query
    });
}