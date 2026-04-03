import React from "react";
import { getDashboardData } from "@/action/dashboard-action";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { LowStockAlerts } from "@/components/dashboard/low-stock-alerts";

export default async function DashboardPage() {
  const data = await getDashboardData().catch(() => null);

  if (!data) {
    return (
      <div className="flex flex-col gap-4 p-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground">
          Unable to load dashboard data. Please make sure you are logged in and
          have an active organization.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-blue-700">
          Dashboard Overview
        </h1>
      </div>

      <DashboardStats stats={data.stats as any} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CategoryChart data={data.chartData} />
        </div>
        <div className="space-y-6">
          <LowStockAlerts items={data.lowStockItems} />
          <RecentActivity assets={data.recentAssets} />
        </div>
      </div>
    </div>
  );
}
