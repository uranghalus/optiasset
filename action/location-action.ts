"use server";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const skip = (safePage - 1) * safePageSize;
  const take = safePageSize;

  const [data, total] = await Promise.all([
    prisma.location.findMany({
      skip,
      take,
      orderBy: {
        name: "asc",
      },
      // Removed _count as location doesn't have explicit opposite relation yet
    }),
    prisma.location.count(),
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

  const name = formData.get("name")?.toString();

  if (!name) {
    throw new Error("Required fields are missing");
  }
  const location = await prisma.location.create({
    data: {
      name,
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
  const location = await prisma.location.findFirst({
    where: {
      id,
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
  revalidatePath("/assets/locations");
  return updated;
}

/* =======================
   DELETE LOCATION
 ======================= */
export async function deleteLocation(id: string) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const location = await prisma.location.delete({
    where: {
      id,
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

  return prisma.location.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
