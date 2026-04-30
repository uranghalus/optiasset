"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  useDeleteAssetGroup,
  useDeleteAssetCategory,
  useDeleteAssetCluster,
  useDeleteAssetSubCluster,
} from "@/hooks/crud/use-asset-classification";

function getChildLevel(level: string) {
  switch (level) {
    case "group":
      return "category";

    case "category":
      return "cluster";

    case "cluster":
      return "subcluster";

    default:
      throw new Error();
  }
}

export function NodeActionMenu({ node, level, editor }: any) {
  const deleteGroup = useDeleteAssetGroup();

  const deleteCategory = useDeleteAssetCategory();

  const deleteCluster = useDeleteAssetCluster();

  const deleteSubCluster = useDeleteAssetSubCluster();

  function handleDelete() {
    const ok = window.confirm(`Hapus ${node.name}?`);

    if (!ok) return;

    switch (level) {
      case "group":
        deleteGroup.mutate(node.id);
        break;

      case "category":
        deleteCategory.mutate(node.id);
        break;

      case "cluster":
        deleteCluster.mutate(node.id);
        break;

      case "subcluster":
        deleteSubCluster.mutate(node.id);
        break;
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button onClick={(e) => e.stopPropagation()}>•••</button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            e.stopPropagation();

            editor.editNode({
              id: node.id,
              level,
              data: node,
            });
          }}
        >
          Edit
        </DropdownMenuItem>

        {level !== "subcluster" && (
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              e.stopPropagation();

              editor.createChild(getChildLevel(level), node.id);
            }}
          >
            Add Child
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          className="text-red-500"
          onSelect={(e) => {
            e.preventDefault();
            e.stopPropagation();

            handleDelete();
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
