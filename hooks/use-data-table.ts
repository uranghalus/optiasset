/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
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
  columnResizeMode?: any;
  columnResizeDirection?: any;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  onPaginationChange: (updater: any) => void;
};

export function useDataTable<TData>({
  data,
  columns,
  pageCount,
  pagination,
  columnResizeMode = 'onChange',
  columnResizeDirection = 'ltr',

  onPaginationChange,
}: UseDataTableProps<TData>) {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    pageCount,
    manualPagination: true,
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
    },

    enableRowSelection: true,
    enableColumnResizing: true,
    columnResizeMode,
    columnResizeDirection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return { table };
}
