'use server';
import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/lib/logger';
import * as XLSX from 'xlsx';
/* =======================
   TYPES
 ======================= */
export type AssetCategoryArgs = {
  page: number;
  pageSize: number;
  search?: string;
};

/* =======================
   HELPER: RESOLVE CLASSIFICATION
 ======================= */
// LINK resolveClassification
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
// LINK getAllCategories
export async function getAllCategories({
  page,
  pageSize,
  search,
}: AssetCategoryArgs) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const skip = (safePage - 1) * safePageSize;
  const take = safePageSize;

  // Siapkan klausa where dasar
  const whereClause: any = { organizationId: activeOrgId };

  // Jika ada input search, cari berdasarkan nama atau kode klasifikasi
  if (search) {
    whereClause.OR = [
      { name: { contains: search } },
      { code: { contains: search } },
    ];
  }

  const [categories, total] = await prisma.$transaction([
    prisma.category.findMany({
      where: whereClause, // Gunakan whereClause di sini
      skip,
      take,
      orderBy: [{ name: 'asc' }, { code: 'asc' }],
      include: {
        items: {
          select: { _count: { select: { assets: true } } },
        },
        _count: { select: { items: true } },
      },
    }),
    prisma.category.count({
      where: whereClause, // Gunakan whereClause di sini juga untuk total halaman
    }),
  ]);

  const data = categories.map((cat) => {
    // PERBAIKAN 3: Fallback ke array kosong dan berikan optional chaining (?.) untuk mencegah error
    const assetsCount = (cat.items || []).reduce(
      (sum, item) => sum + (item._count?.assets || 0),
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
// LINK createCategory
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
// LINK updateCategory
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
      classificationType:
        classification.targetLevel || category.classificationType,
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
// LINK deleteCategory
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

// LINK Import Category
export async function importCategoryExcel(formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  try {
    const file = formData.get('file') as File;
    if (!file) return { error: 'File tidak ditemukan' };

    const buffer = await file.arrayBuffer();
    // Gunakan fungsi read dari xlsx
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Mulai membaca data (baris 1 adalah header, jadi data mulai di index 1)
    const rows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
    }) as any[][];

    const result = await prisma.$transaction(
      async (tx) => {
        let importedCount = 0;

        // Iterasi mulai dari i = 1 untuk melewati header
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          // Mapping sesuai dengan header Excel Anda
          const groupCode = row[0]?.toString().trim(); // Golongan Aset
          const categoryCode = row[1]?.toString().trim(); // Bidang/ Kategori Aset
          const clusterCode = row[2]?.toString().trim(); // Kelompok Aset
          const subClusterCode = row[3]?.toString().trim(); // Sub. Kelompok Aset
          const name = row[4]?.toString().trim(); // Uraian (Nama Kategori)
          // const notes = row[5]?.toString().trim();       // Keterangan (Opsional, jika schema Category Anda butuh)

          if (!name) continue; // Skip jika Uraian kosong

          let targetId: string | null = null;
          let targetLevel:
            | 'GROUP'
            | 'CATEGORY'
            | 'CLUSTER'
            | 'SUBCLUSTER'
            | null = null;
          const finalCodeParts: string[] = [];

          // 1. Resolve Group (Golongan)
          if (groupCode) {
            const group = await tx.assetGroup.findFirst({
              where: { code: groupCode, organizationId: activeOrgId },
            });

            if (group) {
              targetId = group.id;
              targetLevel = 'GROUP';
              finalCodeParts.push(group.code || '');

              // 2. Resolve Asset Category (Bidang)
              if (categoryCode) {
                const assetCat = await tx.assetCategory.findFirst({
                  where: { code: categoryCode, assetGroupId: group.id },
                });

                if (assetCat) {
                  targetId = assetCat.id;
                  targetLevel = 'CATEGORY';
                  finalCodeParts.push(assetCat.code || '');

                  // 3. Resolve Asset Cluster (Kelompok)
                  if (clusterCode) {
                    const cluster = await tx.assetCluster.findFirst({
                      where: {
                        code: clusterCode,
                        assetCategoryId: assetCat.id,
                      },
                    });

                    if (cluster) {
                      targetId = cluster.id;
                      targetLevel = 'CLUSTER';
                      finalCodeParts.push(cluster.code || '');

                      // 4. Resolve Asset Sub-Cluster (Sub Kelompok)
                      if (subClusterCode) {
                        const subCluster = await tx.assetSubCluster.findFirst({
                          where: {
                            code: subClusterCode,
                            assetClusterId: cluster.id,
                          },
                        });

                        if (subCluster) {
                          targetId = subCluster.id;
                          targetLevel = 'SUBCLUSTER';
                          finalCodeParts.push(subCluster.code || '');
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          const finalCode = finalCodeParts.join('.');

          // Cek apakah kategori dengan nama yang sama sudah ada
          const existingCategory = await tx.category.findFirst({
            where: { name, organizationId: activeOrgId },
          });

          // Jika belum ada, buat kategori baru
          if (!existingCategory) {
            const newCategory = await tx.category.create({
              data: {
                name, // Dari kolom Uraian
                code: finalCode || '', // Format misal: 01.02.03.04
                classificationId: targetId, // ID hierarki terdalam yang valid
                classificationType: targetLevel, // Level hierarki terdalam yang valid
                organizationId: activeOrgId,
                // description: notes // (Uncomment jika schema Prisma Category Anda punya field description)
              },
            });

            // Catat audit log
            await createAuditLog({
              userId: session.user.id,
              organizationId: activeOrgId,
              action: 'CREATE',
              entityType: 'CATEGORY',
              entityId: newCategory.id,
              entityInfo: newCategory.name,
              details: { newData: newCategory, source: 'EXCEL_IMPORT' },
              tx,
            });

            importedCount++;
          }
        }

        return { success: true, count: importedCount };
      },
      { timeout: 30000 },
    ); // Timeout ditingkatkan untuk memproses Excel

    revalidatePath('/assets/categories');
    return { success: `Berhasil mengimport ${result.count} data kategori.` };
  } catch (error: any) {
    console.error('❌ CATEGORY_IMPORT_ERROR:', error);
    return { error: error.message || 'Gagal memproses file Excel' };
  }
}
