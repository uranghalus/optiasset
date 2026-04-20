/* eslint-disable @typescript-eslint/no-explicit-any */

'use server';

import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/lib/logger';

export type StockArgs = {
  page: number;
  pageSize: number;
};

/* =======================
   GET ALL STOCKS
   ======================= */
export async function getAllStocks({ page, pageSize }: StockArgs) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const skip = (safePage - 1) * safePageSize;
  const take = safePageSize;

  const [data, total] = await Promise.all([
    prisma.stock.findMany({
      skip,
      take,
      orderBy: { updatedAt: 'desc' },
      include: {
        item: {
          include: {
            category: {
              select: { id: true, name: true },
            },
          },
        },
        location: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.stock.count(),
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
   GET STOCK BY ITEM
   ======================= */
export async function getStockByItem(itemId: string) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  // Get or Create initial stock if doesn't exist?
  // For now, let's just fetch.
  return prisma.stock.findMany({
    where: { itemId },
    include: {
      location: true,
    },
  });
}

/* =======================
   GET STOCK TRANSACTIONS
   ======================= */
export async function getStockTransactions(stockId: string) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  return prisma.stockTransaction.findMany({
    where: { stockId },
    orderBy: { createdAt: 'desc' },
    include: {
      stock: {
        include: {
          item: {
            select: { name: true, code: true },
          },
        },
      },
    },
  });
}

/* =======================
   RECORD TRANSACTION (IN/OUT)
   ======================= */
export async function recordStockTransaction(data: {
  stockId?: string;
  itemId?: string;
  locationId?: string | null;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reference?: string;
  notes?: string;
}) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  if (data.quantity <= 0) throw new Error('Quantity must be positive');

  return prisma.$transaction(async (tx) => {
    let stockId = data.stockId;

    // If stockId is not provided, find or create by itemId + locationId
    if (!stockId) {
      if (!data.itemId)
        throw new Error('itemId is required if stockId is missing');

      const existingStock = await tx.stock.findFirst({
        where: {
          itemId: data.itemId,
          locationId:
            data.locationId === 'DEFAULT' || !data.locationId
              ? null
              : data.locationId,
        },
      });

      if (existingStock) {
        stockId = existingStock.id;
      } else {
        if (!session.session.activeOrganizationId) {
          throw new Error('Active organization is required');
        }
        const newStock = await tx.stock.create({
          data: {
            itemId: data.itemId,
            locationId: data.locationId || null,
            quantity: 0,
            organizationId: session.session.activeOrganizationId,
          },
        });
        stockId = newStock.id;
      }
    }

    // 1. Get current stock
    const stock = await tx.stock.findUnique({
      where: { id: stockId as string },
    });

    if (!stock) throw new Error('Stock record not found');

    // 2. Calculate new quantity
    let newQuantity = stock.quantity;
    if (data.type === 'IN') {
      newQuantity += data.quantity;
    } else if (data.type === 'OUT') {
      if (stock.quantity < data.quantity) {
        throw new Error('Insufficient stock');
      }
      newQuantity -= data.quantity;
    } else if (data.type === 'ADJUSTMENT') {
      // For adjustments, we might pass the delta or the absolute new value.
      // Here we assume delta based on the type.
      newQuantity += data.quantity; // Adjustments can be positive or negative in a real system, but here we provide 'type'
    }

    // 3. Update stock
    await tx.stock.update({
      where: { id: stockId },
      data: { quantity: newQuantity },
    });

    // 4. Create transaction log
    // We use a dynamic lookup to handle potential naming mismatches in the generated client
    const stockTxModel =
      (tx as any).stockTransaction ||
      (tx as any).StockTransaction ||
      (tx as any).stocktransaction;

    if (!stockTxModel) {
      console.error(
        'Available tx keys:',
        Object.keys(tx).filter((k) => !k.startsWith('_')),
      );
      throw new Error('StockTransaction model not found in Prisma client');
    }

    const transaction = await stockTxModel.create({
      data: {
        stockId,
        type: data.type,
        quantity: data.quantity,
        reference: data.reference,
        notes: data.notes,
      },
    });

    // Record Audit Log
    await createAuditLog({
      userId: session.user.id,
      action: data.type === 'ADJUSTMENT' ? 'ADJUSTMENT' : 'UPDATE',
      entityType: 'STOCK',
      entityId: stockId,
      details: {
        transactionId: transaction.id,
        type: data.type,
        quantity: data.quantity,
        reference: data.reference,
      },
      tx,
    });

    revalidatePath('/assets/items');
    revalidatePath('/dashboard');

    return transaction;
  });
}

/* =======================
   GET ALL STOCK TRANSACTIONS
   ======================= */
export async function getAllStockTransactions({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const skip = (safePage - 1) * safePageSize;
  const take = safePageSize;

  const [data, total] = await Promise.all([
    prisma.stockTransaction.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        stock: {
          include: {
            item: {
              select: { name: true, code: true },
            },
            location: {
              select: { name: true },
            },
          },
        },
      },
    }),
    prisma.stockTransaction.count(),
  ]);

  return {
    data,
    total,
    pageCount: Math.ceil(total / safePageSize),
    page: safePage,
    pageSize: safePageSize,
  };
}
