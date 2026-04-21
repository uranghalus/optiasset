"use client";

import * as React from "react";

import { type Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "./datatable-faceted-filter";
import { SlidersHorizontal, X } from "lucide-react";
import { DataTableViewOptions } from "./datatable-view-options";

import { PopoverTrigger, PopoverContent, Popover } from "../ui/popover";
import { DataTableFacetedFilterContent } from "./datatable-faceted-content";

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  searchPlaceholder?: string;
  searchKey?: string;

  // ✅ TAMBAHAN
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
    <div className="flex items-center w-full">
      {/* LEFT (children optional) */}
      {children && <div>{children}</div>}

      {/* RIGHT (selalu ke kanan) */}
      <div className="ml-auto flex items-center gap-6 shrink-0">
        {/* FILTER + RESET */}
        <div className="flex items-center gap-2 flex-wrap">


          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => {
                table.resetColumnFilters();
                table.setGlobalFilter("");

                // ✅ reset server search
                onSearchChange?.("");
              }}
              className="h-8 px-2"
            >
              Reset
              <X className="ms-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* SEARCH + VIEW */}
        <div className="flex items-center gap-4">
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

              // ✅ SERVER SIDE SEARCH
              if (onSearchChange) {
                onSearchChange(value);
                return;
              }

              // ✅ CLIENT SIDE (fallback)
              if (searchKey) {
                table.getColumn(searchKey)?.setFilterValue(value);
              } else {
                table.setGlobalFilter(value);
              }
            }}
            className="h-8 w-[150px] lg:w-[250px]"
          />
          {filters.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[250px] p-2 space-y-2" align="end">
                {filters.map((filter) => {
                  const column = table.getColumn(filter.columnId);
                  if (!column) return null;

                  return (
                    <div key={filter.columnId} className="space-y-2">
                      <p className="text-xs font-medium">{filter.title}</p>

                      <DataTableFacetedFilterContent
                        column={column}
                        options={filter.options}
                      />
                    </div>
                  );
                })}

                {isFiltered && (
                  <>
                    <div className="border-t pt-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          table.resetColumnFilters();
                          table.setGlobalFilter("");
                          onSearchChange?.("");
                        }}
                      >
                        Reset Filters
                      </Button>
                    </div>
                  </>
                )}
              </PopoverContent>
            </Popover>
          )}
          <DataTableViewOptions table={table} />

        </div>
      </div>
    </div>
  );
}
