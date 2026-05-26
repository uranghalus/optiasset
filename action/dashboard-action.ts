/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { auth } from '@/lib/auth';
import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function getDashboardData() {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const activeOrgId = session.session?.activeOrganizationId;
  const deptId = session.user.departmentId;

  if (!activeOrgId)
    throw new Error('No active organizationId found in session');

  const { role } = await auth.api.getActiveMemberRole({
    headers: await headers(),
  });

  const isStaff = role === ('staff_asset' as any) || role === 'owner';

  // 1. Filter umum (Untuk Asset, Item, dan Stock yang memiliki departmentId langsung)
  const baseWhere = {
    organizationId: activeOrgId,
    ...(isStaff && deptId ? { departmentId: deptId } : {}),
  };

  // 2. Filter khusus AuditLog (Karena AuditLog tidak punya departmentId, kita filter lewat relasi User)
  const auditWhere = {
    organizationId: activeOrgId,
    ...(isStaff && deptId ? { user: { departmentId: deptId } } : {}),
  };

  // Fetch counts and stats
  const [
    totalAssets,
    totalItems,
    stockItems,
    categories,
    recentAssets,
    lowStockItems,
  ] = await Promise.all([
    // 1. Total Assets (Bisa difilter per departemen)
    prisma.asset.count({ where: baseWhere }),

    // 2. Total Items (Bisa difilter per departemen karena di schema ada departmentId)
    prisma.item.count({ where: baseWhere }),

    // 3. Stock Level (Bisa difilter per departemen karena di schema ada departmentId)
    prisma.stock.aggregate({
      where: baseWhere,
      _sum: {
        quantity: true,
      },
    }),

    // 4. Category distribution (Tetap Global per Organisasi karena Category tidak punya departmentId)
    prisma.category.findMany({
      where: { organizationId: activeOrgId },
      include: {
        _count: {
          select: { items: true },
        },
      },
    }),

    // 5. Recent Activity from Audit Logs (Difilter lewat relasi user.departmentId)
    prisma.auditLog.findMany({
      where: auditWhere,
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
    }),

    // 6. Low Stock Items (Difilter per departemen)
    prisma.stock.findMany({
      where: {
        ...baseWhere,
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
