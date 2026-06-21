"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PieChart as PieChartIcon } from "lucide-react";

interface ChartData {
  name: string;
  value: number;
}

interface CategoryChartProps {
  data: ChartData[];
}

// Vibrant chart colors with gradients
const CHART_COLORS = [
  "oklch(0.6 0.22 265)",  // Primary blue
  "oklch(0.7 0.18 155)",  // Emerald
  "oklch(0.75 0.18 70)",  // Amber
  "oklch(0.65 0.22 310)", // Purple
  "oklch(0.7 0.2 25)",    // Rose
  "oklch(0.72 0.15 180)", // Teal
];

export function CategoryChart({ data }: CategoryChartProps) {
  return (
    <Card className="relative overflow-hidden h-full">
      {/* Decorative gradient top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-chart-2 to-chart-4" />

      <CardHeader className="flex flex-row items-center gap-3 pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <PieChartIcon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg font-semibold">Distribusi Aset</CardTitle>
          <CardDescription className="text-xs">Rincian berdasarkan kategori item master</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-[320px] w-full">
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
                    <stop offset="100%" stopColor={color} stopOpacity={0.75} />
                  </linearGradient>
                ))}
              </defs>

              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
                animationBegin={0}
                animationDuration={1000}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#chartGradient${index % CHART_COLORS.length})`}
                    className="hover:opacity-80 transition-all duration-200 cursor-pointer"
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  borderColor: "var(--border)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  padding: "8px 12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}
                itemStyle={{
                  color: "var(--foreground)",
                }}
                labelStyle={{
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
              />

              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string) => (
                  <span className="text-xs font-medium text-foreground">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
