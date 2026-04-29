"use client"
import { useClassificationTree } from "@/hooks/crud/use-asset-classification";
import { TreeNode } from "./tree-node";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { FolderTree } from "lucide-react";
import { useMemo } from "react";


interface ClassificationTreeProps {
  editor: any | null;
  search: string;
}

export function ClassificationTree({
  editor,
  search,
}: ClassificationTreeProps) {
  const { data, isLoading, isError } = useClassificationTree();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        Error...
      </div>
    );
  }

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
          assetSubClusters: node.assetSubClusters ? filteredChildren : undefined,
        };
      }
      return null;
    };

    return data?.map(filterNode).filter(Boolean);
  }, [data, search]);

  if (!filteredData?.length) {
    return (
      <Empty className="h-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderTree />
          </EmptyMedia>
          <EmptyTitle>{search ? "No matches found" : "No data"}</EmptyTitle>
          <EmptyDescription>
            {search
              ? `No classification matches "${search}"`
              : "No classification data found"}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent></EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="p-4 space-y-2">
      {filteredData.map((group: any) => (
        <TreeNode
          key={group.id}
          node={group}
          level="group"
          editor={editor}
        />
      ))}
    </div>
  );
}