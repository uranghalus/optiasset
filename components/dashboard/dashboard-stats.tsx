"use client";

import { Package, Smartphone, Boxes, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
  stats: {
    totalAssets: number;
    totalItems: number;
    totalStock: number;
    totalCategories: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const cards = [
    {
      title: "Total Aset Tetap",
      value: stats.totalAssets,
      icon: Smartphone,
      description: "Aset fisik terdaftar",
      gradient: "from-blue-500 to-cyan-500",
      iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
      accentColor: "text-blue-600 dark:text-blue-400",
      ringColor: "ring-blue-200/40 dark:ring-blue-800/20",
      bgCore: "bg-blue-50/30 dark:bg-blue-950/10",
    },
    {
      title: "Tingkat Stok",
      value: stats.totalStock,
      icon: Boxes,
      description: "Total unit barang Supply",
      gradient: "from-emerald-500 to-teal-500",
      iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
      accentColor: "text-emerald-600 dark:text-emerald-400",
      ringColor: "ring-emerald-200/40 dark:ring-emerald-800/20",
      bgCore: "bg-emerald-50/30 dark:bg-emerald-950/10",
    },
    {
      title: "Item Katalog",
      value: stats.totalItems,
      icon: Package,
      description: "Item unik dalam master katalog",
      gradient: "from-violet-500 to-purple-500",
      iconBg: "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400",
      accentColor: "text-violet-600 dark:text-violet-400",
      ringColor: "ring-violet-200/40 dark:ring-violet-800/20",
      bgCore: "bg-violet-50/30 dark:bg-violet-950/10",
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => (
        /* ── Double-Bezel: Outer Shell ── */
        <div
          key={card.title}
          className={cn(
            "group relative p-1.5 rounded-[1.25rem] ring-1 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
            "bg-muted/20 hover:bg-muted/40",
            card.ringColor,
            "hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.3)]",
            /* Staggered entry animation */
            "animate-in fade-in slide-in-from-bottom-6 blur-in-[4px] fill-mode-both",
          )}
          style={{ animationDelay: `${index * 120}ms`, animationDuration: "700ms", animationTimingFunction: "cubic-bezier(0.32,0.72,0,1)" }}
        >
          {/* ── Double-Bezel: Inner Core ── */}
          <div
            className={cn(
              "relative overflow-hidden rounded-[calc(1.25rem-0.375rem)] p-5 transition-all duration-500",
              card.bgCore,
              "shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]",
            )}
          >
            {/* Gradient accent line */}
            <div className={cn("absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r opacity-60 group-hover:opacity-100 transition-opacity duration-500", card.gradient)} />

            {/* Soft corner glow */}
            <div className={cn("absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] bg-gradient-to-br", card.gradient)} />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  {card.title}
                </span>
                <div
                  className={cn(
                    "p-2.5 rounded-xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    "group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg",
                    card.iconBg,
                  )}
                >
                  <card.icon className="h-4.5 w-4.5" />
                </div>
              </div>

              {/* Value */}
              <div className={cn("text-4xl font-bold tracking-tight transition-all duration-500", card.accentColor)}>
                {card.value.toLocaleString()}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                <p className="text-[11px] text-muted-foreground">
                  {card.description}
                </p>
                <TrendingUp className={cn(
                  "h-3.5 w-3.5 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  "group-hover:opacity-50 group-hover:translate-x-0.5",
                  card.accentColor,
                )} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
