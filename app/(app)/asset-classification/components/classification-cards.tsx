"use client";

import { useMemo, useState } from "react";
import {
  Folder,
  Layers,
  Package,
  SearchX,
  Loader2,
} from "lucide-react";

import { useClassificationTree } from "@/hooks/crud/use-asset-classification";
import { ClassificationCard } from "./classification-card";
import {
  ClassificationBreadcrumb,
  type BreadcrumbItem,
} from "./classification-breadcrumb";

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ClassificationCardsProps {
  editor: any;
  search: string;
}

const levelLabels: Record<string, string> = {
  group: "Golongan",
  category: "Kategori",
  cluster: "Cluster",
  subcluster: "Sub Cluster",
};

const levelIcons: Record<string, typeof Folder> = {
  group: Folder,
  category: Layers,
  cluster: Package,
  subcluster: Package,
};

const levelColors: Record<string, string> = {
  group: "text-blue-600 dark:text-blue-400",
  category: "text-emerald-600 dark:text-emerald-400",
  cluster: "text-amber-600 dark:text-amber-400",
  subcluster: "text-purple-600 dark:text-purple-400",
};

function getChildren(node: any, level: string): any[] {
  switch (level) {
    case "group":
      return node.categories || [];
    case "category":
      return node.assetClusters || [];
    case "cluster":
      return node.assetSubClusters || [];
    default:
      return [];
  }
}

function getNextLevel(level: string): string {
  switch (level) {
    case "group": return "category";
    case "category": return "cluster";
    case "cluster": return "subcluster";
    default: return "subcluster";
  }
}

export function ClassificationCards({
  editor,
  search,
}: ClassificationCardsProps) {
  const { data = [], isLoading, isError } = useClassificationTree();
  const [path, setPath] = useState<BreadcrumbItem[]>([]);

  // Derive the current level and items from the path
  const currentLevel = path.length === 0 ? "group" : getNextLevel(path[path.length - 1].level);

  const currentItems = useMemo(() => {
    if (path.length === 0) return data;

    // Navigate down the tree following the path
    let items: any[] = data;
    for (const step of path) {
      const found = items.find((n: any) => n.id === step.id);
      if (!found) return [];
      items = getChildren(found, step.level);
    }
    return items;
  }, [data, path]);

  // Apply search filter
  const filteredItems = useMemo(() => {
    if (!search) return currentItems;
    const s = search.toLowerCase();
    return currentItems.filter(
      (item: any) =>
        item.name?.toLowerCase().includes(s) ||
        item.code?.toLowerCase().includes(s)
    );
  }, [currentItems, search]);

  function handleDrillDown(node: any, level: string) {
    setPath((prev) => [
      ...prev,
      { id: node.id, name: node.name, code: node.code, level },
    ]);
  }

  function handleBreadcrumbNavigate(index: number) {
    if (index === -1) {
      // Navigate to root
      setPath([]);
    } else {
      // Navigate to a specific level in the path
      setPath((prev) => prev.slice(0, index + 1));
    }
  }

  const CurrentIcon = levelIcons[currentLevel] || Package;
  const currentLabel = levelLabels[currentLevel] || "Data";
  const currentColor = levelColors[currentLevel] || "";

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-sm">Memuat data klasifikasi...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-destructive">
          <SearchX className="h-6 w-6" />
          <span className="text-sm">Gagal memuat data</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Breadcrumb */}
      <ClassificationBreadcrumb
        path={path}
        onNavigate={handleBreadcrumbNavigate}
      />

      {/* Level header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-background/50">
        <CurrentIcon className={cn("h-4 w-4", currentColor)} />
        <span className="text-sm font-medium">{currentLabel}</span>
        <span className="text-xs text-muted-foreground">
          ({filteredItems.length} item)
        </span>
      </div>

      {/* Cards grid */}
      <ScrollArea className="flex-1">
        {filteredItems.length === 0 ? (
          <Empty className="h-full min-h-[300px]">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                {search ? <SearchX /> : <CurrentIcon />}
              </EmptyMedia>
              <EmptyTitle>
                {search ? "Tidak ada hasil" : `Belum ada ${currentLabel}`}
              </EmptyTitle>
              <EmptyDescription>
                {search
                  ? `Tidak ditemukan ${currentLabel.toLowerCase()} untuk "${search}"`
                  : `Mulai dengan menambahkan ${currentLabel.toLowerCase()} baru`}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent />
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-3 p-4">
            {filteredItems.map((item: any) => {
              const children = getChildren(item, currentLevel);
              const hasChildren = children.length > 0 && currentLevel !== "subcluster";
              const isEditorSelected =
                editor.selected?.id === item.id;

              return (
                <ClassificationCard
                  key={item.id}
                  node={item}
                  level={currentLevel}
                  childCount={children.length}
                  hasChildren={hasChildren}
                  editor={editor}
                  onDrillDown={handleDrillDown}
                  isSelected={isEditorSelected}
                />
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
