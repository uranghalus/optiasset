"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    <Card className="border-l-4 border-l-red-500 bg-red-50/30 dark:bg-red-950/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-600">
          <AlertCircle className="size-4" /> Stok Hampir Habis!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.code}
              className="flex items-center justify-between text-sm p-2 rounded bg-white dark:bg-slate-900 border"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-slate-500 font-mono">{item.code}</p>
              </div>
              <Badge variant="destructive" className="font-bold">
                Sisa: {item.quantity}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
