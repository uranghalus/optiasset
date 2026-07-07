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
      <div className="flex flex-col gap-6 py-8 md:py-12">
        {/* Error Banner - Double-Bezel */}
        <div className="p-1.5 rounded-[1.5rem] bg-muted/30 ring-1 ring-border/40">
          <div className="relative overflow-hidden rounded-[calc(1.5rem-0.375rem)] bg-gradient-to-r from-primary/5 via-primary/10 to-chart-4/5 p-8">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/8 blur-3xl" />
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Ringkasan sistem aset Anda
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        <div className="p-1.5 rounded-[1.5rem] bg-muted/20 ring-1 ring-border/30">
          <div className="rounded-[calc(1.5rem-0.375rem)] border border-dashed border-border/50 p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mx-auto mb-4">
              <LayoutDashboard className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">Tidak dapat memuat data dashboard</p>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
              Pastikan Anda sudah login dan memiliki organisasi aktif.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-6 md:py-10">
      {/* ═══════════════════════════════════════════════════════════════
          WELCOME BANNER - Mesh Gradient + Double-Bezel
          ═══════════════════════════════════════════════════════════════ */}
      <div className="group/banner relative p-1.5 rounded-[1.75rem] bg-gradient-to-br from-primary/10 via-transparent to-chart-4/10 ring-1 ring-primary/10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:ring-primary/20">
        <div className="relative overflow-hidden rounded-[calc(1.75rem-0.375rem)] bg-gradient-to-br from-primary via-primary/95 to-chart-4/90 p-8 md:p-10">
          {/* Mesh gradient orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/8 blur-3xl -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-1/4 w-56 h-56 rounded-full bg-white/5 blur-2xl translate-y-1/3" />
          <div className="absolute top-1/2 left-0 w-40 h-40 rounded-full bg-chart-4/20 blur-3xl -translate-x-1/2" />

          {/* Floating sparkles */}
          <div className="absolute top-6 right-1/4 opacity-20">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <div className="absolute bottom-8 right-1/3 opacity-10">
            <Sparkles className="h-6 w-6 text-white" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] bg-white/15 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] ring-1 ring-white/10 transition-all duration-500 group-hover/banner:scale-105 group-hover/banner:rotate-2">
              <LayoutDashboard className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 mb-3 ring-1 ring-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-white/80">
                  Sistem Aktif
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                Dashboard Overview
              </h1>
              <p className="mt-2 text-sm md:text-base text-white/70 max-w-lg">
                Pantau aset, inventaris, dan aktivitas Anda dalam satu tampilan terpadu.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          STAT CARDS
          ═══════════════════════════════════════════════════════════════ */}
      <DashboardStats stats={data.stats as any} />

      {/* ═══════════════════════════════════════════════════════════════
          BENTO GRID - Asymmetrical Layout
          ═══════════════════════════════════════════════════════════════ */}
      <div className="grid gap-6 lg:grid-cols-3 lg:grid-rows-[auto_auto]">
        {/* Chart - spans 2 cols */}
        <div className="lg:col-span-2 lg:row-span-2">
          <CategoryChart data={data.chartData} />
        </div>

        {/* Low Stock + Activity - stacked in 1 col */}
        <div className="space-y-6">
          <LowStockAlerts items={data.lowStockItems} />
          <RecentActivity recentActivity={data.recentActivity as any} />
        </div>
      </div>
    </div>
  );
}
