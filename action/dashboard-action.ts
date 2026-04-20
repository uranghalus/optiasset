/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';

export async function getDashboardData() {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId)
    throw new Error('No active organizationId found in session');

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
    prisma.asset.count({ where: { organizationId: activeOrgId } }),

    // 2. Total Items (Catalog)
    prisma.item.count({ where: { organizationId: activeOrgId } }),

    // 3. Stock Level (Sum of quantity for SUPPLY items)
    prisma.stock.aggregate({
      where: { organizationId: activeOrgId },
      _sum: {
        quantity: true,
      },
    }),

    // 4. Category distribution (for chart)
    prisma.category.findMany({
      where: { organizationId: activeOrgId },
      include: {
        _count: {
          select: { items: true },
        },
      },
    }),

    // 5. Recent Activity from Audit Logs
    prisma.auditLog.findMany({
      where: { organizationId: activeOrgId },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
    }),

    // 6. Low Stock Items (Supply with quantity < 5)
    prisma.stock.findMany({
      where: {
        organizationId: activeOrgId,
        quantity: { lt: 5 },
        item: {
          assetType: 'SUPPLY',
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
    recentActivity: recentAssets.map((log: any) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityInfo: log.entityInfo,
      userName: log.user?.name || 'System',
      createdAt: log.createdAt,
    })),
    lowStockItems: lowStockItems.map((s) => ({
      name: s.item.name,
      code: s.item.code,
      quantity: s.quantity,
    })),
  };
}
