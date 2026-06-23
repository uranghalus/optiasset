"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="relative overflow-hidden border-red-200/50 dark:border-red-800/30 bg-gradient-to-br from-red-50/50 to-orange-50/30 dark:from-red-950/20 dark:to-orange-950/10">
      {/* Decorative gradient top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500" />

      {/* Decorative corner glow */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-500/10 blur-2xl" />

      <CardHeader className="relative flex flex-row items-center gap-3 pb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base font-bold text-red-700 dark:text-red-400">
            Stok Hampir Habis!
          </CardTitle>
          <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5">
            {items.length} item memerlukan perhatian
          </p>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.code}
              className={cn(
                "flex items-center justify-between gap-3 p-3 rounded-lg",
                "bg-white dark:bg-slate-900/60",
                "border border-red-200/50 dark:border-red-800/30",
                "transition-all duration-200 hover:shadow-sm hover:border-red-300/70 dark:hover:border-red-700/50"
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                  <Package className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{item.code}</p>
                </div>
              </div>
              <Badge
                variant="destructive"
                className="shrink-0 font-bold text-[11px] px-2.5"
              >
                {item.quantity}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
