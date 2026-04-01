"use server";

import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

/* =======================
   TYPES
 ======================= */
export type DivisiArgs = {
  page: number;
  pageSize: number;
};

/* =======================
   GET ALL DIVISI
 ======================= */
export async function getAllDivisi({ page, pageSize }: DivisiArgs) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organization");

  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const skip = (safePage - 1) * safePageSize;
  const take = safePageSize;

  const where = {
    organization_id: activeOrgId,
    deleted_at: null,
  };

  const [data, total] = await Promise.all([
    prisma.divisi.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        department: {
          select: {
            nama_department: true,
            kode_department: true,
          },
        },
      },
    }),
    prisma.divisi.count({ where }),
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
   GET DEPARTMENTS FOR SELECT
 ======================= */
export async function getDepartmentsForSelect() {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organization");

  return prisma.department.findMany({
    where: {
      organization_id: activeOrgId,
      deleted_at: null,
    },
    select: {
      id_department: true,
      nama_department: true,
      kode_department: true,
    },
    orderBy: { nama_department: "asc" },
  });
}

/* =======================
   CREATE DIVISI
 ======================= */
export async function createDivisi(formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organization");

  const department_id = formData.get("department_id")?.toString();
  const nama_divisi = formData.get("nama_divisi")?.toString();
  const ext_tlp = formData.get("ext_tlp")?.toString();

  if (!department_id || !nama_divisi || !ext_tlp) {
    throw new Error("Required fields are missing");
  }

  const divisi = await prisma.divisi.create({
    data: {
      id_divisi: nanoid(),
      organization_id: activeOrgId,
      department_id,
      nama_divisi,
      ext_tlp,
      updatedAt: new Date(),
    },
  });
  revalidatePath("/assets/divisi");
  return divisi;
}

/* =======================
   UPDATE DIVISI
 ======================= */
export async function updateDivisi(id: string, formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organization");

  const divisi = await prisma.divisi.findFirst({
    where: {
      id_divisi: id,
      organization_id: activeOrgId,
    },
  });

  if (!divisi) throw new Error("Divisi not found");

  const department_id =
    formData.get("department_id")?.toString() ?? divisi.department_id;
  const nama_divisi =
    formData.get("nama_divisi")?.toString() ?? divisi.nama_divisi;
  const ext_tlp = formData.get("ext_tlp")?.toString() ?? divisi.ext_tlp;

  const updated = await prisma.divisi.update({
    where: { id_divisi: id },
    data: {
      department_id,
      nama_divisi,
      ext_tlp,
      updatedAt: new Date(),
    },
  });
  revalidatePath("/assets/divisi");
  return updated;
}

/* =======================
   DELETE DIVISI
 ======================= */
export async function deleteDivisi(id: string) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organization");

  const divisi = await prisma.divisi.delete({
    where: {
      id_divisi: id,
      organization_id: activeOrgId,
    },
  });
  revalidatePath("/assets/divisi");
  return divisi;
}
