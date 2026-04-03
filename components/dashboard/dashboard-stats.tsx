"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Smartphone, Boxes, Info, CheckCircle2 } from "lucide-react";

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
      title: "Total Fixed Assets",
      value: stats.totalAssets,
      icon: Smartphone,
      description: "Registered physical assets",
      className:
        "border-l-4 border-l-blue-500 bg-linear-to-br from-blue-50/50 to-transparent dark:from-blue-950/20",
      iconColor: "text-blue-500",
    },
    {
      title: "Stock Level",
      value: stats.totalStock,
      icon: Boxes,
      description: "Total items in stock (Supplies)",
      className:
        "border-l-4 border-l-emerald-500 bg-linear-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20",
      iconColor: "text-emerald-500",
    },
    {
      title: "Catalog Items",
      value: stats.totalItems,
      icon: Package,
      description: "Unique items in master catalog",
      className:
        "border-l-4 border-l-purple-500 bg-linear-to-br from-purple-50/50 to-transparent dark:from-purple-950/20",
      iconColor: "text-purple-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card
          key={card.title}
          className={`transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${card.className}`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div
              className={`p-2 rounded-lg bg-background/50 backdrop-blur-sm border shadow-sm`}
            >
              <card.icon className={`h-4 w-4 ${card.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
