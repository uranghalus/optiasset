"use server";

import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/logger";

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
  if (!session) throw new Error("Unauthorized");

  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const skip = (safePage - 1) * safePageSize;
  const take = safePageSize;

  const [data, total] = await Promise.all([
    prisma.item.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { assets: true },
        },
      },
    }),
    prisma.item.count(),
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
  if (!session) throw new Error("Unauthorized");

  return prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

/* =======================
   HELPERS
 ======================= */
export async function getNextItemCode(assetType: "FIXED" | "SUPPLY") {
  const prefix = assetType === "FIXED" ? "F-ITM-" : "S-ITM-";

  const lastItem = await prisma.item.findFirst({
    where: {
      code: {
        startsWith: prefix,
      },
    },
    orderBy: {
      code: "desc",
    },
  });

  let nextNumber = 1;
  if (lastItem) {
    // Extract number from code (e.g., F-ITM-001 -> 001)
    const match = lastItem.code.slice(prefix.length);
    const parsed = parseInt(match, 10);
    if (!isNaN(parsed)) {
      nextNumber = parsed + 1;
    }
  }

  return `${prefix}${nextNumber.toString().padStart(3, "0")}`;
}

/* =======================
   CREATE ITEM
 ======================= */
export async function createItem(formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const name = formData.get("name")?.toString();
  const assetType = formData.get("assetType")?.toString() as
    | "FIXED"
    | "SUPPLY"
    | undefined;

  if (!name || !assetType) {
    throw new Error("Required fields are missing");
  }

  // Generate code if not provided or empty
  let code = formData.get("code")?.toString();
  if (!code || code.trim() === "" || code === "AUTO") {
    code = await getNextItemCode(assetType);
  }

  try {
    const item = await prisma.item.create({
      data: {
        code,
        name,
        assetType,
        categoryId: formData.get("categoryId")?.toString() || null,
        brand: formData.get("brand")?.toString() || null,
        model: formData.get("model")?.toString() || null,
        partNumber: formData.get("partNumber")?.toString() || null,
        description: formData.get("description")?.toString() || null,
        createdBy: session.user.id,
      },
    });

    // Record Audit Log
    await createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      entityType: "ITEM",
      entityId: item.id,
      entityInfo: `${item.code} - ${item.name}`,
      details: {
        newData: item,
      },
    });

    revalidatePath("/assets/items");
    return item;
  } catch (error: any) {
    if (error?.code === "P2002") {
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
  if (!session) throw new Error("Unauthorized");

  const item = await prisma.item.findFirst({ where: { id } });
  if (!item) throw new Error("Item not found");

  try {
    const updated = await prisma.item.update({
      where: { id },
      data: {
        code: formData.get("code")?.toString() ?? item.code,
        name: formData.get("name")?.toString() ?? item.name,
        assetType:
          (formData.get("assetType")?.toString() as "FIXED" | "SUPPLY") ??
          item.assetType,
        categoryId: formData.get("categoryId")?.toString() || item.categoryId,
        brand: formData.get("brand")?.toString() || item.brand,
        model: formData.get("model")?.toString() || item.model,
        partNumber: formData.get("partNumber")?.toString() || item.partNumber,
        description:
          formData.get("description")?.toString() || item.description,
        updatedBy: session.user.id,
        updatedAt: new Date(),
      },
    });

    // Record Audit Log
    await createAuditLog({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "ITEM",
      entityId: id,
      entityInfo: `${updated.code} - ${updated.name}`,
      details: {
        newData: updated,
      },
    });

    revalidatePath("/assets/items");
    return updated;
  } catch (error: any) {
    if (error?.code === "P2002") {
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
  if (!session) throw new Error("Unauthorized");

  const item = await prisma.item.delete({ where: { id } });

  // Record Audit Log
  await createAuditLog({
    userId: session.user.id,
    action: "DELETE",
    entityType: "ITEM",
    entityId: id,
    entityInfo: `${item.code} - ${item.name}`,
    details: {
      deletedData: item,
    },
  });

  revalidatePath("/assets/items");
  return item;
}
