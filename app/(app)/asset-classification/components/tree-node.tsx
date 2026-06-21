"use client";

import {
  ChevronRight,
  Folder,
  FolderOpen,
  FolderTree,
  Layers,
  Package,
} from "lucide-react";
import { useState } from "react";
import { NodeActionMenu } from "./node-action-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function getNextLevel(level: string) {
  switch (level) {
    case "group":
      return "category";
    case "category":
      return "cluster";
    case "cluster":
      return "subcluster";
    default:
      return "subcluster";
  }
}

const levelConfig: Record<
  string,
  {
    icon: typeof Folder;
    openIcon: typeof FolderOpen;
    color: string;
    bgHover: string;
    border: string;
    badgeClass: string;
    dotColor: string;
  }
> = {
  group: {
    icon: Folder,
    openIcon: FolderOpen,
    color: "text-blue-600 dark:text-blue-400",
    bgHover:
      "hover:bg-blue-50/80 dark:hover:bg-blue-950/30",
    border: "border-blue-200/60 dark:border-blue-800/40",
    badgeClass:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    dotColor: "bg-blue-500",
  },
  category: {
    icon: Folder,
    openIcon: FolderOpen,
    color: "text-emerald-600 dark:text-emerald-400",
    bgHover:
      "hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30",
    border: "border-emerald-200/60 dark:border-emerald-800/40",
    badgeClass:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    dotColor: "bg-emerald-500",
  },
  cluster: {
    icon: Layers,
    openIcon: Layers,
    color: "text-amber-600 dark:text-amber-400",
    bgHover:
      "hover:bg-amber-50/80 dark:hover:bg-amber-950/30",
    border: "border-amber-200/60 dark:border-amber-800/40",
    badgeClass:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    dotColor: "bg-amber-500",
  },
  subcluster: {
    icon: Package,
    openIcon: Package,
    color: "text-purple-600 dark:text-purple-400",
    bgHover:
      "hover:bg-purple-50/80 dark:hover:bg-purple-950/30",
    border: "border-purple-200/60 dark:border-purple-800/40",
    badgeClass:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    dotColor: "bg-purple-500",
  },
};

export function TreeNode({ node, level, editor }: any) {
  const [open, setOpen] = useState(true);

  const children =
    node.categories || node.assetClusters || node.assetSubClusters || [];

  const config = levelConfig[level] || levelConfig.subcluster;
  const Icon = open ? config.openIcon : config.icon;

  return (
    <div className={cn(level !== "group" && "ml-5")}>
      <div
        className={cn(
          "group/node flex items-center justify-between rounded-lg border p-2.5",
          "transition-all duration-200",
          config.bgHover,
          config.border,
          "hover:shadow-sm hover:border-opacity-100",
          "cursor-pointer"
        )}
      >
        <div
          className="flex items-center gap-2 flex-1 min-w-0"
          onClick={() =>
            editor.editNode({
              id: node.id,
              level,
              data: node,
            })
          }
        >
          {children.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(!open);
              }}
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md",
                "transition-all duration-200",
                "hover:bg-black/5 dark:hover:bg-white/10"
              )}
            >
              <ChevronRight
                size={14}
                className={cn(
                  "transition-transform duration-200",
                  open && "rotate-90"
                )}
              />
            </button>
          )}

          {children.length === 0 && <div className="w-5 shrink-0" />}

          <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md", "bg-opacity-10", config.color)}>
            <Icon size={14} />
          </div>

          <Badge
            variant="outline"
            className={cn(
              "shrink-0 font-mono text-[11px] px-1.5 py-0 h-5 border-0",
              config.badgeClass
            )}
          >
            {node.code}
          </Badge>

          <span className="truncate text-sm font-medium">
            {node.name}
          </span>
        </div>

        <div
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover/node:opacity-100 transition-opacity duration-150"
        >
          <NodeActionMenu node={node} level={level} editor={editor} />
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          open && children.length > 0
            ? "max-h-[2000px] opacity-100 mt-1.5 space-y-1.5"
            : "max-h-0 opacity-0"
        )}
      >
        {children.map((child: any) => (
          <TreeNode
            key={child.id}
            node={child}
            level={getNextLevel(level)}
            editor={editor}
          />
        ))}
      </div>
    </div>
  );
}
