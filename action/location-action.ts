"use server";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/logger";

/* =======================
   TYPES
 ======================= */
export type LocationArgs = {
  page: number;
  pageSize: number;
};

/* =======================
   GET ALL LOCATIONS
 ======================= */
export async function getAllLocations({ page, pageSize }: LocationArgs) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organizationId found");

  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const skip = (safePage - 1) * safePageSize;
  const take = safePageSize;

  const [data, total] = await Promise.all([
    prisma.location.findMany({
      where: { organizationId: activeOrgId },
      skip,
      take,
      orderBy: {
        name: "asc",
      },
    }),
    prisma.location.count({
      where: { organizationId: activeOrgId },
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
   CREATE LOCATION
 ======================= */
export async function createLocation(formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organizationId found");

  const name = formData.get("name")?.toString();

  if (!name) {
    throw new Error("Required fields are missing");
  }

  const location = await prisma.location.create({
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
    entityType: "LOCATION",
    entityId: location.id,
    entityInfo: location.name,
    details: {
      newData: location,
    },
  });

  revalidatePath("/assets/locations");
  return location;
}

/* =======================
   UPDATE LOCATION
 ======================= */
export async function updateLocation(id: string, formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organizationId found");

  const location = await prisma.location.findFirst({
    where: {
      id,
      organizationId: activeOrgId,
    },
  });

  if (!location) throw new Error("Location not found");
  const name = formData.get("name")?.toString();

  if (!id || !name) {
    throw new Error("Required fields are missing");
  }

  const updated = await prisma.location.update({
    where: {
      id,
    },
    data: {
      name: formData.get("name")?.toString() ?? location.name,
    },
  });

  // Record Audit Log
  await createAuditLog({
    userId: session.user.id,
    organizationId: activeOrgId,
    action: "UPDATE",
    entityType: "LOCATION",
    entityId: id,
    entityInfo: updated.name,
    details: {
      newData: updated,
    },
  });

  revalidatePath("/assets/locations");
  return updated;
}

/* =======================
   DELETE LOCATION
 ======================= */
export async function deleteLocation(id: string) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organizationId found");

  const location = await prisma.location.delete({
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
    entityType: "LOCATION",
    entityId: id,
    entityInfo: location.name,
    details: {
      deletedData: location,
    },
  });

  revalidatePath("/assets/locations");
  return location;
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
