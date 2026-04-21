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

  pagination: {
    pageIndex: number;
    pageSize: number;
  };

  columnFilters?: ColumnFiltersState; // ✅ typed
  onColumnFiltersChange: (updater: any) => void; // ✅ WAJIB

  onPaginationChange: (updater: any) => void;

  columnResizeMode?: any;
  columnResizeDirection?: any;
  enableRowSelection?: boolean;
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
}: UseDataTableProps<TData>) {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    pageCount,
    manualPagination: true,
    manualFiltering: false, // 🔥 penting untuk server-side filter

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
