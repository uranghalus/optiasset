"use client";

import { useMemo } from "react";
import { FolderTree, SearchX, Loader2 } from "lucide-react";

import { useClassificationTree } from "@/hooks/crud/use-asset-classification";
import { TreeNode } from "./tree-node";

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ClassificationTreeProps {
  editor: any | null;
  search: string;
}

export function ClassificationTree({
  editor,
  search,
}: ClassificationTreeProps) {
  const { data = [], isLoading, isError } = useClassificationTree();

  const filteredData = useMemo(() => {
    if (!search) return data;

    const s = search.toLowerCase();

    const filterNode = (node: any): any | null => {
      const name = node.name?.toLowerCase() || "";
      const code = node.code?.toLowerCase() || "";
      const matches = name.includes(s) || code.includes(s);

      const children =
        node.categories || node.assetClusters || node.assetSubClusters || [];

      const filteredChildren = children
        .map((c: any) => filterNode(c))
        .filter(Boolean);

      if (matches || filteredChildren.length > 0) {
        return {
          ...node,
          categories: node.categories ? filteredChildren : undefined,
          assetClusters: node.assetClusters ? filteredChildren : undefined,
          assetSubClusters: node.assetSubClusters
            ? filteredChildren
            : undefined,
        };
      }

      return null;
    };

    return data.map(filterNode).filter(Boolean);
  }, [data, search]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm">Memuat data klasifikasi...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-destructive">
        <SearchX className="h-6 w-6" />
        <span className="text-sm">Gagal memuat data</span>
      </div>
    );
  }

  if (!filteredData.length) {
    return (
      <Empty className="h-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            {search ? <SearchX /> : <FolderTree />}
          </EmptyMedia>
          <EmptyTitle>
            {search ? "Tidak ada hasil" : "Belum ada data"}
          </EmptyTitle>
          <EmptyDescription>
            {search
              ? `Tidak ditemukan klasifikasi untuk "${search}"`
              : "Mulai dengan menambahkan golongan baru"}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent />
      </Empty>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-1.5">
        {filteredData.map((group: any) => (
          <TreeNode
            key={group.id}
            node={group}
            level="group"
            editor={editor}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
