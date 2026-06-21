"use client";

import {
  Folder,
  Layers,
  Package,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  useDeleteAssetGroup,
  useDeleteAssetCategory,
  useDeleteAssetCluster,
  useDeleteAssetSubCluster,
} from "@/hooks/crud/use-asset-classification";
import { cn } from "@/lib/utils";

const levelConfig: Record<
  string,
  {
    icon: typeof Folder;
    label: string;
    childLabel: string;
    color: string;
    bg: string;
    border: string;
    badgeClass: string;
    gradient: string;
    iconBg: string;
  }
> = {
  group: {
    icon: Folder,
    label: "Golongan",
    childLabel: "Kategori",
    color: "text-blue-600 dark:text-blue-400",
    bg: "hover:bg-blue-50/60 dark:hover:bg-blue-950/30",
    border: "border-blue-200/50 dark:border-blue-800/30 hover:border-blue-300/80 dark:hover:border-blue-700/50",
    badgeClass:
      "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/30",
    gradient: "from-blue-500/10 to-transparent",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
  },
  category: {
    icon: Layers,
    label: "Kategori",
    childLabel: "Cluster",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30",
    border: "border-emerald-200/50 dark:border-emerald-800/30 hover:border-emerald-300/80 dark:hover:border-emerald-700/50",
    badgeClass:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/30",
    gradient: "from-emerald-500/10 to-transparent",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  cluster: {
    icon: Package,
    label: "Cluster",
    childLabel: "Sub Cluster",
    color: "text-amber-600 dark:text-amber-400",
    bg: "hover:bg-amber-50/60 dark:hover:bg-amber-950/30",
    border: "border-amber-200/50 dark:border-amber-800/30 hover:border-amber-300/80 dark:hover:border-amber-700/50",
    badgeClass:
      "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/30",
    gradient: "from-amber-500/10 to-transparent",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
  },
  subcluster: {
    icon: Package,
    label: "Sub Cluster",
    childLabel: "",
    color: "text-purple-600 dark:text-purple-400",
    bg: "hover:bg-purple-50/60 dark:hover:bg-purple-950/30",
    border: "border-purple-200/50 dark:border-purple-800/30 hover:border-purple-300/80 dark:hover:border-purple-700/50",
    badgeClass:
      "bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200/50 dark:border-purple-800/30",
    gradient: "from-purple-500/10 to-transparent",
    iconBg: "bg-purple-100 dark:bg-purple-900/40",
  },
};

function getChildLevel(level: string) {
  switch (level) {
    case "group": return "category";
    case "category": return "cluster";
    case "cluster": return "subcluster";
    default: return "subcluster";
  }
}

interface ClassificationCardProps {
  node: any;
  level: string;
  childCount: number;
  hasChildren: boolean;
  editor: any;
  onDrillDown: (node: any, level: string) => void;
  isSelected: boolean;
}

export function ClassificationCard({
  node,
  level,
  childCount,
  hasChildren,
  editor,
  onDrillDown,
  isSelected,
}: ClassificationCardProps) {
  const config = levelConfig[level] || levelConfig.subcluster;
  const Icon = config.icon;

  const deleteGroup = useDeleteAssetGroup();
  const deleteCategory = useDeleteAssetCategory();
  const deleteCluster = useDeleteAssetCluster();
  const deleteSubCluster = useDeleteAssetSubCluster();

  function handleDelete() {
    const ok = window.confirm(`Hapus ${node.name}?`);
    if (!ok) return;
    switch (level) {
      case "group": deleteGroup.mutate(node.id); break;
      case "category": deleteCategory.mutate(node.id); break;
      case "cluster": deleteCluster.mutate(node.id); break;
      case "subcluster": deleteSubCluster.mutate(node.id); break;
    }
  }

  return (
    <div
      className={cn(
        "group/card relative rounded-lg border p-4 transition-all duration-200",
        config.border,
        config.bg,
        isSelected && "ring-2 ring-primary/30 border-primary/40",
        "hover:shadow-md hover:-translate-y-0.5",
        "cursor-pointer"
      )}
      onClick={() => {
        if (hasChildren) {
          onDrillDown(node, level);
        } else {
          editor.editNode({ id: node.id, level, data: node });
        }
      }}
    >
      {/* Gradient accent */}
      <div
        className={cn(
          "absolute inset-0 rounded-lg bg-gradient-to-br opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none",
          config.gradient
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg mt-0.5",
              config.iconBg,
              config.color,
              "transition-transform duration-200 group-hover/card:scale-110"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "font-mono text-[11px] px-1.5 py-0 h-5",
                  config.badgeClass
                )}
              >
                {node.code}
              </Badge>
              {hasChildren && (
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                  {childCount} {config.childLabel}
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium leading-tight truncate">
              {node.name}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {hasChildren && (
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md",
                "text-muted-foreground transition-all duration-200",
                "group-hover/card:bg-primary/10 group-hover/card:text-primary"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onDrillDown(node, level);
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md",
                  "text-muted-foreground transition-all duration-150",
                  "opacity-0 group-hover/card:opacity-100",
                  "hover:bg-muted hover:text-foreground"
                )}
              >
                <MoreHorizontal className="h-4 w-4" />
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
                  Tambah {config.childLabel}
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
        </div>
      </div>
    </div>
  );
}
