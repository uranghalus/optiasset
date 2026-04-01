"use server";

import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

/* =======================
   TYPES
 ======================= */
export type DepartmentArgs = {
  page: number;
  pageSize: number;
};

/* =======================
   GET ALL DEPARTMENTS
 ======================= */
export async function getAllDepartments({ page, pageSize }: DepartmentArgs) {
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
    prisma.department.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.department.count({ where }),
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
   CREATE DEPARTMENT
 ======================= */
export async function createDepartment(formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organization");

  const kode_department = formData.get("kode_department")?.toString();
  const nama_department = formData.get("nama_department")?.toString();
  const id_hod = formData.get("id_hod")?.toString();

  if (!kode_department || !nama_department || !id_hod) {
    throw new Error("Required fields are missing");
  }

  try {
    const department = await prisma.department.create({
      data: {
        id_department: nanoid(),
        organization_id: activeOrgId,
        kode_department,
        nama_department,
        id_hod,
        updatedAt: new Date(),
      },
    });
    revalidatePath("/assets/departments");
    return department;
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new Error(
        `Kode department "${kode_department}" sudah digunakan di organisasi ini.`,
      );
    }
    throw error;
  }
}

/* =======================
   UPDATE DEPARTMENT
 ======================= */
export async function updateDepartment(id: string, formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organization");

  const department = await prisma.department.findFirst({
    where: {
      id_department: id,
      organization_id: activeOrgId,
    },
  });

  if (!department) throw new Error("Department not found");

  const kode_department =
    formData.get("kode_department")?.toString() ?? department.kode_department;
  const nama_department =
    formData.get("nama_department")?.toString() ?? department.nama_department;
  const id_hod = formData.get("id_hod")?.toString() ?? department.id_hod;

  const updated = await prisma.department.update({
    where: {
      id_department: id,
    },
    data: {
      kode_department,
      nama_department,
      id_hod,
      updatedAt: new Date(),
    },
  });
  revalidatePath("/assets/departments");
  return updated;
}

/* =======================
   DELETE DEPARTMENT
 ======================= */
export async function deleteDepartment(id: string) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const activeOrgId = session.session?.activeOrganizationId;
  if (!activeOrgId) throw new Error("No active organization");

  const department = await prisma.department.delete({
    where: {
      id_department: id,
      organization_id: activeOrgId,
    },
  });
  revalidatePath("/assets/departments");
  return department;
}
