/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { getDashboardData } from "@/action/dashboard-action";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { LowStockAlerts } from "@/components/dashboard/low-stock-alerts";
import { LayoutDashboard, Sparkles } from "lucide-react";

export default async function DashboardPage() {
  const data = await getDashboardData().catch(() => null);

  if (!data) {
    return (
      <div className="flex flex-col gap-4 p-8">
        <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-r from-primary/5 via-primary/10 to-chart-4/5 p-6">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          </div>
        </div>
        <div className="p-8 rounded-xl border border-dashed text-center text-muted-foreground bg-muted/30">
          <p className="font-medium">Tidak dapat memuat data dashboard</p>
          <p className="text-sm mt-1">Pastikan Anda sudah login dan memiliki organisasi aktif.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary/90 to-chart-4/80 p-6 shadow-xl shadow-primary/20">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/4 animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full bg-white/5 blur-2xl translate-y-1/2" />
        <div className="absolute top-1/2 right-1/4 opacity-20">
          <Sparkles className="h-12 w-12 text-white animate-pulse" />
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
            <LayoutDashboard className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Dashboard Overview
            </h1>
            <p className="mt-1 text-sm text-white/80">
              Pantau aset, inventaris, dan aktivitas Anda dalam satu tampilan.
            </p>
          </div>
        </div>
      </div>

      <DashboardStats stats={data.stats as any} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CategoryChart data={data.chartData} />
        </div>
        <div className="space-y-6">
          <LowStockAlerts items={data.lowStockItems} />
          <RecentActivity recentActivity={data.recentActivity as any} />
        </div>
      </div>
    </div>
  );
}
