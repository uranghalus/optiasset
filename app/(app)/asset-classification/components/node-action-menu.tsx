"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

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
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <MoreHorizontal size={14} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editor.editNode({ id: node.id, level, data: node });
          }}
          className="gap-2"
        >
          <Pencil className="h-4 w-4 text-muted-foreground" />
          Edit
        </DropdownMenuItem>

        {level !== "subcluster" && (
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editor.createChild(getChildLevel(level), node.id);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
            Tambah Anak
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="gap-2 text-destructive focus:text-destructive"
          onSelect={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDelete();
          }}
        >
          <Trash2 className="h-4 w-4" />
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
