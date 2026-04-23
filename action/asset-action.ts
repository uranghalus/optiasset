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
import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import { buildAssetFilter } from '@/lib/filter';

// Helper function to save uploaded file
async function saveUploadedFile(file: File): Promise<string | null> {
  if (!file) return null;

  // Generate unique filename
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = path.extname(file.name);
  const filename = `${timestamp}-${random}${extension}`;

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Save file to public/uploads
  const filePath = path.join(uploadsDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return filename;
}

/* =======================
   TYPES
 ======================= */
export type AssetArgs = {
  page: number;
  pageSize: number;

  departmentId?: string[]; // ✅ SAMAKAN DENGAN FRONTEND
  condition?: string[];

  organizationId?: string; // optional karena diambil dari session
};

/* =======================
   GET ALL ASSETS
 ======================= */
export async function getAllAssets({
  page,
  pageSize,
  departmentId,
  condition,
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
    filterDepartmentId: departmentId, // ✅ sekarang sudah array
    condition,
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
export async function getItemsForSelect() {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) return [];

  return prisma.item.findMany({
    where: { organizationId: activeOrgId },
    select: { id: true, name: true, code: true, assetType: true },
    orderBy: { name: 'asc' },
  });
}

/* =======================
   GET LOCATIONS FOR SELECT
 ======================= */
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
   GET DEPARTMENTS FOR ASSET SELECT
 ======================= */
export async function getDepartmentsForAssetSelect() {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) return [];

  return prisma.department.findMany({
    where: { organization_id: activeOrgId, deleted_at: null },
    select: {
      id_department: true,
      nama_department: true,
      kode_department: true,
    },
    orderBy: { nama_department: 'asc' },
  });
}

/* =======================
   GET ASSETS FOR LOAN SELECT
   ======================= */
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

  if (departmentId) where.departmentId = departmentId;
  if (divisiId) where.divisiId = divisiId;

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
   CREATE ASSET
 ======================= */
export async function createAsset(formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');
  const departmentId = session.user.departmentId;
  if (!departmentId) throw new Error('User has no department');
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

  // Handle file upload
  const photoFile = formData.get('photo') as File | null;
  const photoUrl = photoFile ? await saveUploadedFile(photoFile) : null;

  const asset = await prisma.$transaction(async (tx) => {
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
        departmentId: departmentId,
        notes: formData.get('notes')?.toString() || null,
        kode_asset: formData.get('kode_asset')?.toString() || null,
        vendorName: formData.get('vendorName')?.toString() || null,
        garansi_exp: parseDateOrNull('garansi_exp'),
        photoUrl,
      },
    });

    // Sync to Stock table if location is provided
    const locationId = formData.get('locationId')?.toString();
    if (locationId) {
      await tx.stock.upsert({
        where: {
          itemId_locationId: {
            itemId,
            locationId,
          },
        },
        create: {
          itemId,
          locationId,
          organizationId: activeOrgId,
          quantity: 1,
        },
        update: {
          quantity: { increment: 1 },
        },
      });
    }

    // Record Audit Log
    await createAuditLog({
      userId: session.user.id,
      organizationId: activeOrgId,
      action: 'CREATE',
      entityType: 'ASSET',
      entityId: newAsset.id,
      entityInfo: `${newAsset.kode_asset || 'N/A'} - ${newAsset.itemId || 'N/A'}`,
      details: {
        newData: newAsset,
      },
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
export async function updateAsset(id: string, formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  const asset = await prisma.asset.findFirst({
    where: { id, organizationId: activeOrgId },
  });
  if (!asset) throw new Error('Asset not found');
  const departmentId = session.user.departmentId;
  if (!departmentId) throw new Error('User has no department');
  const parseDateOrNull = (key: string) => {
    const val = formData.get(key)?.toString();
    return val ? new Date(val) : null;
  };

  const parseFloatOrNull = (key: string) => {
    const val = formData.get(key)?.toString();
    return val ? parseFloat(val) : null;
  };

  // Handle file upload
  const photoFile = formData.get('photo') as File | null;
  const photoUrl = photoFile
    ? await saveUploadedFile(photoFile)
    : asset.photoUrl;

  const updated = await prisma.$transaction(async (tx) => {
    const newLocationId = formData.get('locationId')?.toString();
    const oldLocationId = asset.locationId;

    const result = await tx.asset.update({
      where: { id },
      data: {
        itemId: formData.get('itemId')?.toString() ?? asset.itemId,
        purchaseDate: parseDateOrNull('purchaseDate') ?? asset.purchaseDate,
        purchasePrice: parseFloatOrNull('purchasePrice') ?? asset.purchasePrice,
        condition: formData.get('condition')?.toString() || asset.condition,
        warrantyExpire:
          parseDateOrNull('warrantyExpire') ?? asset.warrantyExpire,
        brand: formData.get('brand')?.toString() || asset.brand,
        model: formData.get('model')?.toString() || asset.model,
        partNumber: formData.get('partNumber')?.toString() || asset.partNumber,
        locationId: newLocationId || asset.locationId,
        departmentId: departmentId,
        notes: formData.get('notes')?.toString() || asset.notes,
        kode_asset: formData.get('kode_asset')?.toString() || asset.kode_asset,
        vendorName: formData.get('vendorName')?.toString() || asset.vendorName,
        garansi_exp: parseDateOrNull('garansi_exp') ?? asset.garansi_exp,
        photoUrl,
        updatedAt: new Date(),
      },
    });

    // Handle Stock sync if location changed
    if (newLocationId && newLocationId !== oldLocationId) {
      // 1. Decrement old location
      if (oldLocationId) {
        await tx.stock.updateMany({
          where: {
            itemId: asset.itemId,
            locationId: oldLocationId,
          },
          data: { quantity: { decrement: 1 } },
        });
      }

      // 2. Increment new location
      await tx.stock.upsert({
        where: {
          itemId_locationId: {
            itemId: asset.itemId,
            locationId: newLocationId,
          },
        },
        create: {
          itemId: asset.itemId,
          locationId: newLocationId,
          organizationId: activeOrgId,
          quantity: 1,
        },
        update: {
          quantity: { increment: 1 },
        },
      });
    }

    // Record Audit Log (Check for location change specifically)
    if (newLocationId && newLocationId !== oldLocationId) {
      await createAuditLog({
        userId: session.user.id,
        organizationId: activeOrgId,
        action: 'TRANSFER',
        entityType: 'ASSET',
        entityId: id,
        details: {
          field: 'locationId',
          oldValue: oldLocationId || 'N/A',
          newValue: newLocationId,
        },
        tx,
      });
    }

    await createAuditLog({
      userId: session.user.id,
      organizationId: activeOrgId,
      action: 'UPDATE',
      entityType: 'ASSET',
      entityId: id,
      details: {
        message: 'Asset updated',
      },
      tx,
    });

    return result;
  });
  revalidatePath('/assets');
  return updated;
}

/* =======================
   GET ASSETS BY MANY IDS
 ======================= */
export async function getAssetsByManyIds(ids: string[]) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  const assets = await prisma.asset.findMany({
    where: {
      id: { in: ids },
      organizationId: activeOrgId,
    },
    include: {
      item: {
        select: {
          name: true,
          code: true,
        },
      },
    },
  });
  return assets;
}

/* =======================
   GET ASSET BY ID (for detail page)
 ======================= */
export async function getAssetById(id: string) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');
  try {
    const asset = await prisma.asset.findFirst({
      where: {
        id,
        organizationId: activeOrgId, // 🔐 penting (multi-tenant)
      },
      include: {
        item: true,
        location: true,
        department: true,
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
          department: {
            select: { nama_department: true }
          }
        },
      });
    }

    return { ...asset, assignedUser };
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch asset');
  }
}

/* =======================
   DELETE ASSET
 ======================= */
export async function deleteAsset(id: string) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error('No active organizationId found');

  const asset = await prisma.$transaction(async (tx) => {
    // Check if asset exists in this organization
    const existing = await tx.asset.findFirst({
      where: { id, organizationId: activeOrgId },
    });
    if (!existing) throw new Error('Asset not found');

    // Delete photo file from server
    if (existing.photoUrl) {
      const photoPath = path.join(
        process.cwd(),
        'public',
        'uploads',
        existing.photoUrl,
      );
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    const deleted = await tx.asset.delete({ where: { id } });

    // Sync to Stock
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

    // Record History (Note: the asset is about to be deleted, so we record it before or use a non-cascade approach)
    // But since we are in a transaction and deletion is happening, we can still record history if it doesn't violate FK
    // However, the history table HAS onDelete: Cascade, so it will be deleted too!
    // If the user wants to KEEP history even after asset is deleted, we should change schema.
    // For now, let's keep it consistent with Cascade.

    await createAuditLog({
      userId: session.user.id,
      organizationId: activeOrgId,
      action: 'DELETE',
      entityType: 'ASSET',
      entityId: deleted.id,
      entityInfo: `${deleted.kode_asset || 'N/A'} - ${deleted.itemId || 'N/A'}`,
      details: {
        deletedData: deleted,
      },
      tx,
    });

    return deleted;
  });
  revalidatePath('/assets');
  return asset;
}

/* =======================
   GET ASSETS FOR PRINT
 ======================= */

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

    where.createdAt = {
      gte: from,
      lte: to,
    };
  }

  const assets = await prisma.asset.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: type === 'latest' ? 20 : undefined,
    include: {
      item: true,
    },
  });

  const fontRegular = path.join(
    process.cwd(),
    'public/fonts/Roboto-Regular.ttf',
  );
  const fontBold = path.join(process.cwd(), 'public/fonts/Roboto-Bold.ttf');

  const doc = new PDFDocument({
    font: fontRegular,
    size: 'A4',
    margin: 40,
  });
  const chunks: Uint8Array[] = [];
  doc.on('data', (c) => chunks.push(c));

  return new Promise<string>((resolve) => {
    doc.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer.toString('base64'));
    });

    // ================= HEADER =================
    doc.font(fontBold).fontSize(16).text('LAPORAN DATA ASET', {
      align: 'center',
    });

    doc.moveDown(0.5);

    doc
      .font(fontRegular)
      .fontSize(10)
      .text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, {
        align: 'center',
      });

    if (dateFrom && dateTo) {
      doc.text(
        `Periode: ${new Date(dateFrom).toLocaleDateString(
          'id-ID',
        )} - ${new Date(dateTo).toLocaleDateString('id-ID')}`,
        { align: 'center' },
      );
    }

    doc.moveDown(1.5);

    // ================= TABLE =================

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

    // HEADER TABLE
    doc.font(fontBold).fontSize(10);

    doc.text('No', col.no, tableTop);
    doc.text('Item', col.item, tableTop);
    doc.text('Brand', col.brand, tableTop);
    doc.text('Model', col.model, tableTop);
    doc.text('Serial', col.serial, tableTop);
    doc.text('Status', col.status, tableTop);

    // garis bawah header
    doc
      .moveTo(40, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    let y = tableTop + 20;

    doc.font(fontRegular);

    assets.forEach((a, i) => {
      // PAGE BREAK
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

      // garis row
      doc
        .moveTo(40, y + 15)
        .lineTo(550, y + 15)
        .strokeOpacity(0.2)
        .stroke()
        .strokeOpacity(1);

      y += rowHeight;
    });

    // ================= FOOTER =================
    doc.moveDown(2);

    doc.fontSize(10).text('Mengetahui,', { align: 'right' });
    doc.moveDown(3);
    doc.text('(_____________________)', { align: 'right' });

    doc.end();
  });
}
type ExportType = 'all' | 'latest' | 'monthly';
// LINK export excel
export async function exportAssetExcel({
  type,
  dateFrom,
  dateTo,
  organizationId,
}: {
  type: ExportType;
  dateFrom?: Date;
  dateTo?: Date;
  organizationId: string;
}) {
  let where: any = {
    organizationId,
  };

  // ✅ FILTER LOGIC
  if (type === 'latest') {
    where.createdAt = {
      gte: new Date(new Date().setDate(new Date().getDate() - 7)), // 7 hari terakhir
    };
  }

  if (type === 'monthly' && dateFrom && dateTo) {
    where.purchaseDate = {
      gte: dateFrom,
      lte: dateTo,
    };
  }

  const assets = await prisma.asset.findMany({
    where,
    include: {
      item: true,
      location: true,
      department: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // ✅ CREATE EXCEL
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Assets');

  // HEADER
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

  // STYLE HEADER
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

  // DATA
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

  // AUTO BORDER DATA
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

  // BUFFER
  const buffer = await workbook.xlsx.writeBuffer();

  return buffer;
}

type AssignAssetInput = {
  assetId: string;
  userId: string;
  departmentId: string;
};

export async function assignAssetAction(payload: AssignAssetInput) {
  const session = await getServerSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  const orgId = session.session?.activeOrganizationId;

  if (!orgId) {
    throw new Error('No organization');
  }

  const asset = await prisma.asset.findFirst({
    where: {
      id: payload.assetId,
      organizationId: orgId,
    },
    include: {
      item: true,
      department: true,
    },
  });

  if (!asset) {
    throw new Error('Asset not found');
  }

  if (asset.assignedStatus === 'ASSIGNED') {
    throw new Error('Asset already assigned');
  }

  const oldAssignedUser = asset.assignedUserId;

  const oldDepartment = asset.department?.nama_department ?? null;

  // transaction biar aman
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.asset.update({
      where: {
        id: asset.id,
      },

      data: {
        assignedUserId: payload.userId,

        department: {
          connect: {
            id_department: payload.departmentId,
          },
        },

        assignedStatus: 'ASSIGNED',

        updatedAt: new Date(),
      },
    });

    // history 1:
    // assigned user berubah
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

    // history 2:
    // status berubah
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

    // history 3:
    // department berubah
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
    details: {
      newData: result,
    },
  });

  revalidatePath('/assets');
  revalidatePath('/assets/items');

  return result;
}
