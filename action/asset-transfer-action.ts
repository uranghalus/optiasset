/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/lib/logger';

/* =======================
   TYPES
   ======================= */
export type TransferArgs = {
  page: number;
  pageSize: number;
  assetId?: string;
  status?: string[];
};

/* =======================
   GET ALL TRANSFERS
   ======================= */
export async function getAllTransfers({
  page,
  pageSize,
  assetId,
  status,
}: TransferArgs) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const skip = (safePage - 1) * safePageSize;
  const take = safePageSize;

  const where: any = { organizationId: activeOrgId };
  if (assetId) where.assetId = assetId;
  if (status && status.length > 0) {
    where.status = { in: status };
  }

  const [data, total] = await Promise.all([
    prisma.assetTransfer.findMany({
      where,
      skip,
      take,
      orderBy: { transferDate: 'desc' },
      include: {
        asset: {
          select: {
            kode_asset: true,
            brand: true,
            model: true,
            item: { select: { name: true, code: true, id: true } },
          },
        },
        fromLocation: { select: { name: true } },
        toLocation: { select: { name: true } },
        approvedBy: { select: { name: true } },
      },
    }),
    prisma.assetTransfer.count({ where }),
  ]);

  return {
    data,
    total,
    pageCount: Math.ceil(total / safePageSize),
    page: safePage,
    pageSize: safePageSize,
  };
}

/* =======================
   TRANSFER ASSET
   ======================= */
export async function transferAssetAction(formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  const assetId = formData.get('assetId')?.toString();
  const toLocationId = formData.get('toLocationId')?.toString();
  const toDeptId = formData.get('toDeptId')?.toString();
  const toDivId = formData.get('toDivId')?.toString();
  const reason = formData.get('reason')?.toString() || null;

  if (!assetId) throw new Error('Asset ID is required');

  const asset = await prisma.asset.findFirst({
    where: { id: assetId, organizationId: activeOrgId },
  });

  if (!asset) throw new Error('Asset not found');

  const oldLocationId = asset.locationId;
  const oldDeptId = asset.departmentId;

  const result = await prisma.assetTransfer.create({
    data: {
      assetId,
      fromLocationId: oldLocationId,
      toLocationId: toLocationId || oldLocationId,
      fromDeptId: oldDeptId,
      toDeptId: toDeptId || oldDeptId,
      fromDivId: null,
      toDivId: toDivId,
      reason,
      transferBy: session.user.name,
      status: 'PENDING',
      organizationId: activeOrgId,
    },
  });

  revalidatePath('/assets');
  revalidatePath('/asset-transfers');
  return result;
}

/* =======================
   APPROVE/REJECT TRANSFER
   ======================= */
export async function approveAssetTransferAction(id: string, status: 'APPROVED' | 'REJECTED') {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  const transfer = await prisma.assetTransfer.findUnique({
    where: { id },
    include: { asset: true },
  });

  if (!transfer || transfer.organizationId !== activeOrgId) {
    throw new Error('Transfer not found');
  }

  if (transfer.status !== 'PENDING') {
    throw new Error('Transfer already processed');
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedTransfer = await tx.assetTransfer.update({
      where: { id },
      data: {
        status,
        approvedById: session.user.id,
      },
    });

    if (status === 'APPROVED') {
      const updatedAsset = await tx.asset.update({
        where: { id: transfer.assetId },
        data: {
          locationId: transfer.toLocationId,
          departmentId: transfer.toDeptId,
          updatedAt: new Date(),
        },
      });

      if (transfer.toLocationId && transfer.toLocationId !== transfer.fromLocationId) {
        if (transfer.fromLocationId) {
          await tx.stock.updateMany({
            where: {
              itemId: transfer.asset.itemId,
              locationId: transfer.fromLocationId,
              organizationId: activeOrgId,
            },
            data: { quantity: { decrement: 1 } },
          });
        }

        await tx.stock.upsert({
          where: {
            itemId_locationId: {
              itemId: transfer.asset.itemId,
              locationId: transfer.toLocationId,
            },
          },
          create: {
            itemId: transfer.asset.itemId,
            locationId: transfer.toLocationId,
            organizationId: activeOrgId,
            quantity: 1,
          },
          update: {
            quantity: { increment: 1 },
          },
        });
      }

      await createAuditLog({
        userId: session.user.id,
        organizationId: activeOrgId,
        action: 'TRANSFER_APPROVED',
        entityType: 'ASSET',
        entityId: transfer.assetId,
        entityInfo: `${updatedAsset.kode_asset || 'N/A'} - ${updatedAsset.itemId || 'N/A'}`,
        details: {
          transferId: id,
          fromLocationId: transfer.fromLocationId,
          toLocationId: transfer.toLocationId,
        },
        tx,
      });
    }

    return updatedTransfer;
  });

  revalidatePath('/assets');
  revalidatePath('/asset-transfers');
  return result;
}
