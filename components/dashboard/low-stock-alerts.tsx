"use client";

import { AlertTriangle, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LowStockAlertsProps {
  items: {
    name: string;
    code: string;
    quantity: number;
  }[];
}

export function LowStockAlerts({ items }: LowStockAlertsProps) {
  if (items.length === 0) return null;

  return (
    /* ── Double-Bezel: Outer Shell ── */
    <div
      className={cn(
        "group relative p-1.5 rounded-[1.5rem] ring-1 ring-red-200/30 dark:ring-red-800/15",
        "bg-gradient-to-br from-red-50/40 to-orange-50/20 dark:from-red-950/15 dark:to-orange-950/8",
        "transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
        "hover:ring-red-200/50 dark:hover:ring-red-800/25",
        "hover:shadow-[0_8px_40px_-12px_rgba(239,68,68,0.1)] dark:hover:shadow-[0_8px_40px_-12px_rgba(239,68,68,0.15)]",
        /* Entry animation */
        "animate-in fade-in slide-in-from-bottom-6 blur-in-[4px] fill-mode-both",
      )}
      style={{ animationDelay: "480ms", animationDuration: "700ms", animationTimingFunction: "cubic-bezier(0.32,0.72,0,1)" }}
    >
      {/* ── Double-Bezel: Inner Core ── */}
      <div className="relative overflow-hidden rounded-[calc(1.5rem-0.375rem)] bg-white/60 dark:bg-black/20 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] backdrop-blur-sm">
        {/* Gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 to-orange-500 opacity-70" />

        {/* Soft corner glow */}
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-red-500/8 blur-3xl" />

        {/* Header */}
        <div className="relative flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-950/50 dark:text-red-400 ring-1 ring-red-100 dark:ring-red-900/30">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold tracking-tight text-red-700 dark:text-red-400">
              Stok Hampir Habis!
            </h3>
            <p className="text-[11px] text-red-500/70 dark:text-red-400/60 mt-0.5">
              {items.length} item memerlukan perhatian
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="relative space-y-2">
          {items.map((item, index) => (
            <div
              key={item.code}
              className={cn(
                "flex items-center justify-between gap-3 p-3 rounded-xl",
                "bg-white/70 dark:bg-black/20 backdrop-blur-sm",
                "ring-1 ring-red-100/50 dark:ring-red-900/20",
                "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                "hover:bg-white dark:hover:bg-black/30 hover:ring-red-200/60 dark:hover:ring-red-800/30",
                "hover:shadow-[0_2px_12px_-4px_rgba(239,68,68,0.12)]",
                /* Staggered entry */
                "animate-in fade-in slide-in-from-left-4 fill-mode-both",
              )}
              style={{ animationDelay: `${550 + index * 80}ms`, animationDuration: "500ms", animationTimingFunction: "cubic-bezier(0.32,0.72,0,1)" }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400">
                  <Package className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{item.code}</p>
                </div>
              </div>
              <Badge
                variant="destructive"
                className="shrink-0 font-bold text-[11px] px-2.5 rounded-lg"
              >
                {item.quantity}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
