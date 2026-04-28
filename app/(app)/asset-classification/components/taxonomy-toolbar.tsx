"use client";

import { Plus, RefreshCw, GitBranch, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useClassificationTree } from "@/hooks/crud/use-asset-classification";

export function TaxonomyToolbar({
  onCreateGroup,
  onExpandAll,
  onCollapseAll,
  search,
  setSearch,
}: any) {
  const { refetch, isFetching } = useClassificationTree();

  return (
    <div className="border-b bg-background sticky top-0 z-20">
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-2">
          <Button onClick={onCreateGroup}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Golongan
          </Button>

          <Button variant="outline" onClick={onExpandAll}>
            <GitBranch className="mr-2 h-4 w-4" />
            Expand All
          </Button>

          <Button variant="outline" onClick={onCollapseAll}>
            Collapse
          </Button>

          <Separator orientation="vertical" className="h-8" />

          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw
              className={
                isFetching ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"
              }
            />
            Refresh
          </Button>
        </div>

        <div className="w-[360px] relative">
          <Search className="absolute left-3 top-3 h-4 w-4" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            placeholder="Cari kode atau nama klasifikasi..."
          />
        </div>
      </div>
    </div>
  );
}
