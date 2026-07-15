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

  // Menentukan sama ada data perlu ditapis mengikut jabatan.
  // Jika role BUKAN 'staff_asset' dan BUKAN 'owner', maka tapis mengikut jabatan pengguna yang log masuk.
  const shouldFilterByDept =
    role !== ('staff_asset' as any) && role !== 'owner';

  // 1. Tapisan umum (Untuk Asset, Item, dan Stock)
  const baseWhere = {
    organizationId: activeOrgId,
    ...(shouldFilterByDept && deptId ? { departmentId: deptId } : {}),
  };

  // 2. Tapisan khusus untuk AuditLog
  const auditWhere = {
    organizationId: activeOrgId,
    ...(shouldFilterByDept && deptId ? { user: { departmentId: deptId } } : {}),
  };

  // Mengambil kiraan dan statistik
  const [
    totalAssets,
    totalItems,
    stockItems,
    golongan,
    recentAssets,
    lowStockItems,
  ] = await Promise.all([
    // 1. Jumlah Assets (Ditapis mengikut jabatan jika bukan staff_asset/owner)
    prisma.asset.count({ where: baseWhere }),

    // 2. Jumlah Items (Ditapis mengikut jabatan jika bukan staff_asset/owner)
    prisma.item.count({ where: baseWhere }),

    // 3. Tahap Stok (Ditapis mengikut jabatan jika bukan staff_asset/owner)
    prisma.stock.aggregate({
      where: baseWhere,
      _sum: {
        quantity: true,
      },
    }),

    // 4. Pengagihan berdasarkan Golongan (AssetGroup)
    prisma.assetGroup.findMany({
      where: { organizationId: activeOrgId },
      include: {
        _count: {
          select: {
            assets: {
              where:
                shouldFilterByDept && deptId ? { departmentId: deptId } : {},
            },
          },
        },
      },
    }),

    // 5. Aktiviti Terkini dari Log Audit (Ditapis melalui departmentId pengguna)
    prisma.auditLog.findMany({
      where: auditWhere,
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, image: true, departmentId: true },
        },
      },
    }),

    // 6. Barangan Stok Rendah (Ditapis mengikut jabatan jika bukan staff_asset/owner)
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
      totalCategories: golongan.length,
    },
    chartData: golongan
      .map((g) => ({
        name: g.name,
        value: g._count.assets,
      }))
      .filter((g) => g.value > 0),

    // Aktiviti Terkini
    recentActivity: recentAssets.map((log: any) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityInfo: log.entityInfo,
      userName: log.user?.name || 'System',
      createdAt: log.createdAt,
    })),

    // Barangan Stok Rendah
    lowStockItems: lowStockItems.map((s) => ({
      name: s.item.name,
      code: s.item.code,
      quantity: s.quantity,
    })),
  };
}
