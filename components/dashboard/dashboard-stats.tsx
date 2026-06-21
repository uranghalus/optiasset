"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Smartphone, Boxes, Info, TrendingUp } from "lucide-react";
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
      iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
      cardBg: "bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent",
      borderColor: "border-blue-200/50 dark:border-blue-800/30",
      accentColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Tingkat Stok",
      value: stats.totalStock,
      icon: Boxes,
      description: "Total unit barang Supply",
      gradient: "from-emerald-500 to-teal-500",
      iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
      cardBg: "bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20 dark:to-transparent",
      borderColor: "border-emerald-200/50 dark:border-emerald-800/30",
      accentColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Item Katalog",
      value: stats.totalItems,
      icon: Package,
      description: "Item unik dalam master katalog",
      gradient: "from-purple-500 to-pink-500",
      iconBg: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
      cardBg: "bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20 dark:to-transparent",
      borderColor: "border-purple-200/50 dark:border-purple-800/30",
      accentColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          className={cn(
            "group relative overflow-hidden transition-all duration-300",
            "hover:shadow-xl hover:-translate-y-1",
            card.cardBg,
            card.borderColor
          )}
        >
          {/* Gradient top border */}
          <div className={cn(
            "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
            card.gradient
          )} />

          {/* Decorative corner glow */}
          <div className={cn(
            "absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl opacity-20 bg-gradient-to-br",
            card.gradient,
            "transition-opacity duration-300 group-hover:opacity-40"
          )} />

          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              {card.title}
            </CardTitle>
            <div
              className={cn(
                "p-2.5 rounded-lg transition-all duration-300",
                "group-hover:scale-110 group-hover:rotate-3",
                card.iconBg
              )}
            >
              <card.icon className="h-5 w-5" />
            </div>
          </CardHeader>

          <CardContent className="relative">
            <div className="flex items-end justify-between">
              <div>
                <div className={cn("text-4xl font-bold tracking-tight", card.accentColor)}>
                  {card.value.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                  <Info className="h-3 w-3" />
                  {card.description}
                </p>
              </div>
              <TrendingUp className={cn(
                "h-4 w-4 opacity-0 transition-all duration-300",
                "group-hover:opacity-60 group-hover:translate-x-1",
                card.accentColor
              )} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
