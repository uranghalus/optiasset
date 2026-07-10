/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import type { Table } from "@tanstack/react-table";
import { cn, getPageNumbers } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";

type DataTablePaginationProps<TData> = {
  table: Table<TData>;
  pageCount: number;
  className?: string;
};

export function DataTablePagination<TData>({
  table,
  pageCount,
  className,
}: DataTablePaginationProps<TData>) {
  const [gotoPage, setGotoPage] = useState("");

  const { pageIndex, pageSize } = table.getState().pagination;

  const currentPage = pageIndex + 1;
  const totalPages = pageCount;

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const canPrevious = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between px-2",
        className,
      )}
    >
      {/* LEFT SIDE: Info & Rows Per Page */}
      <div className="flex items-center justify-between sm:justify-start sm:gap-6">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium text-muted-foreground">Rows</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
              table.setPageIndex(0);
            }}
          >
            <SelectTrigger className="h-9 w-[70px] rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-xs font-medium text-muted-foreground sm:text-sm whitespace-nowrap">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <p className="text-xs font-medium text-muted-foreground">Go to</p>
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={gotoPage}
              onChange={(e) => setGotoPage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const page = Number(gotoPage);
                  if (page >= 1 && page <= totalPages) {
                    table.setPageIndex(page - 1);
                  }
                  setGotoPage("");
                }
              }}
              onBlur={() => setGotoPage("")}
              className="h-9 w-[60px] rounded-lg text-center text-xs"
            />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Navigation Controls */}
      <div className="flex items-center justify-center gap-1 sm:gap-2">
        {/* First Page (Desktop Only) */}
        <Button
          variant="outline"
          className="hidden size-9 p-0 lg:flex rounded-lg"
          onClick={() => table.setPageIndex(0)}
          disabled={!canPrevious}
        >
          <ChevronsLeftIcon className="h-4 w-4" />
        </Button>

        {/* Previous */}
        <Button
          variant="outline"
          className="size-9 p-0 rounded-lg"
          onClick={() => table.setPageIndex(pageIndex - 1)}
          disabled={!canPrevious}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>

        {/* Page Numbers: Sembunyikan di layar sangat kecil jika terlalu banyak */}
        <div className="flex items-center gap-1 mx-1">
          {pageNumbers.map((page, i) =>
            page === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="px-1 text-sm text-muted-foreground hidden sm:inline"
              >
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                // Logika responsive: hanya tampilkan halaman aktif dan tetangganya di mobile
                className={cn(
                  "h-9 min-w-9 px-2 text-xs sm:text-sm rounded-lg",
                  page !== currentPage && "hidden md:inline-flex",
                )}
                onClick={() => table.setPageIndex((page as number) - 1)}
              >
                {page}
              </Button>
            ),
          )}
        </div>

        {/* Next */}
        <Button
          variant="outline"
          className="size-9 p-0 rounded-lg"
          onClick={() => table.setPageIndex(pageIndex + 1)}
          disabled={!canNext}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>

        {/* Last Page (Desktop Only) */}
        <Button
          variant="outline"
          className="hidden size-9 p-0 lg:flex rounded-lg"
          onClick={() => table.setPageIndex(totalPages - 1)}
          disabled={!canNext}
        >
          <ChevronsRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
