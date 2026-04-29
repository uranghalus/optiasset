import { taxonomyKeys } from "@/constants/classification-keys";
import { ClassificationTree } from "@/types";
import { QueryKey, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useTaxonomyMutation<TVariables>(
  mutationFn: (vars: TVariables) => Promise<any>,

  invalidate: QueryKey[] = [],

  optimisticUpdater?: (
    oldData: ClassificationTree | undefined,
    variables: TVariables
  ) => ClassificationTree,

  messages?: {
    loading?: string
    success?: string
    error?: string
  }

) {

  const qc =
    useQueryClient();

  return useMutation({

    mutationFn,

    onMutate: async (
      variables
    ) => {

      let toastId:
        string | number | undefined;

      if (messages?.loading) {
        toastId =
          toast.loading(
            messages.loading
          );
      }

      if (!optimisticUpdater) {
        return {
          toastId
        };
      }

      await qc.cancelQueries({
        queryKey:
          taxonomyKeys.tree
      });


      const previous =
        qc.getQueryData<
          ClassificationTree
        >(
          taxonomyKeys.tree
        );


      qc.setQueryData(
        taxonomyKeys.tree,
        (
          old:
            ClassificationTree
        ) =>
          optimisticUpdater(
            old,
            variables
          )
      );


      return {
        previous,
        toastId
      };

    },



    onError: (
      _err,
      _vars,
      context
    ) => {

      if (
        context?.previous
      ) {
        qc.setQueryData(
          taxonomyKeys.tree,
          context.previous
        )
      }


      if (
        context?.toastId
      ) {
        toast.dismiss(
          context.toastId
        )
      }


      toast.error(
        messages?.error ||
        "Operasi gagal"
      );

    },



    onSuccess: (
      _data,
      _vars,
      context
    ) => {

      if (
        context?.toastId
      ) {
        toast.dismiss(
          context.toastId
        )
      }


      toast.success(
        messages?.success ||
        "Berhasil"
      );

    },



    onSettled: () => {

      qc.invalidateQueries({
        queryKey:
          taxonomyKeys.tree
      });


      invalidate.forEach(
        (key) =>
          qc.invalidateQueries({
            queryKey: key
          })
      )

    }

  })
}

function tempId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

// LINK optimistic insert group
export function optimisticInsertGroup(
  tree: ClassificationTree | undefined,
  formData: FormData,
): ClassificationTree {
  if (!tree) return [];

  return [
    {
      id: tempId("group"),
      code: formData.get("code") as string,
      name: formData.get("name") as string,
      description: formData.get("description") as string,

      categories: [],
    },

    ...tree,
  ];
}
// LINK Optimistic Insert Category
export function optimisticInsertCategory(
  tree: ClassificationTree | undefined,
  formData: FormData,
): ClassificationTree {
  if (!tree) return [];

  const groupId = formData.get("assetGroupId") as string;

  return tree.map((group) => {
    if (group.id !== groupId) return group;

    return {
      ...group,
      categories: [
        ...group.categories,
        {
          id: tempId("cat"),
          code: formData.get("code") as string,

          name: formData.get("name") as string,

          description: formData.get("description") as string,

          assetClusters: [],
        },
      ],
    };
  });
}

// LINK optimistic insert cluster
export function optimisticInsertCluster(
  tree: ClassificationTree | undefined,
  formData: FormData,
): ClassificationTree {
  if (!tree) return [];

  const categoryId = formData.get("assetCategoryId") as string;

  return tree.map((group) => ({
    ...group,

    categories: group.categories.map((category) => {
      if (category.id !== categoryId) {
        return category;
      }

      return {
        ...category,
        assetClusters: [
          ...category.assetClusters,
          {
            id: tempId("cluster"),
            code: formData.get("code") as string,

            name: formData.get("name") as string,

            description: formData.get("description") as string,

            assetSubClusters: [],
          },
        ],
      };
    }),
  }));
}

// LINK optimistic insert sub cluster
export function optimisticInsertSubCluster(
  tree: ClassificationTree | undefined,
  formData: FormData,
): ClassificationTree {
  if (!tree) return [];

  const clusterId = formData.get("assetClusterId") as string;

  return tree.map((group) => ({
    ...group,

    categories: group.categories.map((cat) => ({
      ...cat,

      assetClusters: cat.assetClusters.map((cluster) => {
        if (cluster.id !== clusterId) {
          return cluster;
        }

        return {
          ...cluster,
          assetSubClusters: [
            ...cluster.assetSubClusters,
            {
              id: tempId("sub"),
              code: formData.get("code") as string,

              name: formData.get("name") as string,

              description: formData.get("description") as string,

              notes: formData.get("notes") as string,
            },
          ],
        };
      }),
    })),
  }));
}

// LINK delete Node
export function optimisticDeleteNode(
  tree: ClassificationTree | undefined,
  id: string,
): ClassificationTree {
  if (!tree) return [];

  return tree
    .filter((g) => g.id !== id)
    .map((group) => ({
      ...group,

      categories: group.categories
        .filter((c) => c.id !== id)
        .map((cat) => ({
          ...cat,

          assetClusters: cat.assetClusters
            .filter((c) => c.id !== id)
            .map((cluster) => ({
              ...cluster,

              assetSubClusters: cluster.assetSubClusters.filter(
                (s) => s.id !== id,
              ),
            })),
        })),
    }));
}

// LINK Update Node
export function optimisticRenameNode(
  tree: ClassificationTree | undefined,
  id: string,
  payload: {
    name: string;
    code?: string;
  },
): ClassificationTree {
  if (!tree) return [];

  return tree.map((group) => {
    if (group.id === id) {
      return {
        ...group,
        ...payload,
      };
    }

    return {
      ...group,

      categories: group.categories.map((cat) => {
        if (cat.id === id) {
          return {
            ...cat,
            ...payload,
          };
        }

        return {
          ...cat,

          assetClusters: cat.assetClusters.map((cluster) => {
            if (cluster.id === id) {
              return {
                ...cluster,
                ...payload,
              };
            }

            return {
              ...cluster,

              assetSubClusters: cluster.assetSubClusters.map((sub) =>
                sub.id === id
                  ? {
                    ...sub,
                    ...payload,
                  }
                  : sub,
              ),
            };
          }),
        };
      }),
    };
  });
}

type UpdateNodePayload = {
  id: string;
  formData: FormData;
};

export function optimisticUpdateNode(
  tree: ClassificationTree | undefined,
  payload: UpdateNodePayload,
): ClassificationTree {
  if (!tree) return [];

  const { id, formData } = payload;

  return optimisticRenameNode(tree, id, {
    code: formData.get("code") as string,

    name: formData.get("name") as string,
  });
}
