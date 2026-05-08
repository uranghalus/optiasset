/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import PDFDocument from "pdfkit";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/logger";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import fs from "fs";
import path, { parse } from "path";
import ExcelJS from "exceljs";
import { buildAssetFilter } from "@/lib/filter";
import * as XLSX from "xlsx";
import { getColumnIndex, ASSET_MAPPER } from "@/lib/excel-mapper";
import { BanUserInput, banUserSchema } from "@/schema/user-schema";
import { deleteS3File, uploadToS3 } from "@/lib/s3-utils";
// Helper function to save uploaded file

/* =======================
   TYPES
 ======================= */
export type AssetArgs = {
  page: number;
  pageSize: number;

  departmentId?: string[]; // ✅ SAMAKAN DENGAN FRONTEND
  condition?: string[];
  search?: string;
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
  search,
}: AssetArgs) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const roleRes = await auth.api.getActiveMemberRole({
    headers: await headers(),
  });

  const role = roleRes?.role;

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organizationId found");

  const where = buildAssetFilter({
    role,
    userDepartmentId: session.user.departmentId,
    filterDepartmentId: departmentId, // ✅ sekarang sudah array
    condition,
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
      orderBy: { createdAt: "desc" },

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
        assetSubClusters: {
          include: {
            assetCluster: {
              include: {
                assetCategory: {
                  include: {
                    assetGroup: true,
                  },
                },
              },
            },
          },
        },
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
  if (!session) throw new Error("Unauthorized");
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) return [];

  return prisma.item.findMany({
    where: { organizationId: activeOrgId },
    select: { id: true, name: true, code: true, assetType: true },
    orderBy: { name: "asc" },
  });
}

/* =======================
   GET LOCATIONS FOR SELECT
 ======================= */
export async function getLocationsForSelect() {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  const activeOrgId = session.session?.activeOrganizationId;

  if (!activeOrgId) return [];

  return prisma.location.findMany({
    where: { organizationId: activeOrgId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
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
  if (!session) throw new Error("Unauthorized");

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organizationId found");

  const where: any = {
    organizationId: activeOrgId,
    status: { in: ["ACTIVE", "GOOD"] },
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
    orderBy: { item: { name: "asc" } },
  });
}

/* =======================
  // LINK CREATE ASSET
 ======================= */
export async function createAsset(formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const memberRole = await auth.api.getActiveMemberRole({
    headers: await headers(),
  });

  const role = memberRole.role as string;
  const sessionDeptId = session.user.departmentId;
  if (!sessionDeptId) throw new Error("User has no department");

  const itemId = formData.get("itemId")?.toString();
  if (!itemId) throw new Error("Item is required");

  const parseDateOrNull = (key: string) => {
    const val = formData.get(key)?.toString();
    return val ? new Date(val) : null;
  };

  const parseFloatOrNull = (key: string) => {
    const val = formData.get(key)?.toString();
    return val ? parseFloat(val) : null;
  };

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organizationId found");

  // --- INTEGRASI S3 MULAI DI SINI ---
  const photoFile = formData.get("photo") as File | null;
  let photoUrl = null;

  // Cek apakah file ada dan ukurannya lebih dari 0 (bukan file kosong)
  if (photoFile && photoFile.size > 0) {
    // Kita simpan Key S3 ke variabel photoUrl
    photoUrl = await uploadToS3(photoFile, "asset-photos");
  }
  // --- INTEGRASI S3 SELESAI ---

  const formDepartmentId = formData.get("departmentId")?.toString();
  const isAdminOrOwner = role === "staff_asset" || role === "owner";
  const finalDepartmentId =
    isAdminOrOwner && formDepartmentId ? formDepartmentId : sessionDeptId;

  const assetSubClusterId = formData
    .get("assetSubClusterId")
    ?.toString()
    .trim();

  const asset = await prisma.$transaction(async (tx) => {
    const newAsset = await tx.asset.create({
      data: {
        itemId,
        organizationId: activeOrgId,
        purchaseDate: parseDateOrNull("purchaseDate"),
        purchasePrice: parseFloatOrNull("purchasePrice"),
        condition: formData.get("condition")?.toString() || null,
        warrantyExpire: parseDateOrNull("warrantyExpire"),
        locationId: formData.get("locationId")?.toString() || null,
        brand: formData.get("brand")?.toString() || null,
        model: formData.get("model")?.toString() || null,
        partNumber: formData.get("partNumber")?.toString() || null,
        serialNumber: formData.get("serialNumber")?.toString() || null,
        document_number: formData.get("document_number")?.toString() || null,
        no_spb: formData.get("no_spb")?.toString() || null,
        departmentId: finalDepartmentId,
        notes: formData.get("notes")?.toString() || null,
        kode_asset: formData.get("kode_asset")?.toString() || null,
        vendorName: formData.get("vendorName")?.toString() || null,
        ...(assetSubClusterId && {
          assetSubClusters: {
            connect: [{ id: assetSubClusterId }],
          },
        }),
        garansi_exp: parseDateOrNull("garansi_exp"),
        photoUrl, // Key S3 disimpan di sini
      },
    });

    const locationId = formData.get("locationId")?.toString();
    if (locationId) {
      await tx.stock.upsert({
        where: {
          itemId_locationId: { itemId, locationId },
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

    await createAuditLog({
      userId: session.user.id,
      organizationId: activeOrgId,
      action: "CREATE",
      entityType: "ASSET",
      entityId: newAsset.id,
      entityInfo: `${newAsset.kode_asset || "N/A"} - ${newAsset.itemId || "N/A"}`,
      details: { newData: newAsset },
      tx,
    });

    return newAsset;
  });

  revalidatePath("/assets");
  return asset;
}
/* =======================
  //  LINK UPDATE ASSET
 ======================= */
export async function updateAsset(id: string, formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organizationId found");

  const asset = await prisma.asset.findFirst({
    where: { id, organizationId: activeOrgId },
  });
  if (!asset) throw new Error("Asset not found");

  const memberRole = await auth.api.getActiveMemberRole({
    headers: await headers(),
  });
  const role = memberRole.role as string;
  const isAdminOrOwner = role === "staff_asset" || role === "owner";

  const sessionDeptId = session.user.departmentId;
  if (!sessionDeptId) throw new Error("User has no department");

  const formDepartmentId = formData.get("departmentId")?.toString();
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

  // --- LOGIKA FOTO (HAPUS & UPDATE) ---
  const removePhoto = formData.get("removePhoto") === "true";
  const photoFile = formData.get("photo") as File | null;
  const isPhotoValid = photoFile && photoFile.size > 0;

  let finalPhotoUrl = asset.photoUrl;

  if (removePhoto) {
    // 1. Jika user mencentang hapus foto
    if (asset.photoUrl) await deleteS3File(asset.photoUrl);
    finalPhotoUrl = null;
  } else if (isPhotoValid) {
    // 2. Jika user mengunggah foto baru
    // Hapus foto lama dulu jika ada
    if (asset.photoUrl) await deleteS3File(asset.photoUrl);
    // Upload foto baru
    finalPhotoUrl = await uploadToS3(photoFile, "asset-photos");
  }
  // ------------------------------------

  const assetSubClusterId = formData.get("assetSubClusterId")?.toString();
  const subClusterUpdateObj = formData.has("assetSubClusterId")
    ? {
        assetSubClusters: {
          set: [],
          ...(assetSubClusterId
            ? { connect: [{ id: assetSubClusterId }] }
            : {}),
        },
      }
    : {};

  const updated = await prisma.$transaction(async (tx) => {
    const newLocationId = formData.get("locationId")?.toString();
    const oldLocationId = asset.locationId;

    const result = await tx.asset.update({
      where: { id },
      data: {
        itemId: formData.get("itemId")?.toString() ?? asset.itemId,
        purchaseDate: formData.has("purchaseDate")
          ? parseDateOrNull("purchaseDate")
          : asset.purchaseDate,
        purchasePrice: formData.has("purchasePrice")
          ? parseFloatOrNull("purchasePrice")
          : asset.purchasePrice,
        condition: formData.has("condition")
          ? formData.get("condition")?.toString() || null
          : asset.condition,
        warrantyExpire: formData.has("warrantyExpire")
          ? parseDateOrNull("warrantyExpire")
          : asset.warrantyExpire,
        brand: formData.has("brand")
          ? formData.get("brand")?.toString() || null
          : asset.brand,
        model: formData.has("model")
          ? formData.get("model")?.toString() || null
          : asset.model,
        partNumber: formData.has("partNumber")
          ? formData.get("partNumber")?.toString() || null
          : asset.partNumber,
        serialNumber: formData.has("serialNumber")
          ? formData.get("serialNumber")?.toString() || null
          : asset.serialNumber,
        document_number: formData.has("document_number")
          ? formData.get("document_number")?.toString() || null
          : asset.document_number,
        no_spb: formData.has("no_spb")
          ? formData.get("no_spb")?.toString() || null
          : asset.no_spb,
        locationId: newLocationId || asset.locationId,
        departmentId: finalDepartmentId,
        notes: formData.has("notes")
          ? formData.get("notes")?.toString() || null
          : asset.notes,
        kode_asset: formData.has("kode_asset")
          ? formData.get("kode_asset")?.toString() || null
          : asset.kode_asset,
        vendorName: formData.has("vendorName")
          ? formData.get("vendorName")?.toString() || null
          : asset.vendorName,
        garansi_exp: formData.has("garansi_exp")
          ? parseDateOrNull("garansi_exp")
          : asset.garansi_exp,
        photoUrl: finalPhotoUrl, // Simpan key baru atau null
        updatedAt: new Date(),
        ...subClusterUpdateObj,
      },
    });

    // Handle Stock sync if location changed
    if (newLocationId && newLocationId !== oldLocationId) {
      if (oldLocationId) {
        await tx.stock.updateMany({
          where: {
            itemId: asset.itemId,
            locationId: oldLocationId,
          },
          data: { quantity: { decrement: 1 } },
        });
      }
      await tx.assetHistory.create({
        data: {
          assetId: id,
          organizationId: activeOrgId,
          userId: session.user.id,
          action: "TRANSFER_LOCATION", // Penanda pergerakan
          field: "locationId",
          oldValue: oldLocationId || "N/A",
          newValue: newLocationId,
          asset_info: `${asset.kode_asset || id} - ${asset.itemId}`,
        },
      });
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

      // Record Audit Log untuk Transfer
      await createAuditLog({
        userId: session.user.id,
        organizationId: activeOrgId,
        action: "TRANSFER",
        entityType: "ASSET",
        entityId: id,
        details: {
          field: "locationId",
          oldValue: oldLocationId || "N/A",
          newValue: newLocationId,
        },
        tx,
      });
    }

    await createAuditLog({
      userId: session.user.id,
      organizationId: activeOrgId,
      action: "UPDATE",
      entityType: "ASSET",
      entityId: id,
      details: {
        message: "Asset updated",
      },
      tx,
    });

    return result;
  });

  revalidatePath("/assets");
  return updated;
}
/* =======================
  // LINK DELETE ASSET
 ======================= */
export async function deleteAsset(id: string) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organizationId found");

  const asset = await prisma.$transaction(async (tx) => {
    // 1. Cek apakah aset ada
    const existing = await tx.asset.findFirst({
      where: { id, organizationId: activeOrgId },
      include: { item: true },
    });
    if (!existing) throw new Error("Asset not found");

    // 2. HAPUS FOTO DARI S3
    // Kita lakukan ini sebelum menghapus record di database
    if (existing.photoUrl) {
      await deleteS3File(existing.photoUrl);
    }

    // 3. Catat Asset History (assetId diset null agar tidak hilang saat didelete)
    await tx.assetHistory.create({
      data: {
        assetId: null,
        organizationId: activeOrgId,
        userId: session.user.id,
        action: "DISPOSED",
        field: "status",
        oldValue: existing.status,
        newValue: "DELETED",
        asset_info: `[DIHAPUS] ${existing.kode_asset || "N/A"} - ${existing.item?.name || "N/A"}`,
      },
    });

    // 4. Hapus Aset dari Database
    const deleted = await tx.asset.delete({ where: { id } });

    // 5. Sync ke Stock (Kurangi stok karena barang dihapus)
    if (existing.locationId && existing.assignedStatus === "AVAILABLE") {
      await tx.stock.updateMany({
        where: {
          itemId: existing.itemId,
          locationId: existing.locationId,
          organizationId: activeOrgId,
        },
        data: { quantity: { decrement: 1 } },
      });
    }

    // 6. Record Audit Log
    await createAuditLog({
      userId: session.user.id,
      organizationId: activeOrgId,
      action: "DELETE",
      entityType: "ASSET",
      entityId: deleted.id,
      entityInfo: `${deleted.kode_asset || "N/A"} - ${deleted.itemId || "N/A"}`,
      details: {
        deletedData: deleted,
      },
      tx,
    });

    return deleted;
  });

  revalidatePath("/assets");
  return asset;
}
/* =======================
   GET ASSETS BY MANY IDS
 ======================= */
export async function getAssetsByManyIds(ids: string[]) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organizationId found");

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
  if (!session) throw new Error("Unauthorized");

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organizationId found");

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
        // 👇 TAMBAHKAN INI: Tarik data relasi Sub Cluster
        assetSubClusters: {
          include: {
            // Jika Anda butuh menarik relasi ke atasnya (Cluster, Kategori, Golongan)
            // Sesuaikan nama relasinya ('assetCluster', dll) dengan schema Prisma Anda.
            // Contoh (uncomment jika schema Anda mendukung ini):

            assetCluster: {
              include: {
                assetCategory: true,
              },
            },
          },
        },
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
            select: { nama_department: true },
          },
        },
      });
    }

    // Ekstrak ID Sub Cluster dari array (karena bentuknya many-to-many / one-to-many)
    // Ambil index pertama [0] sebagai data klasifikasi utama aset ini
    const subCluster = asset.assetSubClusters?.[0];

    return {
      ...asset,
      assignedUser,
      // 👇 Memudahkan frontend membaca ID untuk mengisi defaultValues dropdown
      assetSubClusterId: subCluster?.id || null,
      assetClusterId: subCluster?.assetClusterId || null,
      assetCategoryId: subCluster?.assetCluster?.assetCategoryId || null,
      assetGroupId:
        subCluster?.assetCluster?.assetCategory?.assetGroupId || null,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch asset");
  }
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
  type: "all" | "latest" | "range";
  dateFrom?: string;
  dateTo?: string;
  organizationId: string;
}) {
  let where: any = { organizationId };

  if (type === "range" && dateFrom && dateTo) {
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
    orderBy: { createdAt: "desc" },
    take: type === "latest" ? 20 : undefined,
    include: {
      item: true,
    },
  });

  const fontRegular = path.join(
    process.cwd(),
    "public/fonts/Roboto-Regular.ttf",
  );
  const fontBold = path.join(process.cwd(), "public/fonts/Roboto-Bold.ttf");

  const doc = new PDFDocument({
    font: fontRegular,
    size: "A4",
    margin: 40,
  });
  const chunks: Uint8Array[] = [];
  doc.on("data", (c) => chunks.push(c));

  return new Promise<string>((resolve) => {
    doc.on("end", () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer.toString("base64"));
    });

    // ================= HEADER =================
    doc.font(fontBold).fontSize(16).text("LAPORAN DATA ASET", {
      align: "center",
    });

    doc.moveDown(0.5);

    doc
      .font(fontRegular)
      .fontSize(10)
      .text(`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`, {
        align: "center",
      });

    if (dateFrom && dateTo) {
      doc.text(
        `Periode: ${new Date(dateFrom).toLocaleDateString(
          "id-ID",
        )} - ${new Date(dateTo).toLocaleDateString("id-ID")}`,
        { align: "center" },
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

    doc.text("No", col.no, tableTop);
    doc.text("Item", col.item, tableTop);
    doc.text("Brand", col.brand, tableTop);
    doc.text("Model", col.model, tableTop);
    doc.text("Serial", col.serial, tableTop);
    doc.text("Status", col.status, tableTop);

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
      doc.text(a.item?.name ?? "-", col.item, y, { width: 120 });
      doc.text(a.brand ?? "-", col.brand, y, { width: 90 });
      doc.text(a.model ?? "-", col.model, y, { width: 90 });
      doc.text(a.serialNumber ?? "-", col.serial, y, { width: 90 });
      doc.text(a.status ?? "-", col.status, y, { width: 60 });

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

    doc.fontSize(10).text("Mengetahui,", { align: "right" });
    doc.moveDown(3);
    doc.text("(_____________________)", { align: "right" });

    doc.end();
  });
}
type ExportType = "all" | "latest" | "monthly";
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
  if (type === "latest") {
    where.createdAt = {
      gte: new Date(new Date().setDate(new Date().getDate() - 7)), // 7 hari terakhir
    };
  }

  if (type === "monthly" && dateFrom && dateTo) {
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
      createdAt: "desc",
    },
  });

  // ✅ CREATE EXCEL
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Assets");

  // HEADER
  worksheet.columns = [
    { header: "No", key: "no", width: 5 },
    { header: "Item Name", key: "item", width: 25 },
    { header: "Brand", key: "brand", width: 20 },
    { header: "Model", key: "model", width: 20 },
    { header: "Part Number", key: "partNumber", width: 20 },
    { header: "Serial Number", key: "serialNumber", width: 25 },
    { header: "Condition", key: "condition", width: 15 },
    { header: "Purchase Date", key: "purchaseDate", width: 20 },
    { header: "Price", key: "price", width: 15 },
    { header: "Location", key: "location", width: 20 },
    { header: "Department", key: "department", width: 20 },
    { header: "Status", key: "status", width: 15 },
    { header: "Vendor", key: "vendor", width: 20 },
  ];

  // STYLE HEADER
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // DATA
  assets.forEach((asset, index) => {
    worksheet.addRow({
      no: index + 1,
      item: asset.item?.name || "-",
      brand: asset.brand || "-",
      model: asset.model || "-",
      partNumber: asset.partNumber || "-",
      serialNumber: asset.serialNumber || "-",
      condition: asset.condition || "-",
      purchaseDate: asset.purchaseDate
        ? new Date(asset.purchaseDate).toLocaleDateString()
        : "-",
      price: asset.purchasePrice || 0,
      location: asset.location?.name || "-",
      department: asset.department?.nama_department || "-",
      status: asset.status,
      vendor: asset.vendorName || "-",
    });
  });

  // AUTO BORDER DATA
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
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
    throw new Error("Unauthorized");
  }

  const orgId = session.session?.activeOrganizationId;

  if (!orgId) {
    throw new Error("No organization");
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
    throw new Error("Asset not found");
  }

  if (asset.assignedStatus === "ASSIGNED") {
    throw new Error("Asset already assigned");
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

        assignedStatus: "ASSIGNED",

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

        action: "ASSIGN",

        field: "assignedUserId",

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

        action: "STATUS_CHANGE",

        field: "assignedStatus",

        oldValue: "AVAILABLE",

        newValue: "ASSIGNED",

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

        action: "TRANSFER",

        field: "department",

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
    action: "ASSIGN",
    entityType: "ASSET",
    entityId: asset.id,
    entityInfo: `${asset.id}`,
    details: {
      newData: result,
    },
  });

  revalidatePath("/assets");
  revalidatePath("/assets/items");

  return result;
}
export async function generateAssetCode(
  groupId: string,
  categoryId: string,
  clusterId: string,
  subClusterId?: string,
) {
  const group = await prisma.assetGroup.findUnique({
    where: { id: groupId },
  });

  const category = await prisma.assetCategory.findUnique({
    where: { id: categoryId },
  });

  const cluster = await prisma.assetCluster.findUnique({
    where: { id: clusterId },
  });

  const subCluster = subClusterId
    ? await prisma.assetSubCluster.findUnique({
        where: { id: subClusterId },
      })
    : null;

  if (!group || !category || !cluster) {
    throw new Error("Klasifikasi tidak lengkap");
  }

  const prefix = [group.code, category.code, cluster.code, subCluster?.code]
    .filter(Boolean)
    .join(".");

  /**
   * cari kode terakhir hanya untuk prefix ini
   * contoh:
   * 01.02.04.04.0007
   */

  const lastAsset = await prisma.asset.findFirst({
    where: {
      kode_asset: {
        startsWith: prefix + ".",
      },
    },
    orderBy: {
      kode_asset: "desc",
    },
  });

  let nextSequence = 1;

  if (lastAsset?.kode_asset) {
    const parts = lastAsset.kode_asset.split(".");
    const lastSeq = Number(parts[parts.length - 1]);

    if (!isNaN(lastSeq)) {
      nextSequence = lastSeq + 1;
    }
  }

  const seq = String(nextSequence).padStart(4, "0");

  return `${prefix}.${seq}`;
}

// LINK Import Excel
export async function importAssetExcel(
  formData: FormData,
  organizationId: string,
) {
  const file = formData.get("file") as File;
  const targetSubClusterId = formData.get("targetSubClusterId") as string;
  if (!file) throw new Error("File tidak ditemukan");

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
  }) as any[][];

  // 1. CARI BARIS AWAL TABLE
  const startIdx = rows.findIndex((r) =>
    r.some(
      (cell) =>
        String(cell).toLowerCase().includes("unit") ||
        String(cell).toLowerCase().includes("kode asset"),
    ),
  );
  if (startIdx === -1) throw new Error("Format Excel tidak dikenali");

  // 2. SMART HEADER READER (Mengatasi Cell yang Di-Merge)
  // Kita baca 2 baris header sekaligus dan gabungkan teksnya
  const headerRow1 = rows[startIdx] || [];
  const headerRow2 = rows[startIdx + 1] || [];
  const maxCols = Math.max(headerRow1.length, headerRow2.length);

  const combinedHeaders: string[] = [];
  let lastMainHeader = "";

  for (let i = 0; i < maxCols; i++) {
    const h1 = headerRow1[i] ? String(headerRow1[i]).trim() : "";
    const h2 = headerRow2[i] ? String(headerRow2[i]).trim() : "";

    // Jika h1 ada isinya, simpan sebagai header utama (berguna untuk kolom yang di-merge ke kanan)
    if (h1) lastMainHeader = h1;

    // Gabungkan (Contoh: "Keterangan" + "NO. SERI" -> "keterangan no. seri")
    const combined = `${lastMainHeader} ${h2}`.trim().toLowerCase();
    combinedHeaders.push(combined);
  }

  // Baris data dimulai setelah 2 baris header tersebut
  const dataRows = rows.slice(startIdx + 2);

  // 3. MAPPING INDEX BERDASARKAN SMART HEADER
  const col = {
    unit: getColumnIndex(combinedHeaders, ASSET_MAPPER.unit),
    model: getColumnIndex(combinedHeaders, ASSET_MAPPER.model),
    kode: getColumnIndex(combinedHeaders, ASSET_MAPPER.kode_asset),
    pic: getColumnIndex(combinedHeaders, ASSET_MAPPER.pic),
    sn: getColumnIndex(combinedHeaders, ASSET_MAPPER.sn),
    lantai: getColumnIndex(combinedHeaders, ASSET_MAPPER.lantai),
    area: getColumnIndex(combinedHeaders, ASSET_MAPPER.area),
    baik: getColumnIndex(combinedHeaders, ASSET_MAPPER.baik),
    rusak: getColumnIndex(combinedHeaders, ASSET_MAPPER.rusak),
    tgl: getColumnIndex(combinedHeaders, ASSET_MAPPER.tgl_pengadaan),
    kepemilikan: getColumnIndex(combinedHeaders, ASSET_MAPPER.kepemilikan),
  };

  // 4. PRE-FETCH DEPARTEMEN
  const allDepartments = await prisma.department.findMany({
    where: { organization_id: organizationId, deleted_at: null },
    select: {
      id_department: true,
      nama_department: true,
      kode_department: true,
    },
  });

  const results = { success: 0, failed: 0, errors: [] as string[] };

  // 5. LOOP DATA
  for (const [index, row] of dataRows.entries()) {
    const unitName = row[col.unit];
    if (!unitName) continue; // Skip baris kosong

    try {
      await prisma.$transaction(async (tx) => {
        // --- A. TANGGAL PENGADAAN ---
        let purchaseDate = null;
        if (col.tgl !== -1 && row[col.tgl]) {
          const tglValue = row[col.tgl];
          if (tglValue instanceof Date) purchaseDate = tglValue;
          else if (typeof tglValue === "number")
            purchaseDate = new Date(
              Math.round((tglValue - 25569) * 86400 * 1000),
            );
          else {
            const parsedDate = new Date(tglValue);
            if (!isNaN(parsedDate.getTime())) purchaseDate = parsedDate;
          }
        }

        // --- B. LOKASI (Area & Lantai Digabung) ---
        let locationId = null;
        let locationParts = [];
        if (col.lantai !== -1 && row[col.lantai])
          locationParts.push(String(row[col.lantai]).trim());
        if (col.area !== -1 && row[col.area])
          locationParts.push(String(row[col.area]).trim());

        if (locationParts.length > 0) {
          const locName = locationParts.join(" - ");
          let existingLoc = await tx.location.findFirst({
            where: { name: locName, organizationId },
          });

          if (existingLoc) {
            locationId = existingLoc.id;
          } else {
            const newLoc = await tx.location.create({
              data: { name: locName, organizationId },
            });
            locationId = newLoc.id;
          }
        }

        // --- C. KEPEMILIKAN ---
        let finalNotes = "";
        if (col.kepemilikan !== -1 && row[col.kepemilikan]) {
          finalNotes = `Kepemilikan: ${String(row[col.kepemilikan]).trim()}`;
        }

        // --- D. LOGIKA PIC (DEPARTEMEN vs NAMA ORANG) ---
        let finalDepartmentId = null;
        let finalPersonName = null;

        if (col.pic !== -1 && row[col.pic]) {
          const rawPicValue = String(row[col.pic]).trim();
          const excelDeptClean = rawPicValue.toLowerCase();

          // Cari apakah nama/kode tersebut ada di tabel Departemen
          const existingDept = allDepartments.find(
            (d) =>
              d.nama_department.toLowerCase() === excelDeptClean ||
              d.kode_department.toLowerCase() === excelDeptClean ||
              d.nama_department.toLowerCase().includes(excelDeptClean),
          );

          if (existingDept) {
            // JIKA KETEMU: Hubungkan ke tabel departemen
            finalDepartmentId = existingDept.id_department;
          } else {
            // JIKA TIDAK KETEMU: Asumsikan ini adalah NAMA ORANG!
            // Jangan buat departemen baru, simpan saja di kolom PIC bawaan dari Asset
            finalPersonName = rawPicValue;
          }
        }

        // --- E. KONDISI (Berdasarkan Kolom Baik/Rusak) ---
        let condition = "BAIK"; // Default
        // Jika kolom 'rusak' ada isinya (misal dicentang, atau ditulis 'rusak', atau 'v')
        if (
          col.rusak !== -1 &&
          row[col.rusak] &&
          String(row[col.rusak]).trim() !== ""
        ) {
          condition = "RUSAK";
        }

        // --- F. PARENT ITEM ---
        const modelName =
          col.model !== -1 ? String(row[col.model] || "").trim() : "";
        let item = await tx.item.findFirst({
          where: { name: String(unitName), organizationId },
        });

        if (!item) {
          item = await tx.item.create({
            data: {
              name: String(unitName),
              code: `ITM-${Math.random().toString(36).substring(7).toUpperCase()}`,
              assetType: "FIXED",
              organizationId,
            },
          });
        }

        // --- G. CREATE ASSET ---
        await tx.asset.create({
          data: {
            itemId: item.id,
            organizationId,
            kode_asset: col.kode !== -1 ? String(row[col.kode] || "") : null,
            serialNumber:
              col.sn !== -1 ? String(row[col.sn] || "").trim() : null,
            model: modelName,

            departmentId: finalDepartmentId, // Akan terisi jika itu departemen
            PIC: finalPersonName, // Akan terisi jika itu nama orang

            condition: condition,
            locationId: locationId,
            status: "ACTIVE",
            purchaseDate: purchaseDate,
            notes: finalNotes || null,
            assetSubClusters: {
              connect: { id: targetSubClusterId },
            },
          },
        });
      });
      results.success++;
    } catch (err: any) {
      results.failed++;
      results.errors.push(`Baris gagal diproses: ${err.message}`);
    }
  }

  return results;
}
// LINK Multi Delete Asset
export async function deleteManyAsset(ids: string[]) {
  const session = await getServerSession();
  if (!session) return { success: false, message: "Unauthorized" };
  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) return { success: false, message: "Unauthorized" };

  try {
    const deletedAsset = await prisma.asset.deleteMany({
      where: {
        id: { in: ids },
        organizationId: organizationId,
      },
    });
    revalidatePath("/assets");
    return deletedAsset;
  } catch (error) {
    console.error("Error deleting assets:", error);
    return { success: false, message: "Failed to delete assets" };
  }
}
