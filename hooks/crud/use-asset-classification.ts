import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createAssetCategory,
  createAssetCluster,
  createAssetGroup,
  createAssetSubCluster,
  updateAssetGroup,
  updateAssetCategory,
  updateAssetCluster,
  updateAssetSubCluster,
  deleteAssetGroup,
  deleteAssetCategory,
  deleteAssetCluster,
  deleteAssetSubCluster,
  getAssetGroups,
  getAssetGroupsForSelect,
  getCategoriesByGroup,
  getClassificationTree,
  getClustersByCategory,
  getSubClustersByCluster,
  getSubClusterById,
} from "@/action/asset-classification-action";
import { ClassificationTree, PaginationState } from "@/types";
import { useState } from "react";
import {
  taxonomyKeys,
  taxonomyQueryKeys,
} from "@/constants/classification-keys";
import {
  useTaxonomyMutation,
  optimisticInsertGroup,
  optimisticUpdateNode,
  optimisticDeleteNode,
  optimisticInsertCategory,
  optimisticInsertCluster,
  optimisticInsertSubCluster,
} from "./asset-classification/helper";
export { useClassificationEditor } from "./asset-classification/use-classification-editor";

// LINK Group
export function useAssetGroups({ page, pageSize }: PaginationState) {
  return useQuery({
    queryKey: taxonomyQueryKeys.groupList(page, pageSize),
    queryFn: () =>
      getAssetGroups({
        page,
        pageSize,
      }),
  });
}
export function useAssetGroupsForSelect() {
  return useQuery({
    queryKey: taxonomyKeys.groupSelect,
    queryFn: getAssetGroupsForSelect,
  });
}

export const useCreateAssetGroup = () =>
  useTaxonomyMutation(
    createAssetGroup,
    [taxonomyKeys.groups, taxonomyKeys.groupSelect],
    optimisticInsertGroup,
  );

export const useUpdateAssetGroup = () =>
  useTaxonomyMutation(
    ({ id, formData }: any) => updateAssetGroup(id, formData),
    [taxonomyKeys.groups],
    optimisticUpdateNode,
  );

export const useDeleteAssetGroup = () =>
  useTaxonomyMutation(
    deleteAssetGroup,
    [taxonomyKeys.groups],
    optimisticDeleteNode,
  );

// LINK Category
export function useCategoriesByGroup(groupId?: string) {
  return useQuery({
    queryKey: groupId
      ? taxonomyQueryKeys.categoriesByGroup(groupId)
      : ["disabled"],

    queryFn: () => {
      if (!groupId) throw new Error();

      return getCategoriesByGroup(groupId);
    },

    enabled: !!groupId,
  });
}

export const useCreateAssetCategory = () =>
  useTaxonomyMutation(
    createAssetCategory,
    [taxonomyKeys.categories],
    optimisticInsertCategory,
  );

export const useUpdateAssetCategory = () =>
  useTaxonomyMutation(
    ({ id, formData }: any) => updateAssetCategory(id, formData),
    [taxonomyKeys.categories],
    optimisticUpdateNode,
  );

export const useDeleteAssetCategory = () =>
  useTaxonomyMutation(
    deleteAssetCategory,
    [taxonomyKeys.categories],
    optimisticDeleteNode,
  );
// LINK Cluster
export function useClustersByCategory(id?: string) {
  return useQuery({
    queryKey: id ? taxonomyQueryKeys.clustersByCategory(id) : ["disabled"],

    queryFn: () => {
      if (!id) throw new Error();

      return getClustersByCategory(id);
    },

    enabled: !!id,
  });
}
export const useCreateAssetCluster = () =>
  useTaxonomyMutation(
    createAssetCluster,
    [taxonomyKeys.clusters],
    optimisticInsertCluster,
  );

export const useUpdateAssetCluster = () =>
  useTaxonomyMutation(
    ({ id, formData }: any) => updateAssetCluster(id, formData),
    [taxonomyKeys.clusters],
    optimisticUpdateNode,
  );

export const useDeleteAssetCluster = () =>
  useTaxonomyMutation(
    deleteAssetCluster,
    [taxonomyKeys.clusters],
    optimisticDeleteNode,
  );
// LINK Sub Cluster
export function useSubClustersByCluster(id?: string) {
  return useQuery({
    queryKey: id ? taxonomyQueryKeys.subClustersByCluster(id) : ["disabled"],

    queryFn: () => {
      if (!id) throw new Error();

      return getSubClustersByCluster(id);
    },

    enabled: !!id,
  });
}
export const useCreateAssetSubCluster = () =>
  useTaxonomyMutation(
    createAssetSubCluster,
    [taxonomyKeys.subClusters],
    optimisticInsertSubCluster,
  );

export const useUpdateAssetSubCluster = () =>
  useTaxonomyMutation(
    ({ id, formData }: any) => updateAssetSubCluster(id, formData),
    [taxonomyKeys.subClusters],
    optimisticUpdateNode,
  );

export const useDeleteAssetSubCluster = () =>
  useTaxonomyMutation(
    deleteAssetSubCluster,
    [taxonomyKeys.subClusters],
    optimisticDeleteNode,
  );
export function useSubClusterById(id?: string) {
  return useQuery({
    queryKey: id ? taxonomyQueryKeys.subClusterDetail(id) : ["disabled"],

    queryFn: () => {
      if (!id) throw new Error();

      return getSubClusterById(id);
    },

    enabled: !!id,
  });
}
export function useClassificationTree() {
  return useQuery({
    queryKey: taxonomyKeys.tree,

    queryFn: getClassificationTree,
  });
}
