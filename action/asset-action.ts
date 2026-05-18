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
import bwipjs from "bwip-js";
import { deleteS3File, uploadToS3 } from "@/lib/s3-utils";
import { Asset } from "@/generated/prisma";
import { AssetWithItem } from "@/app/(app)/assets/components/asset-column";
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
    select: {
      id: true,
      name: true,
      code: true,
      assetType: true,
      // 👇 INCLUDE DATA KATEGORI UNTUK PARSING SILSIALAH DI FRONTEND 👇
      category: {
        select: {
          id: true,
          name: true,
          code: true, // Ini berisi "03.05.11.07" atau "03.05" dsb
          classificationId: true,
          classificationType: true,
        },
      },
    },
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

  // 1. Inisialisasi object where dengan filter wajib
  const where: any = {
    organizationId: activeOrgId,
    status: { in: ["ACTIVE", "GOOD"] },
  };

  // 2. Tambahkan departmentId jika ada
  if (departmentId) {
    where.departmentId = departmentId;
  }

  // 3. LOGIKA KRUSIAL: Hanya tambah divisiId jika ada nilainya DAN bukan "ALL"
  // Pastikan juga field ini memang ada di schema.prisma Anda!
  if (divisiId && divisiId !== "ALL") {
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
    orderBy: { item: { name: "asc" } },
  });
}

/* =======================
   // LINK CREATE ASSET (UPDATED WITH APAR & HYDRANT)
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

  // --- INTEGRASI S3 ---
  const photoFile = formData.get("photo") as File | null;
  let photoUrl = null;
  if (photoFile && photoFile.size > 0) {
    photoUrl = await uploadToS3(photoFile, "asset-photos");
  }

  const formDepartmentId = formData.get("departmentId")?.toString();
  const isAdminOrOwner = role === "staff_asset" || role === "owner";
  const finalDepartmentId =
    isAdminOrOwner && formDepartmentId ? formDepartmentId : sessionDeptId;

  const assetSubClusterId = formData
    .get("assetSubClusterId")
    ?.toString()
    .trim();

  // 👇 TANGKAP PAYLOAD APAR & HYDRANT 👇
  const isAparOrHydrant = formData.get("isAparOrHydrant")?.toString() || "NONE";
  const jenisApar = formData.get("jenisApar")?.toString() as any;
  const sizeApar = parseFloatOrNull("sizeApar");
  const ukuranHydrant = formData.get("ukuranHydrant")?.toString();

  // 1. CARI MASTER ITEM DAN KATEGORINYA TERLEBIH DAHULU UNTUK MENDAPATKAN KODE PREFIX
  const itemMaster = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      category: true,
    },
  });
  if (!itemMaster) throw new Error("Master Item tidak ditemukan");

  let finalKodeAsset = formData.get("kode_asset")?.toString()?.trim() || null;
  if (!activeOrgId) throw new Error("No active organizationId found");
  const asset = await prisma.$transaction(async (tx) => {
    // 2. LOGIKA AUTO-GENERATION KODE BERDASARKAN KATEGORI ITEM
    if (!finalKodeAsset && itemMaster.category?.code) {
      const prefix = itemMaster.category.code;

      const lastAsset = await tx.asset.findFirst({
        where: {
          organizationId: activeOrgId,
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
      finalKodeAsset = `${prefix}.${seq}`;
    }

    // 3. JALANKAN PROSES PEMBUATAN ASSET
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
        kode_asset: finalKodeAsset,
        vendorName: formData.get("vendorName")?.toString() || null,
        garansi_exp: parseDateOrNull("garansi_exp"),
        photoUrl,

        ...(assetSubClusterId && {
          assetSubClusters: {
            connect: [{ id: assetSubClusterId }],
          },
        }),

        // 👇 NESTED CREATE APAR / HYDRANT 👇
        ...(isAparOrHydrant === "APAR" && jenisApar && sizeApar !== null
          ? {
              aparDetails: {
                create: {
                  jenis: jenisApar,
                  size: sizeApar,
                },
              },
            }
          : {}),

        ...(isAparOrHydrant === "HYDRANT" && ukuranHydrant
          ? {
              hydrantDetails: {
                create: {
                  ukuran: ukuranHydrant,
                },
              },
            }
          : {}),
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
      entityInfo: `${newAsset.kode_asset || "N/A"} - ${itemMaster.name || "N/A"}`,
      details: { newData: newAsset },
      tx,
    });

    return newAsset;
  });

  revalidatePath("/assets");
  return asset;
}
/* =======================
  //  LINK UPDATE ASSET (UPDATED WITH APAR & HYDRANT)
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

  // 👇 TANGKAP PAYLOAD APAR & HYDRANT 👇
  const isAparOrHydrant = formData.get("isAparOrHydrant")?.toString() || "NONE";
  const jenisApar = formData.get("jenisApar")?.toString() as any;
  const sizeApar = parseFloatOrNull("sizeApar");
  const ukuranHydrant = formData.get("ukuranHydrant")?.toString();

  // --- LOGIKA FOTO (HAPUS & UPDATE) ---
  const removePhoto = formData.get("removePhoto") === "true";
  const photoFile = formData.get("photo") as File | null;
  const isPhotoValid = photoFile && photoFile.size > 0;

  let finalPhotoUrl = asset.photoUrl;

  if (removePhoto) {
    if (asset.photoUrl) await deleteS3File(asset.photoUrl);
    finalPhotoUrl = null;
  } else if (isPhotoValid) {
    if (asset.photoUrl) await deleteS3File(asset.photoUrl);
    finalPhotoUrl = await uploadToS3(photoFile, "asset-photos");
  }

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
        photoUrl: finalPhotoUrl,
        updatedAt: new Date(),
        ...subClusterUpdateObj,

        // 👇 NESTED UPDATE APAR / HYDRANT (Menghapus data lama jika tipe berubah, lalu membuat yang baru) 👇
        aparDetails:
          isAparOrHydrant === "APAR" && jenisApar && sizeApar !== null
            ? {
                deleteMany: {}, // Hapus record sebelumnya agar tidak dobel
                create: {
                  jenis: jenisApar,
                  size: sizeApar,
                },
              }
            : { deleteMany: {} },

        hydrantDetails:
          isAparOrHydrant === "HYDRANT" && ukuranHydrant
            ? {
                deleteMany: {},
                create: {
                  ukuran: ukuranHydrant,
                },
              }
            : { deleteMany: {} },
      },
    });

    // ... sisa logika stock sync dan history biarkan utuh sama seperti sebelumnya
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
          action: "TRANSFER_LOCATION",
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
      details: { message: "Asset updated" },
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
  // LINK GET ASSET BY ID (for detail page & edit mode)
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
        organizationId: activeOrgId,
      },
      include: {
        item: true,
        location: true,
        department: true,
        assetSubClusters: {
          include: {
            assetCluster: {
              include: {
                assetCategory: true,
              },
            },
          },
        },
        // 👇 INCLUDE TABEL APAR & HYDRANT 👇
        aparDetails: true,
        hydrantDetails: true,
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

    const subCluster = asset.assetSubClusters?.[0];

    // 👇 BACA DATA APAR ATAU HYDRANT JIKA ADA 👇
    const aparData = asset.aparDetails?.[0]; // Ambil index ke 0 karena relasinya dibaca array
    const hydrantData = asset.hydrantDetails?.[0];

    return {
      ...asset,
      assignedUser,
      assetSubClusterId: subCluster?.id || null,
      assetClusterId: subCluster?.assetClusterId || null,
      assetCategoryId: subCluster?.assetCluster?.assetCategoryId || null,
      assetGroupId:
        subCluster?.assetCluster?.assetCategory?.assetGroupId || null,

      // 👇 SUNTIKKAN KE RESPON AGAR DIBACA FORM FRONTEND 👇
      isAparOrHydrant: aparData ? "APAR" : hydrantData ? "HYDRANT" : "NONE",
      jenisApar: aparData?.jenis || undefined,
      sizeApar: aparData?.size ? Number(aparData.size) : undefined,
      ukuranHydrant: hydrantData?.ukuran || "",
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch asset");
  }
}
// LINK Get Asset By Kode Asset
export async function scanAssetCode(scannedCode: string) {
  try {
    const session = await getServerSession();
    if (!session) return { success: false, message: "Unauthorized" };

    const activeOrgId = session.session?.activeOrganizationId;
    if (!activeOrgId)
      return { success: false, message: "No active organizationId found" };

    if (!scannedCode) return { success: false, message: "Kode barcode kosong" };

    // Cari asset berdasarkan kode_asset ATAU potongan awal UUID
    const asset = await prisma.asset.findFirst({
      where: {
        organizationId: activeOrgId, // 🔐 PENTING: Sama seperti getAssetById Anda
        OR: [
          { kode_asset: { equals: scannedCode } },
          { id: { startsWith: scannedCode.toLowerCase() } },
        ],
      },
      select: {
        id: true, // Kita HANYA butuh Full ID untuk redirect
      },
    });

    if (!asset) {
      return {
        success: false,
        message: "Asset tidak ditemukan dalam database.",
      };
    }

    return { success: true, data: asset };
  } catch (error: any) {
    console.error("Scan Error:", error);
    return { success: false, message: "Terjadi kesalahan saat mencari asset" };
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
export async function generateAssetCode(categoryCode?: string) {
  if (!categoryCode) {
    return "";
  }

  // categoryCode langsung menjadi prefix (Contoh: "03.05.11.07")
  const prefix = categoryCode;

  // Cari aset terakhir yang memiliki awalan prefix titik yang sama
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

  // Format urutan 4 digit (0001, 0002, dst) sesuai standar Anda
  const seq = String(nextSequence).padStart(3, "0");

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

  // --- VALIDASI AWAL TARGET SUB CLUSTER ---
  if (targetSubClusterId && targetSubClusterId !== "") {
    const checkCluster = await prisma.assetSubCluster.findUnique({
      where: { id: targetSubClusterId },
    });
    if (!checkCluster) {
      throw new Error(
        `Sub Cluster ID "${targetSubClusterId}" tidak ditemukan di database. Proses import dibatalkan.`,
      );
    }
  }

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

  // 2. SMART HEADER READER
  const headerRow1 = rows[startIdx] || [];
  const headerRow2 = rows[startIdx + 1] || [];
  const maxCols = Math.max(headerRow1.length, headerRow2.length);

  const combinedHeaders: string[] = [];
  let lastMainHeader = "";

  for (let i = 0; i < maxCols; i++) {
    const h1 = headerRow1[i] ? String(headerRow1[i]).trim() : "";
    const h2 = headerRow2[i] ? String(headerRow2[i]).trim() : "";
    if (h1) lastMainHeader = h1;
    const combined = `${lastMainHeader} ${h2}`.trim().toLowerCase();
    combinedHeaders.push(combined);
  }

  const dataRows = rows.slice(startIdx + 2);

  // 3. MAPPING INDEX
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

  // --- 4. PRE-VALIDASI DUPLIKASI DI DALAM EXCEL ---
  const seenSn = new Set<string>();
  const seenKode = new Set<string>();
  const excelErrors: string[] = [];

  for (const [index, row] of dataRows.entries()) {
    const excelRowNumber = index + startIdx + 3; // Menyesuaikan nomor baris di Excel asli

    const rawSn =
      col.sn !== -1 && row[col.sn] ? String(row[col.sn]).trim() : "";
    const rawKode =
      col.kode !== -1 && row[col.kode] ? String(row[col.kode]).trim() : "";

    if (rawSn) {
      if (seenSn.has(rawSn)) {
        excelErrors.push(
          `Baris ${excelRowNumber}: Serial Number "${rawSn}" duplikat di dalam file Excel.`,
        );
      } else {
        seenSn.add(rawSn);
      }
    }

    if (rawKode) {
      if (seenKode.has(rawKode)) {
        excelErrors.push(
          `Baris ${excelRowNumber}: Kode Asset "${rawKode}" duplikat di dalam file Excel.`,
        );
      } else {
        seenKode.add(rawKode);
      }
    }
  }

  // Jika ada duplikasi di dalam Excel, batalkan seluruh proses import untuk menjaga konsistensi
  if (excelErrors.length > 0) {
    return {
      success: 0,
      failed: excelErrors.length,
      errors: excelErrors,
    };
  }
  // --------------------------------------------------

  // 5. PRE-FETCH DEPARTEMEN
  const allDepartments = await prisma.department.findMany({
    where: { organization_id: organizationId, deleted_at: null },
    select: {
      id_department: true,
      nama_department: true,
      kode_department: true,
    },
  });

  const results = { success: 0, failed: 0, errors: [] as string[] };

  // 6. LOOP DATA
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

        // --- B. LOKASI ---
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

        // --- D. PIC ---
        let finalDepartmentId = null;
        let finalPersonName = null;

        if (col.pic !== -1 && row[col.pic]) {
          const rawPicValue = String(row[col.pic]).trim();
          const excelDeptClean = rawPicValue.toLowerCase();

          const existingDept = allDepartments.find(
            (d) =>
              d.nama_department.toLowerCase() === excelDeptClean ||
              d.kode_department.toLowerCase() === excelDeptClean ||
              d.nama_department.toLowerCase().includes(excelDeptClean),
          );

          if (existingDept) {
            finalDepartmentId = existingDept.id_department;
          } else {
            finalPersonName = rawPicValue;
          }
        }

        // --- E. KONDISI ---
        let condition = "BAIK";
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

            // PERBAIKAN NULL SANITIZATION:
            kode_asset:
              col.kode !== -1 && row[col.kode]
                ? String(row[col.kode]).trim() || null
                : null,
            serialNumber:
              col.sn !== -1 && row[col.sn]
                ? String(row[col.sn]).trim() || null
                : null,

            model: modelName,
            departmentId: finalDepartmentId,
            PIC: finalPersonName,
            condition: condition,
            locationId: locationId,
            status: "ACTIVE",
            purchaseDate: purchaseDate,
            notes: finalNotes || null,

            ...(targetSubClusterId && targetSubClusterId !== ""
              ? {
                  assetSubClusters: {
                    connect: { id: targetSubClusterId },
                  },
                }
              : {}),
          },
        });
      });
      results.success++;
    } catch (err: any) {
      results.failed++;
      const excelRowNumber = index + startIdx + 3;

      // Error database (seperti duplikasi dengan data yang sudah ada di DB) akan tertangkap di sini
      results.errors.push(
        `Baris ${excelRowNumber} (${unitName}): ${err.message || "Gagal menyimpan ke database"}`,
      );
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
// LINK Export Barcode Aset
export async function exportBarcodeToPDF(assets: AssetWithItem[]) {
  try {
    const session = await getServerSession();

    if (!assets || assets.length === 0) {
      throw new Error("Tidak ada asset yang dipilih");
    }
    if (!session || !session.session?.activeOrganizationId) {
      return { success: false, message: "Unauthorized" };
    }

    const pdfBuffer = await new Promise<Buffer>(async (resolve, reject) => {
      try {
        // 1. Tentukan path absolut ke file TTF
        const fontRegular = path.join(
          process.cwd(),
          "public",
          "fonts",
          "Roboto-Regular.ttf",
        );
        const fontBold = path.join(
          process.cwd(),
          "public",
          "fonts",
          "Roboto-Bold.ttf",
        );

        // 2. Lakukan pengecekan ketat. Jika file tidak ada, lemparkan error deskriptif
        if (!fs.existsSync(fontRegular)) {
          throw new Error(
            `Font Regular tidak ditemukan di path: ${fontRegular}. Pastikan folder public ter-copy di Docker.`,
          );
        }
        if (!fs.existsSync(fontBold)) {
          throw new Error(
            `Font Bold tidak ditemukan di path: ${fontBold}. Pastikan folder public ter-copy di Docker.`,
          );
        }

        // 3. Inisialisasi dokumen langsung menggunakan font TTF
        const doc = new PDFDocument({
          size: "A4",
          margin: 40,
          font: fontRegular, // Set default font ke Roboto-Regular
        });

        const buffers: Buffer[] = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => resolve(Buffer.concat(buffers)));

        // Konfigurasi Grid Label
        const startX = 25;
        const startY = 30;

        const maxCols = 3;
        const colWidth = 180;
        const rowHeight = 90;

        const boxWidth = 170;
        const boxHeight = 75;

        let currentItemOnPage = 0;

        for (let i = 0; i < assets.length; i++) {
          const asset = assets[i];

          let col = currentItemOnPage % maxCols;
          let row = Math.floor(currentItemOnPage / maxCols);

          let x = startX + col * colWidth;
          let y = startY + row * rowHeight;

          // Pagination
          if (y + rowHeight > doc.page.height - 25) {
            doc.addPage();
            currentItemOnPage = 0;

            col = 0;
            row = 0;
            x = startX;
            y = startY;
          }

          const assetCode =
            asset.kode_asset || asset.id.split("-")[0].toUpperCase();
          const itemName = asset.item?.name || "Unknown Item";
          const deptName =
            (asset as any).department?.name?.substring(0, 3) || "Eng";

          // Border
          doc
            .lineWidth(0.5)
            .strokeColor("#a1a1aa")
            .dash(3, { space: 3 })
            .rect(x, y, boxWidth, boxHeight)
            .stroke()
            .undash();

          // Teks Atas (menggunakan Roboto-Regular secara default)
          doc.fillColor("#64748b");
          doc
            .fontSize(9)
            .text(deptName, x + 5, y + 5, { width: 50, align: "left" });

          doc.text(assetCode, x + boxWidth - 105, y + 5, {
            width: 100,
            align: "right",
          });

          // Barcode
          const barcodeBuffer = await bwipjs.toBuffer({
            bcid: "code128",
            text: assetCode,
            scale: 3,
            height: 15,
            includetext: false,
          });

          doc.image(barcodeBuffer, x + 5, y + 18, {
            width: boxWidth - 10,
            height: 35,
          });

          // Teks Bawah (Pindah ke Roboto-Bold)
          doc.fillColor("#1f2937");
          doc
            .font(fontBold) // Ganti font ke Bold
            .fontSize(10)
            .text(itemName, x + 5, y + 58, {
              width: boxWidth - 10,
              align: "center",
              lineBreak: false,
            });

          // Kembalikan font ke Regular untuk iterasi berikutnya (opsional tapi disarankan)
          doc.font(fontRegular);

          currentItemOnPage++;
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });

    return {
      success: true,
      data: pdfBuffer.toString("base64"),
    };
  } catch (error: any) {
    console.error("PDF Generation Error:", error);
    return { success: false, error: error.message || "Gagal membuat PDF" };
  }
}
