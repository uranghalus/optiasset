'use server';
import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/lib/logger';

/* =======================
   TYPES
 ======================= */
export type AssetCategoryArgs = {
  page: number;
  pageSize: number;
};

/* =======================
   HELPER: RESOLVE CLASSIFICATION
 ======================= */
// Fungsi ini membaca ID dari Chained Dropdown dan merakit kodenya
async function resolveClassification(formData: FormData) {
  const assetGroupId = formData.get('assetGroupId')?.toString();
  const assetCategoryId = formData.get('assetCategoryId')?.toString();
  const assetClusterId = formData.get('assetClusterId')?.toString();
  const assetSubClusterId = formData.get('assetSubClusterId')?.toString();

  let finalCode = '';
  let targetId: string | null = null;
  let targetLevel: 'GROUP' | 'CATEGORY' | 'CLUSTER' | 'SUBCLUSTER' | null =
    null;

  if (assetSubClusterId) {
    const data = await prisma.assetSubCluster.findUnique({
      where: { id: assetSubClusterId },
      include: {
        assetCluster: {
          include: { assetCategory: { include: { assetGroup: true } } },
        },
      },
    });
    if (data) {
      finalCode = [
        data.assetCluster.assetCategory.assetGroup.code,
        data.assetCluster.assetCategory.code,
        data.assetCluster.code,
        data.code,
      ]
        .filter(Boolean)
        .join('.');
      targetId = assetSubClusterId;
      targetLevel = 'SUBCLUSTER';
    }
  } else if (assetClusterId) {
    const data = await prisma.assetCluster.findUnique({
      where: { id: assetClusterId },
      include: { assetCategory: { include: { assetGroup: true } } },
    });
    if (data) {
      finalCode = [
        data.assetCategory.assetGroup.code,
        data.assetCategory.code,
        data.code,
      ]
        .filter(Boolean)
        .join('.');
      targetId = assetClusterId;
      targetLevel = 'CLUSTER';
    }
  } else if (assetCategoryId) {
    const data = await prisma.assetCategory.findUnique({
      where: { id: assetCategoryId },
      include: { assetGroup: true },
    });
    if (data) {
      finalCode = [data.assetGroup.code, data.code].filter(Boolean).join('.');
      targetId = assetCategoryId;
      targetLevel = 'CATEGORY';
    }
  } else if (assetGroupId) {
    const data = await prisma.assetGroup.findUnique({
      where: { id: assetGroupId },
    });
    if (data) {
      finalCode = data.code || '';
      targetId = assetGroupId;
      targetLevel = 'GROUP';
    }
  }

  return { code: finalCode, targetId, targetLevel };
}

/* =======================
   GET ALL CATEGORIES
 ======================= */
export async function getAllCategories({ page, pageSize }: AssetCategoryArgs) {
  // ... (Kode GET ALL Anda tetap sama persis, tidak perlu diubah) ...
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const skip = (safePage - 1) * safePageSize;
  const take = safePageSize;

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where: { organizationId: activeOrgId },
      skip,
      take,
      orderBy: { name: 'asc' },
      include: {
        items: {
          select: { _count: { select: { assets: true } } },
        },
        _count: { select: { items: true } },
      },
    }),
    prisma.category.count({
      where: { organizationId: activeOrgId },
    }),
  ]);

  const data = categories.map((cat) => {
    const assetsCount = cat.items.reduce(
      (sum, item) => sum + item._count.assets,
      0,
    );
    return {
      ...cat,
      _count: {
        ...cat._count,
        assets: assetsCount,
      },
    };
  });

  return {
    data,
    total,
    pageCount: Math.ceil(total / safePageSize),
    page: safePage,
    pageSize: safePageSize,
  };
}

/* =======================
   CREATE CATEGORY
 ======================= */
export async function createCategory(formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  const name = formData.get('name')?.toString();
  if (!name) throw new Error('Required fields are missing');

  // Panggil helper untuk menyusun kode klasifikasi
  const classification = await resolveClassification(formData);

  const category = await prisma.category.create({
    data: {
      name,
      code: classification.code, // Hasil gabungan
      classificationId: classification.targetId, // ID dari level terdalam
      classificationType: classification.targetLevel, // Penanda level
      organizationId: activeOrgId,
    },
  });

  await createAuditLog({
    userId: session.user.id,
    organizationId: activeOrgId,
    action: 'CREATE',
    entityType: 'CATEGORY',
    entityId: category.id,
    entityInfo: category.name,
    details: { newData: category },
  });

  revalidatePath('/assets/categories');
  return category;
}

/* =======================
   UPDATE CATEGORY
 ======================= */
export async function updateCategory(id: string, formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  const category = await prisma.category.findFirst({
    where: { id, organizationId: activeOrgId },
  });

  if (!category) throw new Error('Category not found');
  const name = formData.get('name')?.toString();

  if (!id || !name) throw new Error('Required fields are missing');

  // Panggil helper untuk menyusun ulang kode klasifikasi (jika diubah)
  const classification = await resolveClassification(formData);

  const updated = await prisma.category.update({
    where: { id },
    data: {
      name: name ?? category.name,
      code: classification.code || category.code,
      classificationId: classification.targetId || category.classificationId,
      classificationType: classification.targetLevel || category.classificationType,
    },
  });

  await createAuditLog({
    userId: session.user.id,
    organizationId: activeOrgId,
    action: 'UPDATE',
    entityType: 'CATEGORY',
    entityId: id,
    entityInfo: updated.name,
    details: { newData: updated },
  });

  revalidatePath('/assets/categories');
  return updated;
}

/* =======================
   DELETE CATEGORY
 ======================= */
export async function deleteCategory(id: string) {
  // ... (Kode DELETE Anda tetap sama persis) ...
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  const category = await prisma.category.delete({
    where: { id, organizationId: activeOrgId },
  });

  await createAuditLog({
    userId: session.user.id,
    organizationId: activeOrgId,
    action: 'DELETE',
    entityType: 'CATEGORY',
    entityId: id,
    entityInfo: category.name,
    details: { deletedData: category },
  });

  revalidatePath('/assets/categories');
  return category;
}

// Delete Many Category

export async function deleteManyCategories(ids: string[]) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  const categories = await prisma.category.deleteMany({
    where: { id: { in: ids }, organizationId: activeOrgId },
  });

  await createAuditLog({
    userId: session.user.id,
    organizationId: activeOrgId,
    action: 'DELETE',
    entityType: 'CATEGORY',
    entityId: ids.join(','),
    entityInfo: categories.count.toString(),
    details: { deletedData: categories },
  });

  revalidatePath('/assets/categories');
  return categories;
}