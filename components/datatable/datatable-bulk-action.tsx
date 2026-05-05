"use client";

import { useState, useEffect, useRef } from "react";
import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>;
  entityName: string;
  children: React.ReactNode;
};

/**
 * Floating bulk actions toolbar for TanStack Table.
 *
 * Appears when rows are selected and provides
 * keyboard-accessible bulk action controls.
 */
export function DataTableBulkActions<TData>({
  table,
  entityName,
  children,
}: DataTableBulkActionsProps<TData>): React.ReactNode | null {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  const toolbarRef = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState("");

  /**
   * Screen reader announcement when selection changes
   */
  useEffect(() => {
    if (selectedCount > 0) {
      const message = `${selectedCount} ${entityName}${
        selectedCount > 1 ? "s" : ""
      } selected. Bulk actions available.`;

      queueMicrotask(() => setAnnouncement(message));

      const timer = setTimeout(() => setAnnouncement(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [selectedCount, entityName]);

  const clearSelection = () => {
    table.resetRowSelection();
  };

  /**
   * Keyboard navigation inside toolbar
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    const buttons = toolbarRef.current?.querySelectorAll("button");
    if (!buttons || buttons.length === 0) return;

    const currentIndex = Array.from(buttons).findIndex(
      (btn) => btn === document.activeElement,
    );

    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        buttons[(currentIndex + 1) % buttons.length]?.focus();
        break;

      case "ArrowLeft":
        event.preventDefault();
        buttons[
          currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1
        ]?.focus();
        break;

      case "Home":
        event.preventDefault();
        buttons[0]?.focus();
        break;

      case "End":
        event.preventDefault();
        buttons[buttons.length - 1]?.focus();
        break;

      case "Escape": {
        const target = event.target as HTMLElement;
        const active = document.activeElement as HTMLElement;

        const isDropdown =
          target?.closest('[data-slot="dropdown-menu-trigger"]') ||
          active?.closest('[data-slot="dropdown-menu-trigger"]') ||
          target?.closest('[data-slot="dropdown-menu-content"]') ||
          active?.closest('[data-slot="dropdown-menu-content"]');

        if (isDropdown) return;

        event.preventDefault();
        clearSelection();
        break;
      }
    }
  };

  if (selectedCount === 0) return null;

  return (
    <>
      {/* Screen reader live region */}
      <div
        aria-live="polite"
        aria-atomic="true"
        role="status"
        className="sr-only"
      >
        {announcement}
      </div>

      <div
        ref={toolbarRef}
        role="toolbar"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        aria-label={`Bulk actions for ${selectedCount} selected ${entityName}`}
        className={cn(
          "fixed bottom-8 left-1/2 z-50 -translate-x-1/2",
          // Menambahkan animasi masuk (slide dari bawah + fade in)
          "animate-in slide-in-from-bottom-10 fade-in duration-300 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-x-3",
            // Mengubah menjadi bentuk kapsul (rounded-full), padding diperluas, dan shadow lebih elegan
            "rounded-full border border-border/50 px-4 py-2.5 shadow-2xl shadow-black/10",
            // Blur effect yang lebih kuat
            "bg-background/80 backdrop-blur-lg supports-backdrop-filter:bg-background/60",
          )}
        >
          {/* Clear selection */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost" // Menggunakan ghost agar lebih menyatu
                size="icon"
                className="size-7 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={clearSelection}
                aria-label="Clear selection"
              >
                <X className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={10}>
              <p>Clear selection (Esc)</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-5 bg-border/60" />

          {/* Selected count */}
          <div className="flex items-center gap-x-2 text-sm">
            <Badge
              variant="secondary"
              className="px-2 py-0.5 text-xs rounded-full font-medium bg-primary/10 text-primary hover:bg-primary/10 border-primary/20 border"
            >
              {selectedCount}
            </Badge>
            <div className="hidden sm:flex sm:items-center sm:gap-1 text-muted-foreground">
              <span className="font-medium text-foreground">
                {entityName}
                {selectedCount > 1 ? "s" : ""}
              </span>
              <span>selected</span>
            </div>
          </div>

          <Separator orientation="vertical" className="h-5 bg-border/60" />

          {/* Action buttons - Container untuk children kita berikan sedikit styling agar selaras */}
          <div className="flex items-center gap-x-1">{children}</div>
        </div>
      </div>
    </>
  );
}
