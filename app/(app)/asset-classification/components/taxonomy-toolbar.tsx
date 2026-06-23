"use client";

import {
  Plus,
  RefreshCw,
  Search,
  Import,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useClassificationTree } from "@/hooks/crud/use-asset-classification";
import { useDialog } from "@/context/dialog-provider";

export function TaxonomyToolbar({
  onCreateGroup,
  search,
  setSearch,
}: any) {
  const { refetch, isFetching } = useClassificationTree();
  const { open, setOpen } = useDialog();

  return (
    <div className="border-b bg-gradient-to-r from-background via-background to-muted/30 sticky top-0 z-20">
      <div className="flex items-center justify-between gap-4 p-3">
        <div className="flex items-center gap-2">
          <Button onClick={onCreateGroup} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Tambah Golongan
          </Button>
          <Button
            onClick={() => setOpen("import-golongan")}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <Import className="h-4 w-4" />
            Impor
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5"
          >
            <RefreshCw
              className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"}
            />
            Refresh
          </Button>
        </div>

        <div className="w-[320px] relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-background/80"
            placeholder="Cari kode atau nama..."
          />
        </div>
      </div>
    </div>
  );
}
