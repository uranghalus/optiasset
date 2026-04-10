"use server";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/logger";

/* =======================
   TYPES
 ======================= */
export type AssetCategoryArgs = {
  page: number;
  pageSize: number;
};

/* =======================
   GET ALL CATEGORIES
 ======================= */
export async function getAllCategories({ page, pageSize }: AssetCategoryArgs) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organizationId found");

  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const skip = (safePage - 1) * safePageSize;
  const take = safePageSize;

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where: { organizationId: activeOrgId },
      skip,
      take,
      orderBy: {
        name: "asc",
      },
      include: {
        items: {
          select: {
            _count: {
              select: {
                assets: true,
              },
            },
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
    }),
    prisma.category.count({
      where: { organizationId: activeOrgId },
    }),
  ]);

  // Aggregate asset counts from items
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
  if (!session) throw new Error("Unauthorized");
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organizationId found");

  const name = formData.get("name")?.toString();

  if (!name) {
    throw new Error("Required fields are missing");
  }

  const category = await prisma.category.create({
    data: {
      name,
      organizationId: activeOrgId,
    },
  });

  // Record Audit Log
  await createAuditLog({
    userId: session.user.id,
    organizationId: activeOrgId,
    action: "CREATE",
    entityType: "CATEGORY",
    entityId: category.id,
    entityInfo: category.name,
    details: {
      newData: category,
    },
  });

  revalidatePath("/assets/categories");
  return category;
}

/* =======================
   UPDATE CATEGORY
 ======================= */
export async function updateCategory(id: string, formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organizationId found");

  const category = await prisma.category.findFirst({
    where: {
      id,
      organizationId: activeOrgId,
    },
  });

  if (!category) throw new Error("Category not found");
  const name = formData.get("name")?.toString();

  if (!id || !name) {
    throw new Error("Required fields are missing");
  }

  const updated = await prisma.category.update({
    where: {
      id,
    },
    data: {
      name: formData.get("name")?.toString() ?? category.name,
    },
  });

  // Record Audit Log
  await createAuditLog({
    userId: session.user.id,
    organizationId: activeOrgId,
    action: "UPDATE",
    entityType: "CATEGORY",
    entityId: id,
    entityInfo: updated.name,
    details: {
      newData: updated,
    },
  });

  revalidatePath("/assets/categories");
  return updated;
}

/* =======================
   DELETE CATEGORY
 ======================= */
export async function deleteCategory(id: string) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organizationId found");

  const category = await prisma.category.delete({
    where: {
      id,
      organizationId: activeOrgId,
    },
  });

  // Record Audit Log
  await createAuditLog({
    userId: session.user.id,
    organizationId: activeOrgId,
    action: "DELETE",
    entityType: "CATEGORY",
    entityId: id,
    entityInfo: category.name,
    details: {
      deletedData: category,
    },
  });

  revalidatePath("/assets/categories");
  return category;
}
