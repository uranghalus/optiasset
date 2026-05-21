/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/lib/logger';

/* =======================
   TYPES
 ======================= */
export type ItemArgs = {
  page: number;
  pageSize: number;
};

/* =======================
   GET ALL ITEMS
 ======================= */
export async function getAllItems({ page, pageSize }: ItemArgs) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  // Ambil departmentId dari session
  const deptId = session.user.departmentId;

  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const skip = (safePage - 1) * safePageSize;
  const take = safePageSize;

  const [data, total] = await Promise.all([
    prisma.item.findMany({
      where: {
        organizationId: activeOrgId,
        departmentId: deptId, // Filter berdasarkan departemen user
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        department: {
          select: {
            id_department: true,
            kode_department: true,
            nama_department: true,
          },
        },
        _count: {
          select: { assets: true },
        },
      },
    }),
    prisma.item.count({
      where: { organizationId: activeOrgId, departmentId: deptId },
    }),
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
   GET CATEGORIES FOR SELECT
 ======================= */
export async function getCategoriesForSelect() {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  return prisma.category.findMany({
    // Jika model Category Anda TIDAK memiliki field departmentId, hapus "departmentId: deptId" dari sini.
    // Jika ada, biarkan seperti ini agar terfilter sesuai departemen.
    where: { organizationId: activeOrgId },
    select: { id: true, name: true, code: true },
    orderBy: { name: 'asc' },
  });
}

/* =======================
   HELPERS
 ======================= */
export async function getNextItemCode(
  assetType: 'FIXED' | 'SUPPLY',
  organizationId: string,
) {
  const prefix = assetType === 'FIXED' ? 'F-ITM-' : 'S-ITM-';

  // Kode unik level organisasi (bukan per departemen) mengikuti schema @@unique([code, organizationId])
  const lastItem = await prisma.item.findFirst({
    where: {
      organizationId,
      code: {
        startsWith: prefix,
      },
    },
    orderBy: {
      code: 'desc',
    },
  });

  let nextNumber = 1;
  if (lastItem) {
    const match = lastItem.code.slice(prefix.length);
    const parsed = parseInt(match, 10);
    if (!isNaN(parsed)) {
      nextNumber = parsed + 1;
    }
  }

  return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
}

/* =======================
   CREATE ITEM
 ======================= */
export async function createItem(formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  const deptId = session.user.departmentId;

  const name = formData.get('name')?.toString();
  const assetType = formData.get('assetType')?.toString() as
    | 'FIXED'
    | 'SUPPLY'
    | undefined;

  if (!name || !assetType) {
    throw new Error('Required fields are missing');
  }

  // Generate code if not provided or empty
  let code = formData.get('code')?.toString();
  if (!code || code.trim() === '' || code === 'AUTO') {
    code = await getNextItemCode(assetType, activeOrgId);
  }

  try {
    const item = await prisma.item.create({
      data: {
        code,
        name,
        assetType,
        organizationId: activeOrgId,
        departmentId: deptId, // Menghubungkan Item ke Departemen

        description: formData.get('description')?.toString() || null,
        createdBy: session.user.id,
        categoryId: formData.get('categoryId')?.toString() || null,
      },
    });

    // Record Audit Log
    await createAuditLog({
      userId: session.user.id,
      organizationId: activeOrgId,
      action: 'CREATE',
      entityType: 'ITEM',
      entityId: item.id,
      entityInfo: `${item.code} - ${item.name}`,
      details: {
        newData: item,
      },
    });

    revalidatePath('/assets/items');
    return item;
  } catch (error: any) {
    if (error?.code === 'P2002') {
      throw new Error(`Kode item "${code}" sudah digunakan.`);
    }
    throw error;
  }
}

/* =======================
   UPDATE ITEM
 ======================= */
export async function updateItem(id: string, formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  const deptId = session.user.departmentId;

  // Validasi tambahan: Pastikan item yang diedit berada di organisasi & departemen user
  const item = await prisma.item.findFirst({
    where: { id, organizationId: activeOrgId, departmentId: deptId },
  });
  if (!item) throw new Error('Item not found or access denied');

  try {
    const updated = await prisma.item.update({
      where: { id },
      data: {
        code: formData.get('code')?.toString() ?? item.code,
        name: formData.get('name')?.toString() ?? item.name,
        assetType:
          (formData.get('assetType')?.toString() as 'FIXED' | 'SUPPLY') ??
          item.assetType,

        description:
          formData.get('description')?.toString() || item.description,
        updatedBy: session.user.id,
        updatedAt: new Date(),
        categoryId: formData.get('categoryId')?.toString() || null,
      },
    });

    // Record Audit Log
    await createAuditLog({
      userId: session.user.id,
      organizationId: activeOrgId,
      action: 'UPDATE',
      entityType: 'ITEM',
      entityId: id,
      entityInfo: `${updated.code} - ${updated.name}`,
      details: {
        newData: updated,
      },
    });

    revalidatePath('/assets/items');
    return updated;
  } catch (error: any) {
    if (error?.code === 'P2002') {
      throw new Error(`Kode item sudah digunakan.`);
    }
    throw error;
  }
}

/* =======================
   DELETE ITEM
 ======================= */
export async function deleteItem(id: string) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  const deptId = session.user.departmentId;

  // Gunakan deleteMany untuk menghapus jika kita memfilter berdasarkan kombinasi id, orgId, deptId
  // (Karena findUnique / delete memerlukan exact unique identifier jika Prisma memintanya)
  const deleteResult = await prisma.item.deleteMany({
    where: { id, organizationId: activeOrgId, departmentId: deptId },
  });

  if (deleteResult.count === 0) {
    throw new Error('Item tidak ditemukan atau Anda tidak memiliki akses');
  }

  // Record Audit Log (Entity info kita set ID nya saja karena deleteMany tidak me-return object utuh)
  await createAuditLog({
    userId: session.user.id,
    organizationId: activeOrgId,
    action: 'DELETE',
    entityType: 'ITEM',
    entityId: id,
    entityInfo: `Item ID: ${id}`,
    details: {
      deletedData: { id },
    },
  });

  revalidatePath('/assets/items');
  return { id };
}

// LINK Item Multi Delete
export async function deleteManyItems(ids: string[]) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  const deptId = session.user.departmentId;

  // Hanya item di departemen yang sama yang boleh dihapus
  const items = await prisma.item.deleteMany({
    where: {
      id: { in: ids },
      organizationId: activeOrgId,
      departmentId: deptId,
    },
  });

  // Record Audit Log
  await createAuditLog({
    userId: session.user.id,
    organizationId: activeOrgId,
    action: 'DELETE',
    entityType: 'ITEM',
    entityId: ids.length.toString(),
    entityInfo: `${items.count} items deleted`,
    details: {
      deletedData: items,
    },
  });

  revalidatePath('/assets/items');
  return items;
}
