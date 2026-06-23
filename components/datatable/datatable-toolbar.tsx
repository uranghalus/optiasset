"use client";

import * as React from "react";
import { type Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal, X } from "lucide-react";
import { DataTableViewOptions } from "./datatable-view-options";
import { PopoverTrigger, PopoverContent, Popover } from "../ui/popover";
import { DataTableFacetedFilterContent } from "./datatable-faceted-content";

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  searchPlaceholder?: string;
  searchKey?: string;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
  filters?: {
    columnId: string;
    title: string;
    options: {
      label: string;
      value: string;
      icon?: React.ComponentType<{ className?: string }>;
    }[];
  }[];
  children?: React.ReactNode;
};

export function DataTableToolbar<TData>({
  children,
  table,
  searchPlaceholder = "Filter...",
  searchKey,
  filters = [],
  onSearchChange,
  searchValue,
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    (table.getState().columnFilters?.length ?? 0) > 0 ||
    Boolean(table.getState().globalFilter);

  return (
    // 1. Container Utama: flex-col di mobile, flex-row di desktop
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
      {/* LEFT SIDE (Actions/Buttons) */}
      {children && <div className="w-full sm:w-auto">{children}</div>}

      {/* RIGHT SIDE (Search, Filters, View Options) */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        {/* Search Input - w-full di mobile agar mudah diketik */}
        <div className="relative w-full sm:w-auto">
          <Input
            placeholder={searchPlaceholder}
            value={
              onSearchChange
                ? (searchValue ?? "")
                : searchKey
                  ? ((table.getColumn(searchKey)?.getFilterValue() as string) ??
                    "")
                  : ((table.getState().globalFilter as string) ?? "")
            }
            onChange={(event) => {
              const value = event.target.value;
              if (onSearchChange) {
                onSearchChange(value);
                return;
              }
              if (searchKey) {
                table.getColumn(searchKey)?.setFilterValue(value);
              } else {
                table.setGlobalFilter(value);
              }
            }}
            className="h-9 w-full sm:w-[200px] lg:w-[300px] rounded-lg"
          />
          {/* Tombol Reset kecil di dalam search jika ada filter (opsional/estetika) */}
        </div>

        {/* Filters & View Options Group */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {filters.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 flex-1 sm:flex-none rounded-lg border-primary/20 hover:border-primary/40"
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filter
                  {isFiltered && (
                    <span className="ml-2 rounded-full bg-gradient-to-r from-primary to-primary/70 w-2 h-2" />
                  )}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[280px] p-3 space-y-3" align="end">
                {filters.map((filter) => {
                  const column = table.getColumn(filter.columnId);
                  if (!column) return null;

                  return (
                    <div key={filter.columnId} className="space-y-2">
                      <p className="text-sm font-semibold">{filter.title}</p>
                      <DataTableFacetedFilterContent
                        column={column}
                        options={filter.options}
                      />
                    </div>
                  );
                })}

                {isFiltered && (
                  <div className="border-t pt-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-destructive hover:text-destructive"
                      onClick={() => {
                        table.resetColumnFilters();
                        table.setGlobalFilter("");
                        onSearchChange?.("");
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reset Semua Filter
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          )}

          <DataTableViewOptions table={table} />

          {/* Reset button versi Mobile (Hanya muncul jika di filter & di layar desktop) */}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => {
                table.resetColumnFilters();
                table.setGlobalFilter("");
                onSearchChange?.("");
              }}
              className="h-8 px-2 hidden lg:flex"
            >
              Reset
              <X className="ms-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
