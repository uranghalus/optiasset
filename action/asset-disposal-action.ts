/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/lib/logger';

export type DisposalArgs = {
  page: number;
  pageSize: number;
  assetId?: string;
  status?: string[];
};

export async function getAllDisposals({
  page,
  pageSize,
  assetId,
  status,
}: DisposalArgs) {
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
    prisma.assetDisposal.findMany({
      where,
      skip,
      take,
      orderBy: { disposalDate: 'desc' },
      include: {
        asset: {
          select: {
            kode_asset: true,
            brand: true,
            model: true,
            location: { select: { name: true } },
            item: { select: { name: true, code: true, id: true } },
          },
        },
        requestedBy: { select: { name: true } },
        spvApprovedBy: { select: { name: true } },
        staffApprovedBy: { select: { name: true } },
      },
    }),
    prisma.assetDisposal.count({ where }),
  ]);

  return {
    data,
    total,
    pageCount: Math.ceil(total / safePageSize),
    page: safePage,
    pageSize: safePageSize,
  };
}

export async function createDisposalAction(formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  const assetId = formData.get('assetId')?.toString();
  const reason = formData.get('reason')?.toString() || null;

  if (!assetId) throw new Error('Asset ID is required');

  const asset = await prisma.asset.findFirst({
    where: { id: assetId, organizationId: activeOrgId },
  });

  if (!asset) throw new Error('Asset not found');

  const result = await prisma.assetDisposal.create({
    data: {
      assetId,
      reason,
      requestedById: session.user.id,
      status: 'PENDING_SPV',
      organizationId: activeOrgId,
    },
  });

  revalidatePath('/assets');
  revalidatePath('/asset-disposals');
  return result;
}

export async function approveDisposalAction(id: string, action: 'APPROVE' | 'REJECT', role: string) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  const disposal = await prisma.assetDisposal.findUnique({
    where: { id },
    include: { asset: true },
  });

  if (!disposal || disposal.organizationId !== activeOrgId) {
    throw new Error('Disposal not found');
  }

  if (disposal.status === 'APPROVED' || disposal.status === 'REJECTED') {
    throw new Error('Disposal already processed');
  }

  const result = await prisma.$transaction(async (tx) => {
    let newStatus = disposal.status;
    let dataToUpdate: any = {};

    const isSpv = role.toLowerCase() === 'spv';
    const isStaff = role.toLowerCase() === 'staff aset';

    if (action === 'REJECT') {
      newStatus = 'REJECTED';
      if (isSpv) dataToUpdate.spvApprovedById = session.user.id;
      if (isStaff) dataToUpdate.staffApprovedById = session.user.id;
    } else if (action === 'APPROVE') {
      if (isSpv && disposal.status === 'PENDING_SPV') {
        newStatus = 'PENDING_STAFF';
        dataToUpdate.spvApprovedById = session.user.id;
      } else if (isStaff && disposal.status === 'PENDING_STAFF') {
        newStatus = 'APPROVED';
        dataToUpdate.staffApprovedById = session.user.id;
      } else {
        throw new Error('Invalid approval state for role');
      }
    }

    dataToUpdate.status = newStatus;

    const updatedDisposal = await tx.assetDisposal.update({
      where: { id },
      data: dataToUpdate,
    });

    if (newStatus === 'APPROVED') {
      const updatedAsset = await tx.asset.update({
        where: { id: disposal.assetId },
        data: {
          status: 'DISPOSED',
          updatedAt: new Date(),
        },
      });

      // Update Stock if available
      if (disposal.asset.locationId && disposal.asset.assignedStatus === 'AVAILABLE') {
        await tx.stock.updateMany({
          where: {
            itemId: disposal.asset.itemId,
            locationId: disposal.asset.locationId,
            organizationId: activeOrgId,
          },
          data: { quantity: { decrement: 1 } },
        });
      }

      await createAuditLog({
        userId: session.user.id,
        organizationId: activeOrgId,
        action: 'DISPOSAL_APPROVED',
        entityType: 'ASSET',
        entityId: disposal.assetId,
        entityInfo: `${updatedAsset.kode_asset || 'N/A'} - ${updatedAsset.itemId || 'N/A'}`,
        details: {
          disposalId: id,
        },
        tx,
      });
    }

    return updatedDisposal;
  });

  revalidatePath('/assets');
  revalidatePath('/asset-disposals');
  return result;
}
