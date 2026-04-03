"use server";

import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId)
    throw new Error("No active organizationId found in session");

  // Fetch counts and stats
  const [
    totalAssets,
    totalItems,
    stockItems,
    categories,
    recentAssets,
    lowStockItems,
  ] = await Promise.all([
    // 1. Total Assets (Fixed Assets)
    prisma.asset.count(),

    // 2. Total Items (Catalog)
    prisma.item.count(),

    // 3. Stock Level (Sum of quantity for SUPPLY items)
    prisma.stock.aggregate({
      _sum: {
        quantity: true,
      },
    }),

    // 4. Category distribution (for chart)
    prisma.category.findMany({
      include: {
        _count: {
          select: { items: true },
        },
      },
    }),

    // 5. Recent additions
    prisma.item.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: { name: true },
        },
      },
    }),

    // 9. Low Stock Items (Supply with quantity < 5)
    prisma.stock.findMany({
      where: {
        quantity: { lt: 5 },
        item: {
          assetType: "SUPPLY",
        },
      },
      include: {
        item: {
          select: { name: true, code: true },
        },
      },
    }),
  ]);

  return {
    stats: {
      totalAssets,
      totalItems,
      totalStock: stockItems._sum.quantity || 0,
      totalCategories: categories.length,
    },
    chartData: categories
      .map((cat) => ({
        name: cat.name,
        value: cat._count.items,
      }))
      .filter((c) => c.value > 0),
    recentAssets: recentAssets.map((item) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      type: item.assetType,
      category: item.category?.name || "Uncategorized",
      createdAt: item.createdAt,
    })),
    lowStockItems: lowStockItems.map((s) => ({
      name: s.item.name,
      code: s.item.code,
      quantity: s.quantity,
    })),
  };
}
