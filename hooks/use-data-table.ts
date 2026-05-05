/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { useState } from 'react';

type UseDataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  pageCount: number;
  manualFilter?: boolean;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };

  columnFilters?: ColumnFiltersState; // ✅ typed
  onColumnFiltersChange?: (updater: any) => void; // ✅ WAJIB

  onPaginationChange: (updater: any) => void;
  manualPagination?: boolean;
  columnResizeMode?: any;
  columnResizeDirection?: any;
  enableRowSelection?: boolean;
  rowCount?: number;
};

export function useDataTable<TData>({
  data,
  columns,
  pageCount,
  pagination,
  columnFilters,
  onColumnFiltersChange,
  onPaginationChange,
  columnResizeMode = 'onChange',
  columnResizeDirection = 'ltr',
  enableRowSelection = true,
  manualFilter = true,
  manualPagination = false,
  rowCount,
}: UseDataTableProps<TData>) {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    pageCount,
    manualPagination,
    manualFiltering: manualFilter, // 🔥 penting untuk server-side filter
    rowCount: rowCount,
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters, // ✅ MASUKKAN INI
    },

    enableRowSelection,
    enableColumnResizing: true,
    columnResizeMode,
    columnResizeDirection,

    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange,
    onColumnFiltersChange, // ✅ WAJIB

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return { table };
}
