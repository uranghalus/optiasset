export const taxonomyQueryKeys = {
  groupList: (page: number, pageSize: number) =>
    ["asset-groups", page, pageSize] as const,

  categoriesByGroup: (groupId: string) =>
    ["asset-categories", groupId] as const,

  clustersByCategory: (categoryId: string) =>
    ["asset-clusters", categoryId] as const,

  subClustersByCluster: (clusterId: string) =>
    ["asset-sub-clusters", clusterId] as const,

  subClusterDetail: (id: string) => ["asset-sub-cluster", id] as const,
};
export const taxonomyKeys = {
  groups: ["asset-groups"] as const,
  groupSelect: ["asset-groups-select"] as const,
  categories: ["asset-categories"] as const,
  clusters: ["asset-clusters"] as const,
  subClusters: ["asset-sub-clusters"] as const,
  tree: ["asset-classification-tree"] as const,
};
