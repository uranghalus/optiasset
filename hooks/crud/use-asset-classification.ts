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
    {
      loading: "Menambahkan data...",
      success: "Data berhasil ditambahkan",
      error: "Gagal menambahkan data"
    }
  );

export const useUpdateAssetGroup = () =>
  useTaxonomyMutation(
    ({ id, formData }: any) => updateAssetGroup(id, formData),
    [taxonomyKeys.groups],
    optimisticUpdateNode,
    {
      loading: "Memperbarui data...",
      success: "Data berhasil diperbarui",
      error: "Gagal memperbarui data"
    }
  );

export const useDeleteAssetGroup = () =>
  useTaxonomyMutation(
    deleteAssetGroup,
    [taxonomyKeys.groups],
    optimisticDeleteNode,
    {
      loading: "Menghapus data...",
      success: "Data berhasil dihapus",
      error: "Gagal menghapus data"
    }
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
    {
      loading: "Menambahkan data...",
      success: "Data berhasil ditambahkan",
      error: "Gagal menambahkan data"
    }
  );

export const useUpdateAssetCategory = () =>
  useTaxonomyMutation(
    ({ id, formData }: any) => updateAssetCategory(id, formData),
    [taxonomyKeys.categories],
    optimisticUpdateNode,
    {
      loading: "Memperbarui data...",
      success: "Data berhasil diperbarui",
      error: "Gagal memperbarui data"
    }
  );

export const useDeleteAssetCategory = () =>
  useTaxonomyMutation(
    deleteAssetCategory,
    [taxonomyKeys.categories],
    optimisticDeleteNode,
    {
      loading: "Menghapus data...",
      success: "Data berhasil dihapus",
      error: "Gagal menghapus data"
    }
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
    {
      loading: "Menambahkan data...",
      success: "Data berhasil ditambahkan",
      error: "Gagal menambahkan data"
    }
  );

export const useUpdateAssetCluster = () =>
  useTaxonomyMutation(
    ({ id, formData }: any) => updateAssetCluster(id, formData),
    [taxonomyKeys.clusters],
    optimisticUpdateNode,
    {
      loading: "Memperbarui data...",
      success: "Data berhasil diperbarui",
      error: "Gagal memperbarui data"
    }
  );

export const useDeleteAssetCluster = () =>
  useTaxonomyMutation(
    deleteAssetCluster,
    [taxonomyKeys.clusters],
    optimisticDeleteNode,
    {
      loading: "Menghapus data...",
      success: "Data berhasil dihapus",
      error: "Gagal menghapus data"
    }
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
    {
      loading: "Menambahkan data...",
      success: "Data berhasil ditambahkan",
      error: "Gagal menambahkan data"
    }
  );

export const useUpdateAssetSubCluster = () =>
  useTaxonomyMutation(
    ({ id, formData }: any) => updateAssetSubCluster(id, formData),
    [taxonomyKeys.subClusters],
    optimisticUpdateNode,
    {
      loading: "Memperbarui data...",
      success: "Data berhasil diperbarui",
      error: "Gagal memperbarui data"
    }
  );

export const useDeleteAssetSubCluster = () =>
  useTaxonomyMutation(
    deleteAssetSubCluster,
    [taxonomyKeys.subClusters],
    optimisticDeleteNode,
    {
      loading: "Menghapus data...",
      success: "Data berhasil dihapus",
      error: "Gagal menghapus data"
    }
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
