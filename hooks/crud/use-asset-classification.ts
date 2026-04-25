import {
    createAssetCategory,
    createAssetCluster,
    createAssetGroup,
    createAssetSubCluster,
    deleteAssetGroup,
    getAssetGroups,
    getAssetGroupsForSelect,
    getCategoriesByGroup,
    getClassificationTree,
    getClustersByCategory,
    getSubClusterById,
    getSubClustersByCluster,
    updateAssetGroup,
} from '@/action/asset-classification-action';

import { PaginationState } from '@/types';

import {
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';



/* =========================
 ASSET GROUP (GOLONGAN)
========================= */

export function useAssetGroups({
    page,
    pageSize
}: PaginationState) {

    return useQuery({
        queryKey: [
            'asset-groups',
            page,
            pageSize
        ],
        queryFn: () => getAssetGroups({
            page,
            pageSize
        })
    });

}


export function useAssetGroupsForSelect() {
    return useQuery({
        queryKey: ['asset-groups-select'],
        queryFn: () => getAssetGroupsForSelect()
    })
}



/* =========================
 CATEGORY
========================= */

export function useCategoriesByGroup(
    assetGroupId?: string
) {
    return useQuery({
        queryKey: [
            'asset-categories',
            assetGroupId
        ],
        queryFn: () => {
            if (!assetGroupId) {
                throw new Error('assetGroupId required');
            }

            return getCategoriesByGroup(
                assetGroupId
            );
        },
        enabled: !!assetGroupId
    })
}



/* =========================
 CLUSTER
========================= */

export function useClustersByCategory(
    categoryId?: string
) {
    return useQuery({
        queryKey: [
            'asset-clusters',
            categoryId
        ],
        queryFn: () => {
            if (!categoryId) {
                throw new Error('categoryId required');
            }

            return getClustersByCategory(
                categoryId
            )
        },
        enabled: !!categoryId
    })
}



/* =========================
 SUB CLUSTER
========================= */

export function useSubClustersByCluster(
    clusterId?: string
) {
    return useQuery({
        queryKey: [
            'asset-sub-clusters',
            clusterId
        ],
        queryFn: () => {
            if (!clusterId) {
                throw new Error('clusterId required');
            }

            return getSubClustersByCluster(
                clusterId
            )
        },
        enabled: !!clusterId
    })
}



/* =========================
 SUB CLUSTER DETAIL
========================= */

export function useSubClusterById(
    id?: string
) {
    return useQuery({
        queryKey: [
            'asset-sub-cluster',
            id
        ],
        queryFn: () => {
            if (!id) {
                throw new Error(
                    'SubCluster id required'
                );
            }

            return getSubClusterById(id);
        },
        enabled: !!id,
        retry: 1
    })
}



/* =========================
 TREE
========================= */

export function useClassificationTree() {

    return useQuery({
        queryKey: [
            'asset-classification-tree'
        ],
        queryFn: () => getClassificationTree()
    })

}



/* =========================
 CREATE GROUP
========================= */

export function useCreateAssetGroup() {

    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            formData: FormData
        ) => createAssetGroup(
            formData
        ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['asset-groups']
            });

            queryClient.invalidateQueries({
                queryKey: [
                    'asset-groups-select'
                ]
            });

            queryClient.invalidateQueries({
                queryKey: [
                    'asset-classification-tree'
                ]
            });
        }
    })

}



/* =========================
 UPDATE GROUP
========================= */

export function useUpdateAssetGroup() {

    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            formData
        }: {
            id: string;
            formData: FormData;
        }) =>
            updateAssetGroup(
                id,
                formData
            ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['asset-groups']
            });

            queryClient.invalidateQueries({
                queryKey: [
                    'asset-classification-tree'
                ]
            });
        }
    })

}



/* =========================
 DELETE GROUP
========================= */

export function useDeleteAssetGroup() {

    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            id: string
        ) => deleteAssetGroup(
            id
        ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    'asset-groups'
                ]
            });

            queryClient.invalidateQueries({
                queryKey: [
                    'asset-classification-tree'
                ]
            });
        }
    })

}



/* =========================
 CREATE CATEGORY
========================= */

export function useCreateAssetCategory() {

    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            formData: FormData
        ) => createAssetCategory(
            formData
        ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    'asset-categories'
                ]
            });

            queryClient.invalidateQueries({
                queryKey: [
                    'asset-classification-tree'
                ]
            });
        }
    })

}



/* =========================
 CREATE CLUSTER
========================= */

export function useCreateAssetCluster() {

    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            formData: FormData
        ) => createAssetCluster(
            formData
        ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    'asset-clusters'
                ]
            });

            queryClient.invalidateQueries({
                queryKey: [
                    'asset-classification-tree'
                ]
            });
        }
    })

}



/* =========================
 CREATE SUB CLUSTER
========================= */

export function useCreateAssetSubCluster() {

    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            formData: FormData
        ) => createAssetSubCluster(
            formData
        ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    'asset-sub-clusters'
                ]
            });

            queryClient.invalidateQueries({
                queryKey: [
                    'asset-classification-tree'
                ]
            });
        }
    })

}