/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import PDFDocument from 'pdfkit';
import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/lib/logger';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import path from 'path';
import ExcelJS from 'exceljs';
import { buildAssetFilter } from '@/lib/filter';
import * as XLSX from 'xlsx';
import { getColumnIndex, ASSET_MAPPER } from '@/lib/excel-mapper';
import bwipjs from 'bwip-js';
import { deleteS3File, uploadToS3 } from '@/lib/s3-utils';
import { AssetWithItem } from '@/app/(app)/assets/components/asset-column';
import { Prisma } from '@/generated/prisma';

/* =======================
   TYPES
 ======================= */
export type AssetArgs = {
  page: number;
  pageSize: number;
  departmentId?: string[];
  condition?: string[];
  categoryId?: string;
  search?: string;
  organizationId?: string;
};

/* =======================
   GET ALL ASSETS
 ======================= */
// LINK getAllAssets
export async function getAllAssets({
  page,
  pageSize,
  departmentId,
  condition,
  categoryId,
  search,
}: AssetArgs) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const roleRes = await auth.api.getActiveMemberRole({
    headers: await headers(),
  });
  const role = roleRes?.role;

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  const where = buildAssetFilter({
    role,
    userDepartmentId: session.user.departmentId,
    filterDepartmentId: departmentId,
    condition,
    categoryId,
    search,
    organizationId: activeOrgId,
  });

  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);

  const [data, total] = await prisma.$transaction([
    prisma.asset.findMany({
      where,
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        kode_asset: true,
        partNumber: true,
        condition: true,
        purchaseDate: true,
        brand: true,
        model: true,
        photoUrl: true,
        departmentId: true,
        item: {
          select: {
            name: true,
            code: true,
            assetType: true,
          },
        },
        location: {
          select: {
            name: true,
          },
        },
        department: {
          select: {
            nama_department: true,
            kode_department: true,
          },
        },
      },
    }),
    prisma.asset.count({ where }),
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
   GET ITEMS FOR SELECT
 ======================= */
// LINK getItemsForSelect
export async function getItemsForSelect() {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) return [];
  const deptId = session.user.departmentId;
  return prisma.item.findMany({
    where: { organizationId: activeOrgId, departmentId: deptId },
    select: {
      id: true,
      name: true,
      code: true,
      assetType: true,
      category: {
        select: {
          id: true,
          name: true,
          code: true,
          classificationId: true,
          classificationType: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });
}

/* =======================
   GET LOCATIONS FOR SELECT
 ======================= */
// LINK getLocationsForSelect
export async function getLocationsForSelect() {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) return [];

  return prisma.location.findMany({
    where: { organizationId: activeOrgId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}

/* =======================
   GET ASSETS FOR LOAN SELECT
 ======================= */
// LINK getAvailableAssetsForLoanSelect
export async function getAvailableAssetsForLoanSelect({
  departmentId,
  divisiId,
}: {
  departmentId: string;
  divisiId?: string;
}) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  const where: any = {
    organizationId: activeOrgId,
    status: { in: ['ACTIVE', 'GOOD'] },
  };

  if (departmentId) {
    where.departmentId = departmentId;
  }

  if (divisiId && divisiId !== 'ALL') {
    where.divisiId = divisiId;
  }

  return prisma.asset.findMany({
    where,
    select: {
      id: true,
      kode_asset: true,
      item: {
        select: { name: true },
      },
    },
    orderBy: { item: { name: 'asc' } },
  });
}

/* =======================
   GENERATE ASSET CODE
 ======================= */
// LINK generateAssetCode
export async function generateAssetCode(categoryCode?: string) {
  if (!categoryCode) return '';

  const prefix = categoryCode;

  const lastAsset = await prisma.asset.findFirst({
    where: {
      kode_asset: {
        startsWith: prefix + '.',
      },
    },
    orderBy: {
      kode_asset: 'desc',
    },
  });

  let nextSequence = 1;

  if (lastAsset?.kode_asset) {
    const parts = lastAsset.kode_asset.split('.');
    const lastSeq = Number(parts[parts.length - 1]);

    if (!isNaN(lastSeq)) {
      nextSequence = lastSeq + 1;
    }
  }

  const seq = String(nextSequence).padStart(4, '0');
  return `${prefix}.${seq}`;
}

/* =======================
   CREATE ASSET
 ======================= */
// LINK createAsset
export async function createAsset(formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const memberRole = await auth.api.getActiveMemberRole({
    headers: await headers(),
  });
  const role = memberRole.role as string;
  const sessionDeptId = session.user.departmentId;
  if (!sessionDeptId) throw new Error('User has no department');

  const itemId = formData.get('itemId')?.toString();
  if (!itemId) throw new Error('Item is required');

  const parseDateOrNull = (key: string) => {
    const val = formData.get(key)?.toString();
    return val ? new Date(val) : null;
  };

  const parseFloatOrNull = (key: string) => {
    const val = formData.get(key)?.toString();
    return val ? parseFloat(val) : null;
  };

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  const photoFile = formData.get('photo') as File | null;
  let photoUrl = null;
  if (photoFile && photoFile.size > 0) {
    photoUrl = await uploadToS3(photoFile, 'asset-photos');
  }

  const formDepartmentId = formData.get('departmentId')?.toString();
  const isAdminOrOwner = role === 'staff_asset' || role === 'owner';
  const finalDepartmentId =
    isAdminOrOwner && formDepartmentId ? formDepartmentId : sessionDeptId;

  const itemMaster = await prisma.item.findUnique({
    where: { id: itemId },
    include: { category: true },
  });
  if (!itemMaster) throw new Error('Master Item tidak ditemukan');

  let finalKodeAsset = formData.get('kode_asset')?.toString()?.trim() || null;

  const asset = await prisma.$transaction(async (tx) => {
    // Auto Generate Code
    if (!finalKodeAsset && itemMaster.category?.code) {
      const prefix = itemMaster.category.code;
      const lastAsset = await tx.asset.findFirst({
        where: {
          organizationId: activeOrgId,
          kode_asset: { startsWith: prefix + '.' },
        },
        orderBy: { kode_asset: 'desc' },
      });

      let nextSequence = 1;
      if (lastAsset?.kode_asset) {
        const parts = lastAsset.kode_asset.split('.');
        const lastSeq = Number(parts[parts.length - 1]);
        if (!isNaN(lastSeq)) nextSequence = lastSeq + 1;
      }
      finalKodeAsset = `${prefix}.${String(nextSequence).padStart(4, '0')}`;
    }

    // Ekstraksi Flat Fields
    let assetGroupId = null,
      assetCategoryId = null,
      assetClusterId = null,
      assetSubClusterId = null;

    if (
      itemMaster.category?.classificationId &&
      itemMaster.category.classificationType
    ) {
      const targetId = itemMaster.category.classificationId;
      const type = itemMaster.category.classificationType;

      if (type === 'SUBCLUSTER') {
        const sub = await tx.assetSubCluster.findUnique({
          where: { id: targetId },
          include: { assetCluster: { include: { assetCategory: true } } },
        });
        assetSubClusterId = targetId;
        assetClusterId = sub?.assetClusterId || null;
        assetCategoryId = sub?.assetCluster?.assetCategoryId || null;
        assetGroupId = sub?.assetCluster?.assetCategory?.assetGroupId || null;
      } else if (type === 'CLUSTER') {
        const clust = await tx.assetCluster.findUnique({
          where: { id: targetId },
          include: { assetCategory: true },
        });
        assetClusterId = targetId;
        assetCategoryId = clust?.assetCategoryId || null;
        assetGroupId = clust?.assetCategory?.assetGroupId || null;
      } else if (type === 'CATEGORY') {
        const cat = await tx.assetCategory.findUnique({
          where: { id: targetId },
        });
        assetCategoryId = targetId;
        assetGroupId = cat?.assetGroupId || null;
      } else if (type === 'GROUP') {
        assetGroupId = targetId;
      }
    }

    // INTELEJEN DETEKSI APAR & HYDRANT (HYBRID)
    const lowerUnitName = String(itemMaster.name).toLowerCase();

    let aparData: any = null;
    if (
      lowerUnitName.includes('apar') ||
      lowerUnitName.includes('fire extinguisher')
    ) {
      let jenis = formData.get('aparJenis')?.toString() as
        | 'CO2'
        | 'Powder'
        | 'Foam'
        | 'Air'
        | undefined;
      if (!jenis) {
        jenis = 'Powder';
        if (lowerUnitName.includes('co2')) jenis = 'CO2';
        else if (lowerUnitName.includes('foam')) jenis = 'Foam';
        else if (
          lowerUnitName.includes('air') ||
          lowerUnitName.includes('water')
        )
          jenis = 'Air';
      }

      let size = formData.get('aparSize')
        ? parseFloat(formData.get('aparSize') as string)
        : null;
      if (!size || isNaN(size)) {
        const sizeMatch = lowerUnitName.match(/(\d+(\.\d+)?)\s*(kg|liter|l)/i);
        size = sizeMatch ? parseFloat(sizeMatch[1]) : 4.5;
      }
      aparData = { jenis, size };
    }

    let hydrantData: any = null;
    if (lowerUnitName.includes('hydrant')) {
      let ukuran = formData.get('hydrantUkuran')?.toString();
      if (!ukuran) {
        const sizeMatch = lowerUnitName.match(
          /(\d+(\.\d+)?)\s*(inch|in|"|cm)/i,
        );
        ukuran = sizeMatch ? `${sizeMatch[1]} ${sizeMatch[3]}` : '1.5 inch';
      }
      hydrantData = { ukuran };
    }

    // Eksekusi Simpan Asset Utama
    const newAsset = await tx.asset.create({
      data: {
        itemId,
        organizationId: activeOrgId,
        purchaseDate: parseDateOrNull('purchaseDate'),
        purchasePrice: parseFloatOrNull('purchasePrice'),
        condition: formData.get('condition')?.toString() || null,
        warrantyExpire: parseDateOrNull('warrantyExpire'),
        locationId: formData.get('locationId')?.toString() || null,
        brand: formData.get('brand')?.toString() || null,
        model: formData.get('model')?.toString() || null,
        partNumber: formData.get('partNumber')?.toString() || null,
        serialNumber: formData.get('serialNumber')?.toString() || null,
        document_number: formData.get('document_number')?.toString() || null,
        no_spb: formData.get('no_spb')?.toString() || null,
        departmentId: finalDepartmentId,
        notes: formData.get('notes')?.toString() || null,
        kode_asset: finalKodeAsset,
        vendorName: formData.get('vendorName')?.toString() || null,
        garansi_exp: parseDateOrNull('garansi_exp'),
        photoUrl,

        assetGroupId,
        assetCategoryId,
        assetClusterId,
        assetSubClusterId,

        ...(assetSubClusterId && {
          assetSubClusters: { connect: [{ id: assetSubClusterId }] },
        }),
        ...(aparData && {
          aparDetails: {
            create: {
              jenis: aparData.jenis,
              size: new Prisma.Decimal(aparData.size || 0),
            },
          },
        }),

        ...(hydrantData && {
          hydrantDetails: {
            create: {
              ukuran: hydrantData.ukuran,
            },
          },
        }),
      },
    });

    const locationId = formData.get('locationId')?.toString();
    if (locationId) {
      await tx.stock.upsert({
        where: { itemId_locationId: { itemId, locationId } },
        create: {
          itemId,
          locationId,
          organizationId: activeOrgId,
          quantity: 1,
        },
        update: { quantity: { increment: 1 } },
      });
    }

    await createAuditLog({
      userId: session.user.id,
      organizationId: activeOrgId,
      action: 'CREATE',
      entityType: 'ASSET',
      entityId: newAsset.id,
      entityInfo: `${newAsset.kode_asset || 'N/A'} - ${itemMaster.name || 'N/A'}`,
      details: { newData: newAsset },
      tx,
    });

    return newAsset;
  });

  revalidatePath('/assets');
  return asset;
}

/* =======================
   UPDATE ASSET
 ======================= */
// LINK updateAsset
export async function updateAsset(id: string, formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  const asset = await prisma.asset.findFirst({
    where: { id, organizationId: activeOrgId },
  });
  if (!asset) throw new Error('Asset not found');

  const memberRole = await auth.api.getActiveMemberRole({
    headers: await headers(),
  });
  const role = memberRole.role as string;
  const isAdminOrOwner = role === 'staff_asset' || role === 'owner';
  const sessionDeptId = session.user.departmentId;

  const formDepartmentId = formData.get('departmentId')?.toString();
  const finalDepartmentId =
    isAdminOrOwner && formDepartmentId ? formDepartmentId : asset.departmentId;

  const parseDateOrNull = (key: string) => {
    const val = formData.get(key)?.toString();
    return val ? new Date(val) : null;
  };
  const parseFloatOrNull = (key: string) => {
    const val = formData.get(key)?.toString();
    return val ? parseFloat(val) : null;
  };

  const removePhoto = formData.get('removePhoto') === 'true';
  const photoFile = formData.get('photo') as File | null;
  let finalPhotoUrl = asset.photoUrl;

  if (removePhoto) {
    if (asset.photoUrl) await deleteS3File(asset.photoUrl);
    finalPhotoUrl = null;
  } else if (photoFile && photoFile.size > 0) {
    if (asset.photoUrl) await deleteS3File(asset.photoUrl);
    finalPhotoUrl = await uploadToS3(photoFile, 'asset-photos');
  }

  const newItemId = formData.get('itemId')?.toString() || asset.itemId;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const newLocationId = formData.get('locationId')?.toString();
      const oldLocationId = asset.locationId;

      let finalKodeAsset = asset.kode_asset;
      let assetGroupId = asset.assetGroupId || null;
      let assetCategoryId = asset.assetCategoryId || null;
      let assetClusterId = asset.assetClusterId || null;
      let assetSubClusterId = asset.assetSubClusterId || null;

      if (newItemId !== asset.itemId) {
        const itemMaster = await tx.item.findUnique({
          where: { id: newItemId },
          include: { category: true },
        });

        if (itemMaster?.category) {
          const prefix = itemMaster.category.code || '';

          if (prefix) {
            const lastAsset = await tx.asset.findFirst({
              where: {
                organizationId: activeOrgId,
                kode_asset: { startsWith: prefix + '.' },
              },
              orderBy: { kode_asset: 'desc' },
            });

            let nextSequence = 1;
            if (lastAsset?.kode_asset) {
              const parts = lastAsset.kode_asset.split('.');
              const lastSeq = Number(parts[parts.length - 1]);
              if (!isNaN(lastSeq)) nextSequence = lastSeq + 1;
            }
            finalKodeAsset = `${prefix}.${String(nextSequence).padStart(4, '0')}`;
          }

          if (
            itemMaster.category.classificationId &&
            itemMaster.category.classificationType
          ) {
            const targetId = itemMaster.category.classificationId;
            const type = itemMaster.category.classificationType;

            assetGroupId = null;
            assetCategoryId = null;
            assetClusterId = null;
            assetSubClusterId = null;

            if (type === 'SUBCLUSTER') {
              const sub = await tx.assetSubCluster.findUnique({
                where: { id: targetId },
                include: { assetCluster: { include: { assetCategory: true } } },
              });
              assetSubClusterId = targetId;
              assetClusterId = sub?.assetClusterId || null;
              assetCategoryId = sub?.assetCluster?.assetCategoryId || null;
              assetGroupId =
                sub?.assetCluster?.assetCategory?.assetGroupId || null;
            } else if (type === 'CLUSTER') {
              const clust = await tx.assetCluster.findUnique({
                where: { id: targetId },
                include: { assetCategory: true },
              });
              assetClusterId = targetId;
              assetCategoryId = clust?.assetCategoryId || null;
              assetGroupId = clust?.assetCategory?.assetGroupId || null;
            } else if (type === 'CATEGORY') {
              const cat = await tx.assetCategory.findUnique({
                where: { id: targetId },
              });
              assetCategoryId = targetId;
              assetGroupId = cat?.assetGroupId || null;
            } else if (type === 'GROUP') {
              assetGroupId = targetId;
            }
          }
        }
      }

      const result = await tx.asset.update({
        where: { id },
        data: {
          itemId: newItemId,
          purchaseDate: formData.has('purchaseDate')
            ? parseDateOrNull('purchaseDate')
            : asset.purchaseDate,
          purchasePrice: formData.has('purchasePrice')
            ? parseFloatOrNull('purchasePrice')
            : asset.purchasePrice,
          condition: formData.has('condition')
            ? formData.get('condition')?.toString() || null
            : asset.condition,
          warrantyExpire: formData.has('warrantyExpire')
            ? parseDateOrNull('warrantyExpire')
            : asset.warrantyExpire,
          brand: formData.has('brand')
            ? formData.get('brand')?.toString() || null
            : asset.brand,
          model: formData.has('model')
            ? formData.get('model')?.toString() || null
            : asset.model,
          partNumber: formData.has('partNumber')
            ? formData.get('partNumber')?.toString() || null
            : asset.partNumber,
          serialNumber: formData.has('serialNumber')
            ? formData.get('serialNumber')?.toString() || null
            : asset.serialNumber,
          document_number: formData.has('document_number')
            ? formData.get('document_number')?.toString() || null
            : asset.document_number,
          no_spb: formData.has('no_spb')
            ? formData.get('no_spb')?.toString() || null
            : asset.no_spb,
          locationId: newLocationId || asset.locationId,
          departmentId: finalDepartmentId,
          notes: formData.has('notes')
            ? formData.get('notes')?.toString() || null
            : asset.notes,
          vendorName: formData.has('vendorName')
            ? formData.get('vendorName')?.toString() || null
            : asset.vendorName,
          garansi_exp: formData.has('garansi_exp')
            ? parseDateOrNull('garansi_exp')
            : asset.garansi_exp,
          photoUrl: finalPhotoUrl,
          updatedAt: new Date(),
          kode_asset: finalKodeAsset,

          assetGroupId,
          assetCategoryId,
          assetClusterId,
          assetSubClusterId,

          ...(newItemId !== asset.itemId && {
            assetSubClusters: {
              set: [],
              ...(assetSubClusterId
                ? { connect: [{ id: assetSubClusterId }] }
                : {}),
            },
          }),
        },
      });

      // INTELEJEN UPSERT/CLEANUP UNTUK APAR & HYDRANT
      const currentItem = await tx.item.findUnique({ where: { id: newItemId } });
      const lowerUnitName = String(currentItem?.name || '').toLowerCase();

      // 1. APAR
      if (
        lowerUnitName.includes('apar') ||
        lowerUnitName.includes('fire extinguisher')
      ) {
        let jenis = formData.get('aparJenis')?.toString() as
          | 'CO2'
          | 'Powder'
          | 'Foam'
          | 'Air'
          | undefined;
        let size = formData.get('aparSize')
          ? parseFloat(formData.get('aparSize') as string)
          : null;

        if (newItemId !== asset.itemId) {
          if (!jenis) {
            jenis = 'Powder';
            if (lowerUnitName.includes('co2')) jenis = 'CO2';
            else if (lowerUnitName.includes('foam')) jenis = 'Foam';
            else if (
              lowerUnitName.includes('air') ||
              lowerUnitName.includes('water')
            )
              jenis = 'Air';
          }
          if (!size || isNaN(size)) {
            const sizeMatch = lowerUnitName.match(
              /(\d+(\.\d+)?)\s*(kg|liter|l)/i,
            );
            size = sizeMatch ? parseFloat(sizeMatch[1]) : 4.5;
          }
        }

        if (jenis && size) {
          await tx.aparDetail.upsert({
            where: { assetId: id },
            create: { assetId: id, organizationId: activeOrgId, jenis, size },
            update: { jenis, size },
          });
        }
      } else {
        await tx.aparDetail.deleteMany({ where: { assetId: id } });
      }

      // 2. HYDRANT
      if (lowerUnitName.includes('hydrant')) {
        let ukuran = formData.get('hydrantUkuran')?.toString();
        if (newItemId !== asset.itemId && !ukuran) {
          const sizeMatch = lowerUnitName.match(
            /(\d+(\.\d+)?)\s*(inch|in|"|cm)/i,
          );
          ukuran = sizeMatch ? `${sizeMatch[1]} ${sizeMatch[3]}` : '1.5 inch';
        }
        if (ukuran) {
          await tx.hydrantDetail.upsert({
            where: { assetId: id },
            create: { assetId: id, organizationId: activeOrgId, ukuran },
            update: { ukuran },
          });
        }
      } else {
        await tx.hydrantDetail.deleteMany({ where: { assetId: id } });
      }

      // Sync Stock
      if (newLocationId && newLocationId !== oldLocationId) {
        if (oldLocationId) {
          await tx.stock.updateMany({
            where: { itemId: asset.itemId, locationId: oldLocationId },
            data: { quantity: { decrement: 1 } },
          });
        }
        await tx.assetHistory.create({
          data: {
            assetId: id,
            organizationId: activeOrgId,
            userId: session.user.id,
            action: 'TRANSFER_LOCATION',
            field: 'locationId',
            oldValue: oldLocationId || 'N/A',
            newValue: newLocationId,
            asset_info: `${result.kode_asset || id} - ${result.itemId}`,
          },
        });
        await tx.stock.upsert({
          where: {
            itemId_locationId: {
              itemId: result.itemId,
              locationId: newLocationId,
            },
          },
          create: {
            itemId: result.itemId,
            locationId: newLocationId,
            organizationId: activeOrgId,
            quantity: 1,
          },
          update: { quantity: { increment: 1 } },
        });
      }

      await createAuditLog({
        userId: session.user.id,
        organizationId: activeOrgId,
        action: 'UPDATE',
        entityType: 'ASSET',
        entityId: id,
        details: { message: 'Asset updated successfully' },
        tx,
      });

      return result;
    });

    revalidatePath('/assets');
    return { success: true, data: updated };

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return {
          success: false,
          error: 'An asset with this serial number already exists in your organization. Please use a unique serial number.'
        };
      }
    }

    console.error('Failed to update asset:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while updating the asset.'
    };
  }
}
/* =======================
   DELETE ASSET
 ======================= */
// LINK deleteAsset
export async function deleteAsset(id: string) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  const asset = await prisma.$transaction(async (tx) => {
    const existing = await tx.asset.findFirst({
      where: { id, organizationId: activeOrgId },
      include: { item: true },
    });
    if (!existing) throw new Error('Asset not found');

    if (existing.photoUrl) {
      await deleteS3File(existing.photoUrl);
    }

    await tx.assetHistory.create({
      data: {
        assetId: null,
        organizationId: activeOrgId,
        userId: session.user.id,
        action: 'DISPOSED',
        field: 'status',
        oldValue: existing.status,
        newValue: 'DELETED',
        asset_info: `[DIHAPUS] ${existing.kode_asset || 'N/A'} - ${existing.item?.name || 'N/A'}`,
      },
    });

    const deleted = await tx.asset.delete({ where: { id } });

    if (existing.locationId && existing.assignedStatus === 'AVAILABLE') {
      await tx.stock.updateMany({
        where: {
          itemId: existing.itemId,
          locationId: existing.locationId,
          organizationId: activeOrgId,
        },
        data: { quantity: { decrement: 1 } },
      });
    }

    await createAuditLog({
      userId: session.user.id,
      organizationId: activeOrgId,
      action: 'DELETE',
      entityType: 'ASSET',
      entityId: deleted.id,
      entityInfo: `${deleted.kode_asset || 'N/A'} - ${deleted.itemId || 'N/A'}`,
      details: { deletedData: deleted },
      tx,
    });

    return deleted;
  });

  revalidatePath('/assets');
  return asset;
}

/* =======================
   GET ASSETS BY MANY IDS
 ======================= */
// LINK getAssetsByManyIds
export async function getAssetsByManyIds(ids: string[]) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  return prisma.asset.findMany({
    where: { id: { in: ids }, organizationId: activeOrgId },
    include: {
      item: { select: { name: true, code: true } },
    },
  });
}

/* =======================
   GET ASSET BY ID
 ======================= */
// LINK getAssetById
export async function getAssetById(id: string) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  try {
    const asset = await prisma.asset.findFirst({
      where: { id, organizationId: activeOrgId },
      include: {
        item: { include: { category: true } },
        location: true,
        department: true,
        aparDetails: true, // 👈 Opsional tapi bagus agar frontend tahu detailnya
        hydrantDetails: true, // 👈 Sama seperti di atas
      },
    });

    if (!asset) return null;

    let assignedUser = null;
    if (asset.assignedUserId) {
      assignedUser = await prisma.user.findUnique({
        where: { id: asset.assignedUserId },
        select: {
          name: true,
          email: true,
          department: { select: { nama_department: true } },
        },
      });
    }

    let assetGroupId = asset.assetGroupId || null;
    let assetCategoryId = asset.assetCategoryId || null;
    let assetClusterId = asset.assetClusterId || null;
    let assetSubClusterId = asset.assetSubClusterId || null;

    if (!assetGroupId && asset.item?.category?.classificationType) {
      const targetId = asset.item.category.classificationId;
      const type = asset.item.category.classificationType;

      if (type === 'SUBCLUSTER' && targetId) {
        const sub = await prisma.assetSubCluster.findUnique({
          where: { id: targetId },
          include: { assetCluster: { include: { assetCategory: true } } },
        });
        assetSubClusterId = targetId;
        assetClusterId = sub?.assetClusterId || null;
        assetCategoryId = sub?.assetCluster?.assetCategoryId || null;
        assetGroupId = sub?.assetCluster?.assetCategory?.assetGroupId || null;
      } else if (type === 'CLUSTER' && targetId) {
        const clust = await prisma.assetCluster.findUnique({
          where: { id: targetId },
          include: { assetCategory: true },
        });
        assetClusterId = targetId;
        assetCategoryId = clust?.assetCategoryId || null;
        assetGroupId = clust?.assetCategory?.assetGroupId || null;
      } else if (type === 'CATEGORY' && targetId) {
        const cat = await prisma.assetCategory.findUnique({
          where: { id: targetId },
        });
        assetCategoryId = targetId;
        assetGroupId = cat?.assetGroupId || null;
      } else if (type === 'GROUP' && targetId) {
        assetGroupId = targetId;
      }
    }

    return {
      ...asset,
      assignedUser,
      assetGroupId,
      assetCategoryId,
      assetClusterId,
      assetSubClusterId,
    };
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch asset');
  }
}

/* =======================
   SCAN ASSET CODE
 ======================= */
// LINK scanAssetCode
export async function scanAssetCode(scannedCode: string) {
  try {
    const session = await getServerSession();
    if (!session) return { success: false, message: 'Unauthorized' };

    const activeOrgId = session.session?.activeOrganizationId;
    if (!activeOrgId)
      return { success: false, message: 'No active organizationId found' };
    if (!scannedCode) return { success: false, message: 'Kode barcode kosong' };

    const asset = await prisma.asset.findFirst({
      where: {
        organizationId: activeOrgId,
        OR: [
          { kode_asset: { equals: scannedCode } },
          { id: { startsWith: scannedCode.toLowerCase() } },
        ],
      },
      select: { id: true },
    });

    if (!asset) {
      return {
        success: false,
        message: 'Asset tidak ditemukan dalam database.',
      };
    }

    return { success: true, data: asset };
  } catch (error: any) {
    console.error('Scan Error:', error);
    return { success: false, message: 'Terjadi kesalahan saat mencari asset' };
  }
}

/* =======================
   EXPORT ASSETS TO PDF
 ======================= */
// LINK exportAssetPDF
export async function exportAssetPDF({
  type,
  dateFrom,
  dateTo,
  organizationId,
}: {
  type: 'all' | 'latest' | 'range';
  dateFrom?: string;
  dateTo?: string;
  organizationId: string;
}) {
  let where: any = { organizationId };

  if (type === 'range' && dateFrom && dateTo) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    where.createdAt = { gte: from, lte: to };
  }

  const assets = await prisma.asset.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: type === 'latest' ? 20 : undefined,
    include: { item: true },
  });

  const fontRegular = path.join(
    process.cwd(),
    'public/fonts/Roboto-Regular.ttf',
  );
  const fontBold = path.join(process.cwd(), 'public/fonts/Roboto-Bold.ttf');

  const doc = new PDFDocument({ font: fontRegular, size: 'A4', margin: 40 });
  const chunks: Uint8Array[] = [];
  doc.on('data', (c) => chunks.push(c));

  return new Promise<string>((resolve) => {
    doc.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer.toString('base64'));
    });

    doc
      .font(fontBold)
      .fontSize(16)
      .text('LAPORAN DATA ASET', { align: 'center' });
    doc.moveDown(0.5);
    doc
      .font(fontRegular)
      .fontSize(10)
      .text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, {
        align: 'center',
      });

    if (dateFrom && dateTo) {
      doc.text(
        `Periode: ${new Date(dateFrom).toLocaleDateString('id-ID')} - ${new Date(dateTo).toLocaleDateString('id-ID')}`,
        { align: 'center' },
      );
    }

    doc.moveDown(1.5);

    const tableTop = doc.y;
    const col = {
      no: 40,
      item: 70,
      brand: 200,
      model: 300,
      serial: 400,
      status: 500,
    };
    const rowHeight = 20;

    doc.font(fontBold).fontSize(10);
    doc.text('No', col.no, tableTop);
    doc.text('Item', col.item, tableTop);
    doc.text('Brand', col.brand, tableTop);
    doc.text('Model', col.model, tableTop);
    doc.text('Serial', col.serial, tableTop);
    doc.text('Status', col.status, tableTop);

    doc
      .moveTo(40, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    let y = tableTop + 20;
    doc.font(fontRegular);

    assets.forEach((a, i) => {
      if (y > 750) {
        doc.addPage();
        y = 50;
      }
      doc.text(String(i + 1), col.no, y);
      doc.text(a.item?.name ?? '-', col.item, y, { width: 120 });
      doc.text(a.brand ?? '-', col.brand, y, { width: 90 });
      doc.text(a.model ?? '-', col.model, y, { width: 90 });
      doc.text(a.serialNumber ?? '-', col.serial, y, { width: 90 });
      doc.text(a.status ?? '-', col.status, y, { width: 60 });

      doc
        .moveTo(40, y + 15)
        .lineTo(550, y + 15)
        .strokeOpacity(0.2)
        .stroke()
        .strokeOpacity(1);
      y += rowHeight;
    });

    doc.moveDown(2);
    doc.fontSize(10).text('Mengetahui,', { align: 'right' });
    doc.moveDown(3);
    doc.text('(_____________________)', { align: 'right' });
    doc.end();
  });
}

/* =======================
   EXPORT ASSETS TO EXCEL
 ======================= */
// LINK exportAssetExcel
export async function exportAssetExcel({
  type,
  dateFrom,
  dateTo,
  organizationId,
}: {
  type: 'all' | 'latest' | 'monthly';
  dateFrom?: Date;
  dateTo?: Date;
  organizationId: string;
}) {
  let where: any = { organizationId };

  if (type === 'latest') {
    where.createdAt = {
      gte: new Date(new Date().setDate(new Date().getDate() - 7)),
    };
  }

  if (type === 'monthly' && dateFrom && dateTo) {
    where.purchaseDate = { gte: dateFrom, lte: dateTo };
  }

  const assets = await prisma.asset.findMany({
    where,
    include: { item: true, location: true, department: true },
    orderBy: { createdAt: 'desc' },
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Assets');

  worksheet.columns = [
    { header: 'No', key: 'no', width: 5 },
    { header: 'Item Name', key: 'item', width: 25 },
    { header: 'Brand', key: 'brand', width: 20 },
    { header: 'Model', key: 'model', width: 20 },
    { header: 'Part Number', key: 'partNumber', width: 20 },
    { header: 'Serial Number', key: 'serialNumber', width: 25 },
    { header: 'Condition', key: 'condition', width: 15 },
    { header: 'Purchase Date', key: 'purchaseDate', width: 20 },
    { header: 'Price', key: 'price', width: 15 },
    { header: 'Location', key: 'location', width: 20 },
    { header: 'Department', key: 'department', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Vendor', key: 'vendor', width: 20 },
  ];

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  assets.forEach((asset, index) => {
    worksheet.addRow({
      no: index + 1,
      item: asset.item?.name || '-',
      brand: asset.brand || '-',
      model: asset.model || '-',
      partNumber: asset.partNumber || '-',
      serialNumber: asset.serialNumber || '-',
      condition: asset.condition || '-',
      purchaseDate: asset.purchaseDate
        ? new Date(asset.purchaseDate).toLocaleDateString()
        : '-',
      price: asset.purchasePrice || 0,
      location: asset.location?.name || '-',
      department: asset.department?.nama_department || '-',
      status: asset.status,
      vendor: asset.vendorName || '-',
    });
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  return await workbook.xlsx.writeBuffer();
}

/* =======================
   ASSIGN ASSET ACTION
 ======================= */
// LINK assignAssetAction
type AssignAssetInput = {
  assetId: string;
  userId: string;
  departmentId: string;
};
export async function assignAssetAction(payload: AssignAssetInput) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');
  const orgId = session.session?.activeOrganizationId;
  if (!orgId) throw new Error('No organization');

  const asset = await prisma.asset.findFirst({
    where: { id: payload.assetId, organizationId: orgId },
    include: { item: true, department: true },
  });

  if (!asset) throw new Error('Asset not found');
  if (asset.assignedStatus === 'ASSIGNED')
    throw new Error('Asset already assigned');

  const oldAssignedUser = asset.assignedUserId;
  const oldDepartment = asset.department?.nama_department ?? null;

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.asset.update({
      where: { id: asset.id },
      data: {
        assignedUserId: payload.userId,
        department: { connect: { id_department: payload.departmentId } },
        assignedStatus: 'ASSIGNED',
        updatedAt: new Date(),
      },
    });

    await tx.assetHistory.create({
      data: {
        assetId: asset.id,
        organizationId: orgId,
        userId: session.user.id,
        action: 'ASSIGN',
        field: 'assignedUserId',
        oldValue: oldAssignedUser,
        newValue: payload.userId,
        asset_info: `${asset.id} - ${asset.item.name}`,
      },
    });

    await tx.assetHistory.create({
      data: {
        assetId: asset.id,
        organizationId: orgId,
        userId: session.user.id,
        action: 'STATUS_CHANGE',
        field: 'assignedStatus',
        oldValue: 'AVAILABLE',
        newValue: 'ASSIGNED',
        asset_info: `${asset.id} - ${asset.item.name}`,
      },
    });

    await tx.assetHistory.create({
      data: {
        assetId: asset.id,
        organizationId: orgId,
        userId: session.user.id,
        action: 'TRANSFER',
        field: 'department',
        oldValue: oldDepartment,
        newValue: payload.departmentId,
        asset_info: `${asset.id} - ${asset.item.name}`,
      },
    });

    return updated;
  });

  await createAuditLog({
    userId: session.user.id,
    organizationId: orgId,
    action: 'ASSIGN',
    entityType: 'ASSET',
    entityId: asset.id,
    entityInfo: `${asset.id}`,
    details: { newData: result },
  });

  revalidatePath('/assets');
  revalidatePath('/assets/items');
  return result;
}

/* =======================
   IMPORT EXCEL ASSET
 ======================= */
// LINK importAssetExcel
export async function importAssetExcel(
  formData: FormData,
  organizationId: string,
) {
  const file = formData.get('file') as File;
  const targetCategoryId = formData.get('categoryId') as string;

  if (!file) throw new Error('File tidak ditemukan');

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
  }) as any[][];

  const startIdx = rows.findIndex((r) =>
    r.some(
      (cell) =>
        String(cell).toLowerCase().includes('unit') ||
        String(cell).toLowerCase().includes('kode asset'),
    ),
  );
  if (startIdx === -1) throw new Error('Format Excel tidak dikenali');

  const headerRow1 = rows[startIdx] || [];
  const headerRow2 = rows[startIdx + 1] || [];
  const maxCols = Math.max(headerRow1.length, headerRow2.length);

  const combinedHeaders: string[] = [];
  let lastMainHeader = '';

  for (let i = 0; i < maxCols; i++) {
    const h1 = headerRow1[i] ? String(headerRow1[i]).trim() : '';
    const h2 = headerRow2[i] ? String(headerRow2[i]).trim() : '';
    if (h1) lastMainHeader = h1;
    combinedHeaders.push(`${lastMainHeader} ${h2}`.trim().toLowerCase());
  }

  const dataRows = rows.slice(startIdx + 2);
  const col = {
    unit: getColumnIndex(combinedHeaders, ASSET_MAPPER.unit),
    model: getColumnIndex(combinedHeaders, ASSET_MAPPER.model),
    kode: getColumnIndex(combinedHeaders, ASSET_MAPPER.kode_asset),
    pic: getColumnIndex(combinedHeaders, ASSET_MAPPER.pic),
    sn: getColumnIndex(combinedHeaders, ASSET_MAPPER.sn),
    lantai: getColumnIndex(combinedHeaders, ASSET_MAPPER.lantai),
    area: getColumnIndex(combinedHeaders, ASSET_MAPPER.area),
    rusak: getColumnIndex(combinedHeaders, ASSET_MAPPER.rusak),
    tgl: getColumnIndex(combinedHeaders, ASSET_MAPPER.tgl_pengadaan),
    kepemilikan: getColumnIndex(combinedHeaders, ASSET_MAPPER.kepemilikan),
  };

  const allDepartments = await prisma.department.findMany({
    where: { organization_id: organizationId, deleted_at: null },
  });

  let targetCategoryData = null;
  if (targetCategoryId) {
    targetCategoryData = await prisma.category.findUnique({
      where: { id: targetCategoryId },
    });
  }

  const results = { success: 0, failed: 0, errors: [] as string[] };

  for (const [index, row] of dataRows.entries()) {
    const unitName = row[col.unit];
    if (!unitName) continue;
    // Simpan variabel kode dan SN di luar transaction agar bisa diakses catch block jika error
    let currentExcelKodeAsset = '';
    let currentSerialNumber = '';
    try {
      await prisma.$transaction(async (tx) => {
        let purchaseDate = null;
        if (col.tgl !== -1 && row[col.tgl]) {
          const tglValue = row[col.tgl];
          if (tglValue instanceof Date) purchaseDate = tglValue;
          else if (typeof tglValue === 'number')
            purchaseDate = new Date(
              Math.round((tglValue - 25569) * 86400 * 1000),
            );
        }

        let locationId = null;
        let locationParts = [];
        if (col.lantai !== -1 && row[col.lantai])
          locationParts.push(String(row[col.lantai]).trim());
        if (col.area !== -1 && row[col.area])
          locationParts.push(String(row[col.area]).trim());

        if (locationParts.length > 0) {
          const locName = locationParts.join(' - ');
          let existingLoc = await tx.location.findFirst({
            where: { name: locName, organizationId },
          });
          if (!existingLoc) {
            existingLoc = await tx.location.create({
              data: { name: locName, organizationId },
            });
          }
          locationId = existingLoc.id;
        }

        let finalNotes =
          col.kepemilikan !== -1 && row[col.kepemilikan]
            ? `Kepemilikan: ${String(row[col.kepemilikan]).trim()}`
            : '';
        let finalDepartmentId = null,
          finalPersonName = null;

        if (col.pic !== -1 && row[col.pic]) {
          const rawPicValue = String(row[col.pic]).trim().toLowerCase();
          const existingDept = allDepartments.find(
            (d) =>
              d.nama_department.toLowerCase().includes(rawPicValue) ||
              d.kode_department.toLowerCase() === rawPicValue,
          );
          if (existingDept) finalDepartmentId = existingDept.id_department;
          else finalPersonName = row[col.pic];
        }

        let condition =
          col.rusak !== -1 &&
          row[col.rusak] &&
          String(row[col.rusak]).trim() !== ''
            ? 'RUSAK'
            : 'BAIK';
        const modelName =
          col.model !== -1 ? String(row[col.model] || '').trim() : '';

        // Deteksi Item Master
        let item = await tx.item.findFirst({
          where: { name: String(unitName), organizationId },
          include: { category: true },
        });

        if (!item) {
          item = await tx.item.create({
            data: {
              name: String(unitName),
              code: `ITM-${Math.random().toString(36).substring(7).toUpperCase()}`,
              assetType: 'FIXED',
              organizationId,
              categoryId: targetCategoryId || null,
            },
            include: { category: true },
          });
          if (targetCategoryData) item.category = targetCategoryData;
        } else if (!item.categoryId && targetCategoryId) {
          await tx.item.update({
            where: { id: item.id },
            data: { categoryId: targetCategoryId },
          });
          item.category = targetCategoryData;
        }

        const activeCategory = item.category || targetCategoryData;

        let excelKodeAsset =
          col.kode !== -1 && row[col.kode]
            ? String(row[col.kode]).trim() || null
            : null;

        if (!excelKodeAsset && activeCategory?.code) {
          const prefix = activeCategory.code;
          const lastAsset = await tx.asset.findFirst({
            where: { organizationId, kode_asset: { startsWith: prefix + '.' } },
            orderBy: { kode_asset: 'desc' },
          });
          let nextSequence = 1;
          if (lastAsset?.kode_asset) {
            const parts = lastAsset.kode_asset.split('.');
            const lastSeq = Number(parts[parts.length - 1]);
            if (!isNaN(lastSeq)) nextSequence = lastSeq + 1;
          }
          excelKodeAsset = `${prefix}.${String(nextSequence).padStart(4, '0')}`;
        }
        currentExcelKodeAsset = excelKodeAsset || '';
        currentSerialNumber =
          col.sn !== -1 && row[col.sn] ? String(row[col.sn]).trim() : '';
        let assetGroupId = null;
        let assetCategoryId = null;
        let assetClusterId = null;
        let assetSubClusterId = null;

        if (
          activeCategory?.classificationId &&
          activeCategory.classificationType
        ) {
          const targetId = activeCategory.classificationId;
          const type = activeCategory.classificationType;

          if (type === 'SUBCLUSTER') {
            const sub = await tx.assetSubCluster.findUnique({
              where: { id: targetId },
              include: { assetCluster: { include: { assetCategory: true } } },
            });
            assetSubClusterId = targetId;
            assetClusterId = sub?.assetClusterId || null;
            assetCategoryId = sub?.assetCluster?.assetCategoryId || null;
            assetGroupId =
              sub?.assetCluster?.assetCategory?.assetGroupId || null;
          } else if (type === 'CLUSTER') {
            const clust = await tx.assetCluster.findUnique({
              where: { id: targetId },
              include: { assetCategory: true },
            });
            assetClusterId = targetId;
            assetCategoryId = clust?.assetCategoryId || null;
            assetGroupId = clust?.assetCategory?.assetGroupId || null;
          } else if (type === 'CATEGORY') {
            const cat = await tx.assetCategory.findUnique({
              where: { id: targetId },
            });
            assetCategoryId = targetId;
            assetGroupId = cat?.assetGroupId || null;
          } else if (type === 'GROUP') {
            assetGroupId = targetId;
          }
        }

        // 👇 INTELEJEN DETEKSI DETAIL APAR & HYDRANT 👇
        const lowerUnitName = String(unitName).toLowerCase();

        let aparData = null;
        if (
          lowerUnitName.includes('apar') ||
          lowerUnitName.includes('fire extinguisher')
        ) {
          let jenis: 'CO2' | 'Powder' | 'Foam' | 'Air' = 'Powder'; // Default fallback
          if (lowerUnitName.includes('co2')) jenis = 'CO2';
          else if (lowerUnitName.includes('foam')) jenis = 'Foam';
          else if (
            lowerUnitName.includes('air') ||
            lowerUnitName.includes('water')
          )
            jenis = 'Air';

          // Coba ekstrak berat (angka) dari teks, fallback ke 4.5kg jika tidak ada
          const sizeMatch = lowerUnitName.match(
            /(\d+(\.\d+)?)\s*(kg|liter|l)/i,
          );
          const size = sizeMatch ? parseFloat(sizeMatch[1]) : 4.5;

          aparData = { jenis, size, organizationId };
        }

        let hydrantData = null;
        if (lowerUnitName.includes('hydrant')) {
          // Ekstrak string ukuran (misal 1.5 inch atau 2.5 inch)
          const sizeMatch = lowerUnitName.match(
            /(\d+(\.\d+)?)\s*(inch|in|"|cm)/i,
          );
          const ukuran = sizeMatch
            ? `${sizeMatch[1]} ${sizeMatch[3]}`
            : '1.5 inch';

          hydrantData = { ukuran, organizationId };
        }
        // 👆 SELESAI DETEKSI 👆

        await tx.asset.create({
          data: {
            itemId: item.id,
            organizationId,
            kode_asset: excelKodeAsset,
            serialNumber: currentSerialNumber || null,
            model: modelName,
            departmentId: finalDepartmentId,
            PIC: finalPersonName,
            condition: condition,
            locationId: locationId,
            status: 'ACTIVE',
            purchaseDate: purchaseDate,
            notes: finalNotes || null,

            assetGroupId,
            assetCategoryId,
            assetClusterId,
            assetSubClusterId,

            ...(assetSubClusterId && {
              assetSubClusters: { connect: [{ id: assetSubClusterId }] },
            }),

            // 👇 BUNGKUS KE DALAM NESTED WRITE PRISMA JIKA DETEKSI POSITIF 👇
            ...(aparData && {
              aparDetails: {
                create: {
                  jenis: aparData.jenis,
                  // WAJIB: Gunakan Prisma.Decimal dan sertakan organizationId
                  size: new Prisma.Decimal(aparData.size || 0),
                },
              },
            }),

            ...(hydrantData && {
              hydrantDetails: {
                create: {
                  ukuran: hydrantData.ukuran,
                },
              },
            }),
          },
        });
      });
      results.success++;
    } catch (err: any) {
      results.failed++;
      const barisKe = index + startIdx + 3;

      // 👇 IMPLEMENTASI VALIDASI ERROR PRISMA 👇
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          const target = err.meta?.target as string[];

          if (target?.includes('kode_asset')) {
            results.errors.push(
              `Baris ${barisKe} (${unitName}): Gagal, Kode Asset "${currentExcelKodeAsset}" sudah terdaftar.`,
            );
          } else if (target?.includes('serialNumber')) {
            results.errors.push(
              `Baris ${barisKe} (${unitName}): Gagal, Serial Number "${currentSerialNumber}" sudah digunakan di organisasi ini.`,
            );
          } else {
            results.errors.push(
              `Baris ${barisKe} (${unitName}): Gagal disimpan karena ada duplikasi data unik pada kolom target: ${target?.join(', ')}.`,
            );
          }
          continue; // Lanjut ke baris Excel berikutnya
        }
      }

      // Fallback jika error bukan masalah duplikasi (misal: timeout, disconnect, tipe data salah)
      console.error(`Error Import Excel Baris ${barisKe}:`, err); // Tetap log ke server console untuk debugging developer
      results.errors.push(
        `Baris ${barisKe} (${unitName}): Gagal memproses data karena kesalahan sistem.`,
      );
    }
  }

  revalidatePath('/assets');
  return results;
}

/* =======================
   MULTI DELETE ASSET
 ======================= */
// LINK deleteManyAsset
export async function deleteManyAsset(ids: string[]) {
  const session = await getServerSession();
  if (!session) return { success: false, message: 'Unauthorized' };
  const organizationId = session.session.activeOrganizationId;
  if (!organizationId)
    return { success: false, message: 'No active organizationId found' };
  try {
    const deletedAsset = await prisma.asset.deleteMany({
      where: { id: { in: ids }, organizationId },
    });
    revalidatePath('/assets');
    return deletedAsset;
  } catch (error) {
    console.error('Error:', error);
    return { success: false, message: 'Failed' };
  }
}

/* =======================
   EXPORT BARCODE IMAGES TO PDF
 ======================= */
// LINK exportBarcodeToPDF
export async function exportBarcodeToPDF(assets: AssetWithItem[]) {
  try {
    const session = await getServerSession();
    if (!assets || assets.length === 0) throw new Error('Tidak ada asset');
    if (!session || !session.session?.activeOrganizationId)
      return { success: false, message: 'Unauthorized' };

    const pdfBuffer = await new Promise<Buffer>(async (resolve, reject) => {
      try {
        const fontRegular = path.join(
          process.cwd(),
          'public/fonts/Roboto-Regular.ttf',
        );
        const fontBold = path.join(
          process.cwd(),
          'public/fonts/Roboto-Bold.ttf',
        );

        const doc = new PDFDocument({
          size: 'A4',
          margin: 40,
          font: fontRegular,
        });
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        const startX = 25,
          startY = 30,
          maxCols = 3;
        const colWidth = 180,
          rowHeight = 90,
          boxWidth = 170,
          boxHeight = 75;
        let currentItemOnPage = 0;

        for (let i = 0; i < assets.length; i++) {
          const asset = assets[i];
          let col = currentItemOnPage % maxCols;
          let row = Math.floor(currentItemOnPage / maxCols);
          let x = startX + col * colWidth,
            y = startY + row * rowHeight;

          if (y + rowHeight > doc.page.height - 25) {
            doc.addPage();
            currentItemOnPage = 0;
            col = 0;
            row = 0;
            x = startX;
            y = startY;
          }

          const assetCode =
            asset.kode_asset || asset.id.split('-')[0].toUpperCase();
          const itemName = asset.item?.name || 'Unknown Item';
          const deptName =
            (asset as any).department?.name?.substring(0, 3) || 'Eng';

          doc
            .lineWidth(0.5)
            .strokeColor('#a1a1aa')
            .dash(3, { space: 3 })
            .rect(x, y, boxWidth, boxHeight)
            .stroke()
            .undash();
          doc
            .fillColor('#64748b')
            .fontSize(9)
            .text(deptName, x + 5, y + 5, { width: 50, align: 'left' });
          doc.text(assetCode, x + boxWidth - 105, y + 5, {
            width: 100,
            align: 'right',
          });

          const barcodeBuffer = await bwipjs.toBuffer({
            bcid: 'code128',
            text: assetCode,
            scale: 3,
            height: 15,
            includetext: false,
          });

          doc.image(barcodeBuffer, x + 5, y + 18, {
            width: boxWidth - 10,
            height: 35,
          });
          doc
            .fillColor('#1f2937')
            .font(fontBold)
            .fontSize(10)
            .text(itemName, x + 5, y + 58, {
              width: boxWidth - 10,
              align: 'center',
              lineBreak: false,
            });
          doc.font(fontRegular);
          currentItemOnPage++;
        }
        doc.end();
      } catch (err) {
        reject(err);
      }
    });

    return { success: true, data: pdfBuffer.toString('base64') };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
