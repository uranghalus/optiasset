/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { createAuditLog } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";
/* =========================
 TYPES
========================= */

export type PaginationArgs = {
  page: number;
  pageSize: number;
};

/* =========================
 ASSET GROUP (Golongan)
========================= */

export async function getAssetGroups({ page, pageSize }: PaginationArgs) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const orgId = session.session?.activeOrganizationId;
  if (!orgId) throw new Error("No active organization");

  const safePage = Math.max(0, page);

  const [data, total] = await prisma.$transaction([
    prisma.assetGroup.findMany({
      where: {
        organizationId: orgId,
      },
      skip: safePage * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.assetGroup.count({
      where: {
        organizationId: orgId,
      },
    }),
  ]);

  return {
    data,
    total,
    page: safePage,
    pageSize,
    pageCount: Math.ceil(total / pageSize),
  };
}

export async function createAssetGroup(formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const orgId = session.session?.activeOrganizationId;
  if (!orgId) throw new Error("No active organization");

  const code = formData.get("code")?.toString()?.trim();
  const name = formData.get("name")?.toString()?.trim();

  if (!code) throw new Error("Kode wajib diisi");
  if (!name) throw new Error("Nama wajib diisi");

  const existing = await prisma.assetGroup.findFirst({
    where: {
      organizationId: orgId,
      code,
    },
  });

  if (existing) {
    throw new Error("Kode sudah digunakan di organisasi ini");
  }

  const created = await prisma.$transaction(async (tx) => {
    try {
      const result = await tx.assetGroup.create({
        data: {
          code,
          name,
          description: formData.get("description")?.toString(),
          organizationId: orgId,
        },
      });

      await createAuditLog({
        userId: session.user.id,
        organizationId: orgId,
        action: "CREATE",
        entityType: "ASSET_GROUP",
        entityId: result.id,
        entityInfo: result.name,
        details: { newData: result },
        tx,
      });

      return result;
    } catch (err: any) {
      if (err.code === "P2002") {
        throw new Error("Kode sudah dipakai (kemungkinan oleh user lain)");
      }
      throw err;
    }
  });

  revalidatePath("/master/asset-group");
  revalidatePath("/master/asset-classification");

  return created;
}

export async function updateAssetGroup(id: string, formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const orgId = session.session?.activeOrganizationId;
  if (!orgId) throw new Error("No active organization");

  const name = formData.get("name")?.toString()?.trim();
  if (!name) throw new Error("Nama wajib diisi");

  const existing = await prisma.assetGroup.findFirst({
    where: {
      id,
      organizationId: orgId,
    },
  });

  if (!existing) throw new Error("Data not found");

  const updated = await prisma.$transaction(async (tx) => {
    try {
      const result = await tx.assetGroup.update({
        where: { id },
        data: {
          code: formData.get("code")?.toString(),
          name,
          description: formData.get("description")?.toString(),
        },
      });

      await createAuditLog({
        userId: session.user.id,
        organizationId: orgId,
        action: "UPDATE",
        entityType: "ASSET_GROUP",
        entityId: id,
        entityInfo: result.name,
        details: {
          oldData: existing,
          newData: result,
        },
        tx,
      });

      return result;
    } catch (err: any) {
      if (err.code === "P2002") throw new Error("Kode sudah dipakai oleh data lain");
      throw err;
    }
  });

  revalidatePath("/master/asset-group");
  revalidatePath("/master/asset-classification");

  return updated;
}

export async function deleteAssetGroup(id: string) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const orgId = session.session?.activeOrganizationId;
  if (!orgId) throw new Error("No active organization");

  const deleted = await prisma.$transaction(async (tx) => {
    const existing = await tx.assetGroup.findFirst({
      where: {
        id,
        organizationId: orgId,
      },
    });

    if (!existing) {
      throw new Error("Not found");
    }

    try {
      const result = await tx.assetGroup.delete({
        where: { id },
      });

      await createAuditLog({
        userId: session.user.id,
        organizationId: orgId,
        action: "DELETE",
        entityType: "ASSET_GROUP",
        entityId: id,
        entityInfo: result.name,
        details: {
          deletedData: result,
        },
        tx,
      });

      return result;
    } catch (err: any) {
      if (err.code === "P2003") {
        throw new Error("Gagal menghapus: Masih ada data kategori yang terhubung dengan golongan ini.");
      }
      throw err;
    }
  });

  revalidatePath("/master/asset-group");
  revalidatePath("/master/asset-classification");

  return deleted;
}

/* =========================
 CATEGORY
========================= */

export async function getCategoriesByGroup(assetGroupId: string) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const orgId = session.session?.activeOrganizationId;
  if (!orgId) throw new Error("No active organization");

  return prisma.assetCategory.findMany({
    where: {
      assetGroupId,
      assetGroup: { organizationId: orgId }, // Security Fix
    },
    orderBy: {
      code: "asc",
    },
  });
}

export async function createAssetCategory(formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const orgId = session.session?.activeOrganizationId;
  if (!orgId) throw new Error("No active organization"); // Security Fix

  const name = formData.get("name")?.toString()?.trim();
  if (!name) throw new Error("Nama wajib diisi");

  const created = await prisma.$transaction(async (tx) => {
    const parent = await tx.assetGroup.findFirst({
      where: {
        id: formData.get("assetGroupId")?.toString(),
        organizationId: orgId,
      },
    });

    if (!parent) {
      throw new Error("Parent Group not found or unauthorized");
    }

    try {
      const result = await tx.assetCategory.create({
        data: {
          assetGroupId: parent.id,
          code: formData.get("code")?.toString(),
          name,
          description: formData.get("description")?.toString(),
        },
      });

      await createAuditLog({
        userId: session.user.id,
        organizationId: orgId,
        action: "CREATE",
        entityType: "ASSET_CATEGORY",
        entityId: result.id,
        entityInfo: result.name,
        details: { newData: result },
        tx,
      });

      return result;
    } catch (err: any) {
      if (err.code === "P2002") throw new Error("Kode sudah dipakai");
      throw err;
    }
  });

  revalidatePath("/master/asset-classification");

  return created;
}

export async function updateAssetCategory(id: string, formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const orgId = session.session?.activeOrganizationId;
  if (!orgId) throw new Error("No active organization");

  const name = formData.get("name")?.toString()?.trim();
  if (!name) throw new Error("Nama wajib diisi");

  const existing = await prisma.assetCategory.findFirst({
    where: {
      id,
      assetGroup: { organizationId: orgId },
    },
  });

  if (!existing) throw new Error("Category not found");

  const updated = await prisma.$transaction(async (tx) => {
    try {
      const result = await tx.assetCategory.update({
        where: { id },
        data: {
          code: formData.get("code")?.toString(),
          name,
          description: formData.get("description")?.toString(),
        },
      });

      await createAuditLog({
        userId: session.user.id,
        organizationId: orgId,
        action: "UPDATE",
        entityType: "ASSET_CATEGORY",
        entityId: id,
        entityInfo: result.name,
        details: { oldData: existing, newData: result },
        tx,
      });

      return result;
    } catch (err: any) {
      if (err.code === "P2002") throw new Error("Kode sudah dipakai oleh data lain");
      throw err;
    }
  });

  revalidatePath("/master/asset-classification");

  return updated;
}

export async function deleteAssetCategory(id: string) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const orgId = session.session?.activeOrganizationId;
  if (!orgId) throw new Error("No active organization");

  const deleted = await prisma.$transaction(async (tx) => {
    const existing = await tx.assetCategory.findFirst({
      where: {
        id,
        assetGroup: { organizationId: orgId },
      },
    });

    if (!existing) throw new Error("Category not found");

    try {
      const result = await tx.assetCategory.delete({
        where: { id },
      });

      await createAuditLog({
        userId: session.user.id,
        organizationId: orgId,
        action: "DELETE",
        entityType: "ASSET_CATEGORY",
        entityId: id,
        entityInfo: result.name,
        details: { deletedData: result },
        tx,
      });

      return result;
    } catch (err: any) {
      if (err.code === "P2003") {
        throw new Error("Gagal menghapus: Masih ada data klaster yang terhubung dengan kategori ini.");
      }
      throw err;
    }
  });

  revalidatePath("/master/asset-classification");

  return deleted;
}

/* =========================
 LINK CLUSTER
========================= */

export async function getClustersByCategory(categoryId: string) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const orgId = session.session?.activeOrganizationId;
  if (!orgId) throw new Error("No active organization");

  return prisma.assetCluster.findMany({
    where: {
      assetCategoryId: categoryId,
      assetCategory: { assetGroup: { organizationId: orgId } }, // Security Fix
    },
    orderBy: { code: "asc" },
  });
}

export async function createAssetCluster(formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const orgId = session.session?.activeOrganizationId;
  if (!orgId) throw new Error("No active organization");

  const name = formData.get("name")?.toString()?.trim();
  if (!name) throw new Error("Nama wajib diisi");

  const created = await prisma.$transaction(async (tx) => {
    const parent = await tx.assetCategory.findFirst({
      where: {
        id: formData.get("assetCategoryId")?.toString(),
        assetGroup: { organizationId: orgId },
      },
    });

    if (!parent) {
      throw new Error("Parent Category not found or unauthorized");
    }

    try {
      const result = await tx.assetCluster.create({
        data: {
          assetCategoryId: parent.id,
          code: formData.get("code")?.toString(),
          name,
          description: formData.get("description")?.toString(),
        },
      });

      await createAuditLog({
        userId: session.user.id,
        organizationId: orgId,
        action: "CREATE",
        entityType: "ASSET_CLUSTER",
        entityId: result.id,
        entityInfo: result.name,
        details: { newData: result },
        tx,
      });

      return result;
    } catch (err: any) {
      if (err.code === "P2002") throw new Error("Kode sudah dipakai");
      throw err;
    }
  });

  revalidatePath("/master/asset-classification");

  return created;
}

export async function updateAssetCluster(id: string, formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const orgId = session.session?.activeOrganizationId;
  if (!orgId) throw new Error("No active organization");

  const name = formData.get("name")?.toString()?.trim();
  if (!name) throw new Error("Nama wajib diisi");

  const existing = await prisma.assetCluster.findFirst({
    where: {
      id,
      assetCategory: { assetGroup: { organizationId: orgId } },
    },
  });

  if (!existing) throw new Error("Cluster not found");

  const updated = await prisma.$transaction(async (tx) => {
    try {
      const result = await tx.assetCluster.update({
        where: { id },
        data: {
          code: formData.get("code")?.toString(),
          name,
          description: formData.get("description")?.toString(),
        },
      });

      await createAuditLog({
        userId: session.user.id,
        organizationId: orgId,
        action: "UPDATE",
        entityType: "ASSET_CLUSTER",
        entityId: id,
        entityInfo: result.name,
        details: { oldData: existing, newData: result },
        tx,
      });

      return result;
    } catch (err: any) {
      if (err.code === "P2002") throw new Error("Kode sudah dipakai oleh data lain");
      throw err;
    }
  });

  revalidatePath("/master/asset-classification");

  return updated;
}

export async function deleteAssetCluster(id: string) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const orgId = session.session?.activeOrganizationId;
  if (!orgId) throw new Error("No active organization");

  const deleted = await prisma.$transaction(async (tx) => {
    const existing = await tx.assetCluster.findFirst({
      where: {
        id,
        assetCategory: { assetGroup: { organizationId: orgId } },
      },
    });

    if (!existing) throw new Error("Cluster not found");

    try {
      const result = await tx.assetCluster.delete({
        where: { id },
      });

      await createAuditLog({
        userId: session.user.id,
        organizationId: orgId,
        action: "DELETE",
        entityType: "ASSET_CLUSTER",
        entityId: id,
        entityInfo: result.name,
        details: { deletedData: result },
        tx,
      });

      return result;
    } catch (err: any) {
      if (err.code === "P2003") {
        throw new Error("Gagal menghapus: Masih ada data sub-klaster yang terhubung dengan klaster ini.");
      }
      throw err;
    }
  });

  revalidatePath("/master/asset-classification");

  return deleted;
}

/* =========================
 SUB CLUSTER
========================= */

export async function getSubClustersByCluster(clusterId: string) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const orgId = session.session?.activeOrganizationId;
  if (!orgId) throw new Error("No active organization");

  return prisma.assetSubCluster.findMany({
    where: {
      assetClusterId: clusterId,
      assetCluster: { assetCategory: { assetGroup: { organizationId: orgId } } }, // Security Fix
    },
    orderBy: { code: "asc" },
  });
}

export async function createAssetSubCluster(formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const orgId = session.session?.activeOrganizationId;
  if (!orgId) throw new Error("No active organization");

  const name = formData.get("name")?.toString()?.trim();
  if (!name) throw new Error("Nama wajib diisi");

  const created = await prisma.$transaction(async (tx) => {
    const parent = await tx.assetCluster.findFirst({
      where: {
        id: formData.get("assetClusterId")?.toString(),
        assetCategory: { assetGroup: { organizationId: orgId } },
      },
    });

    if (!parent) {
      throw new Error("Parent Cluster not found or unauthorized");
    }

    try {
      const result = await tx.assetSubCluster.create({
        data: {
          assetClusterId: parent.id,
          code: formData.get("code")?.toString() ?? undefined,
          name,
          description: formData.get("description")?.toString() ?? undefined,
          notes: formData.get("notes")?.toString() ?? undefined,
        },
      });

      await createAuditLog({
        userId: session.user.id,
        organizationId: orgId,
        action: "CREATE",
        entityType: "ASSET_SUB_CLUSTER",
        entityId: result.id,
        entityInfo: result.name,
        details: { newData: result },
        tx,
      });

      return result;
    } catch (err: any) {
      if (err.code === "P2002") throw new Error("Kode sudah dipakai");
      throw err;
    }
  });

  revalidatePath("/master/asset-classification");

  return created;
}

/* =========================
 CASCADING SELECTS
========================= */

export async function getAssetGroupsForSelect() {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const orgId = session.session?.activeOrganizationId;
  if (!orgId) throw new Error("No active organization");

  return prisma.assetGroup.findMany({
    where: {
      organizationId: orgId,
    },
    select: {
      id: true,
      code: true,
      name: true,
    },
    orderBy: {
      code: "asc",
    },
  });
}

/* =========================
 FULL TREE
========================= */

export async function getClassificationTree() {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const orgId = session.session?.activeOrganizationId;
  if (!orgId) throw new Error("No active organization");

  return prisma.assetGroup.findMany({
    where: {
      organizationId: orgId,
    },
    include: {
      categories: {
        include: {
          assetClusters: {
            include: {
              assetSubClusters: true,
            },
          },
        },
      },
    },
    orderBy: {
      code: "asc",
    },
  });
}

/* =========================
 GET SUB CLUSTER DETAIL
(for item mapping)
========================= */

export async function getSubClusterById(id: string) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const orgId = session.session?.activeOrganizationId;
  if (!orgId) throw new Error("No active organization");

  return prisma.assetSubCluster.findFirst({
    where: {
      id,
      assetCluster: { assetCategory: { assetGroup: { organizationId: orgId } } }, // Security Fix
    },
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
  });
}

/* =========================
 SUBCLUSTER UPDATE
========================= */

export async function updateAssetSubCluster(id: string, formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const orgId = session.session?.activeOrganizationId;
  if (!orgId) throw new Error("No active organization");

  const name = formData.get("name")?.toString()?.trim();
  if (!name) throw new Error("Nama wajib diisi");

  const existing = await prisma.assetSubCluster.findFirst({
    where: {
      id,
      assetCluster: { assetCategory: { assetGroup: { organizationId: orgId } } },
    },
  });

  if (!existing) throw new Error("Sub cluster not found");

  const updated = await prisma.$transaction(async (tx) => {
    try {
      const result = await tx.assetSubCluster.update({
        where: { id },
        data: {
          code: formData.get("code")?.toString(),
          name,
          description: formData.get("description")?.toString(),
          notes: formData.get("notes")?.toString(),
        },
      });

      await createAuditLog({
        userId: session.user.id,
        organizationId: orgId,
        action: "UPDATE",
        entityType: "ASSET_SUB_CLUSTER",
        entityId: id,
        entityInfo: result.name,
        details: { oldData: existing, newData: result },
        tx,
      });

      return result;
    } catch (err: any) {
      if (err.code === "P2002") throw new Error("Kode sudah dipakai oleh data lain");
      throw err;
    }
  });

  revalidatePath("/master/asset-classification");

  return updated;
}

/* =========================
 SUBCLUSTER DELETE
========================= */

export async function deleteAssetSubCluster(id: string) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const orgId = session.session?.activeOrganizationId;
  if (!orgId) throw new Error("No active organization");

  const deleted = await prisma.$transaction(async (tx) => {
    const existing = await tx.assetSubCluster.findFirst({
      where: {
        id,
        assetCluster: { assetCategory: { assetGroup: { organizationId: orgId } } },
      },
    });

    if (!existing) throw new Error("Sub cluster not found");

    try {
      const result = await tx.assetSubCluster.delete({
        where: { id },
      });

      await createAuditLog({
        userId: session.user.id,
        organizationId: orgId,
        action: "DELETE",
        entityType: "ASSET_SUB_CLUSTER",
        entityId: id,
        entityInfo: result.name,
        details: { deletedData: result },
        tx,
      });

      return result;
    } catch (err: any) {
      if (err.code === "P2003") {
        throw new Error("Gagal menghapus: Masih ada data yang terhubung dengan sub-klaster ini.");
      }
      throw err;
    }
  });

  revalidatePath("/master/asset-classification");

  return deleted;
}

export async function importAssetExcel(formData: FormData, organizationId: string) {
  try {
    const file = formData.get("file") as File;
    if (!file) return { error: "File tidak ditemukan" };

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert ke JSON
    const rows = XLSX.utils.sheet_to_json(worksheet);

    for (const row of rows as any[]) {
      // Mapping kolom Excel ke variabel (Sesuaikan nama kolom jika berbeda di file asli)
      const groupCode = row["Golongan Aset"]?.toString();
      const categoryCode = row["Bidang/Kategori Aset"]?.toString();
      const clusterCode = row["Kelompok Aset"]?.toString();
      const subClusterCode = row["Sub. Kelompok Aset"]?.toString();
      const name = row["Uraian"]?.toString();
      const notes = row["Keterangan"]?.toString();

      if (!groupCode || !name) continue; // Skip jika data minimal tidak ada

      // 1. Simpan ke AssetGroup (Golongan)
      // Gunakan upsert berdasarkan @@unique([organizationId, code])
      const group = await prisma.assetGroup.upsert({
        where: {
          organizationId_code: { organizationId, code: groupCode }
        },
        update: {}, // Biarkan jika sudah ada, atau update name: name
        create: {
          code: groupCode,
          name: name,
          organizationId: organizationId
        }
      });

      // 2. Simpan ke AssetCategory (Bidang) jika ada kodenya
      if (categoryCode) {
        const category = await prisma.assetCategory.upsert({
          where: {
            assetGroupId_code: { assetGroupId: group.id, code: categoryCode }
          },
          update: {},
          create: {
            code: categoryCode,
            name: name,
            assetGroupId: group.id
          }
        });

        // 3. Simpan ke AssetCluster (Kelompok) jika ada kodenya
        if (clusterCode) {
          const cluster = await prisma.assetCluster.upsert({
            where: {
              assetCategoryId_code: { assetCategoryId: category.id, code: clusterCode }
            },
            update: {},
            create: {
              code: clusterCode,
              name: name,
              assetCategoryId: category.id
            }
          });

          // 4. Simpan ke AssetSubCluster (Sub Kelompok)
          if (subClusterCode) {
            await prisma.assetSubCluster.upsert({
              where: {
                assetClusterId_code: { assetClusterId: cluster.id, code: subClusterCode }
              },
              update: {
                notes: notes,
                name: name // Update nama jika ada perubahan di Excel
              },
              create: {
                code: subClusterCode,
                name: name,
                notes: notes,
                assetClusterId: cluster.id
              }
            });
          }
        }
      }
    }

    return { success: "Data berhasil diimport" };
  } catch (error) {
    console.error("IMPORT_ERROR:", error);
    return { error: "Gagal memproses file" };
  }
}