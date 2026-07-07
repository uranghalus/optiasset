"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartData {
  name: string;
  value: number;
}

interface CategoryChartProps {
  data: ChartData[];
}

const CHART_COLORS = [
  "oklch(0.6 0.22 265)",
  "oklch(0.7 0.18 155)",
  "oklch(0.75 0.18 70)",
  "oklch(0.65 0.22 310)",
  "oklch(0.7 0.2 25)",
  "oklch(0.72 0.15 180)",
];

export function CategoryChart({ data }: CategoryChartProps) {
  return (
    /* ── Double-Bezel: Outer Shell ── */
    <div
      className={cn(
        "group relative h-full p-1.5 rounded-[1.5rem] ring-1 ring-border/30 bg-muted/15",
        "transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
        "hover:ring-border/50 hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.25)]",
        /* Entry animation */
        "animate-in fade-in slide-in-from-bottom-8 blur-in-[4px] fill-mode-both",
      )}
      style={{ animationDelay: "350ms", animationDuration: "800ms", animationTimingFunction: "cubic-bezier(0.32,0.72,0,1)" }}
    >
      {/* ── Double-Bezel: Inner Core ── */}
      <div className="relative overflow-hidden rounded-[calc(1.5rem-0.375rem)] bg-card/80 dark:bg-card/60 p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
        {/* Gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/50 via-chart-2/50 to-chart-4/50 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary ring-1 ring-primary/10">
            <PieChartIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold tracking-tight">Distribusi Aset</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Rincian berdasarkan kategori item master
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {CHART_COLORS.map((color, index) => (
                  <linearGradient
                    key={`gradient-${index}`}
                    id={`chartGradient${index}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                  </linearGradient>
                ))}
              </defs>

              <Pie
                data={data}
                cx="50%"
                cy="48%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
                animationBegin={0}
                animationDuration={1200}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#chartGradient${index % CHART_COLORS.length})`}
                    className="transition-all duration-300 cursor-pointer hover:opacity-80 hover:scale-105"
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  borderColor: "var(--border)",
                  borderRadius: "16px",
                  fontSize: "12px",
                  padding: "10px 14px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                  backdropFilter: "blur(12px)",
                }}
                itemStyle={{
                  color: "var(--foreground)",
                  fontWeight: 500,
                }}
                labelStyle={{
                  fontWeight: 700,
                  marginBottom: "4px",
                  fontSize: "13px",
                }}
              />

              <Legend
                verticalAlign="bottom"
                height={40}
                formatter={(value: string) => (
                  <span className="text-xs font-medium text-muted-foreground ml-1">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
