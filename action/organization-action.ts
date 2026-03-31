"use server";

import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { nanoid } from "nanoid";

type GetOrganizationsArgs = {
  page: number;
  pageSize: number;
};

export async function getOrganizations({
  page,
  pageSize,
}: GetOrganizationsArgs) {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  const total = organizations.length;
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);

  const start = (safePage - 1) * safePageSize;
  const end = start + safePageSize;

  return {
    data: organizations.slice(start, end),
    total,
    pageCount: Math.ceil(total / safePageSize),
    page: safePage,
    pageSize: safePageSize,
  };
}

export async function createOrganization(formData: FormData) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const data = await auth.api.createOrganization({
    body: {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      userId: session.user.id,
      keepCurrentActiveOrganization: false,
    },
    headers: await headers(),
  });

  revalidatePath("/organizations");
  return data;
}

export async function updateOrganization(
  organizationId: string,
  formData: FormData,
) {
  const data = await auth.api.updateOrganization({
    body: {
      data: {
        name: formData.get("name") as string,
        slug: formData.get("slug") as string,
      },
      organizationId,
    },
    headers: await headers(),
  });

  revalidatePath("/organizations");
  return data;
}

export async function deleteOrganization(organizationId: string) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const data = await auth.api.deleteOrganization({
    body: { organizationId },
    headers: await headers(),
  });

  revalidatePath("/organizations");
  return data;
}

export async function deleteOrganizationsBulk(organizationIds: string[]) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  if (!organizationIds.length) return;

  await Promise.all(
    organizationIds.map(async (organizationId) =>
      auth.api.deleteOrganization({
        body: { organizationId },
        headers: await headers(),
      }),
    ),
  );

  revalidatePath("/organizations");
}

type getOrganizations = {
  organizationId: string;
  organizationSlug?: string;
  membersLimit?: number;
};

export async function getOrganizationDetail({
  organizationId,
  organizationSlug,
  membersLimit = 250,
}: getOrganizations) {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  return await auth.api.getFullOrganization({
    query: {
      organizationId,
      organizationSlug,
      membersLimit,
    },
    headers: await headers(),
  });
}

export async function getOrganizationsSimple() {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  return organizations.map((org) => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
  }));
}

/** Semua role yang valid dalam sistem */
export type OrgRole =
  | "owner"
  | "admin"
  | "member"
  | "manager"
  | "supervisor"
  | "staff_lapangan"
  | "staff_administrasi"
  | "finance_manager"
  | "staff_asset";

// export async function getActiveOrganizationWithRole() {
//   const session = await getServerSession();
//   if (!session) throw new Error("Unauthorized");

//   const userId = session.user.id;
//   const activeOrgId = session.session?.activeOrganizationId;

//   const employee = await prisma.karyawan.findUnique({
//     where: { userId },
//     select: {
//       organization_id: true,
//       department_id: true,
//     },
//   });

//   if (!employee?.organization_id && !activeOrgId) {
//     throw new Error("User is not bound to any organization");
//   }

//   const organizationId = activeOrgId || employee!.organization_id;
//   const departmentId = employee?.department_id ?? null;

//   const organization = await prisma.organization.findFirst({
//     where: {
//       id: organizationId,
//       deleted_at: null,
//     },
//   });

//   if (!organization) {
//     throw new Error("Organization not found or deleted");
//   }

//   const member = await prisma.member.findFirst({
//     where: {
//       organizationId,
//       userId,
//       deleted_at: null,
//     },
//   });

//   if (!member) {
//     throw new Error("You are not a member of this organization");
//   }

//   return {
//     organizationId,
//     departmentId,
//     role: member.role as OrgRole,
//     userId,
//   };
// }

// export async function setActiveOrganizationAction(organizationId: string) {
//   const session = await auth.api.getSession({
//     headers: await headers(),
//   });

//   if (!session?.user?.id) {
//     throw new Error("Unauthorized");
//   }

//   if ((session.user as { role?: string }).role === "super_admin") {
//     await auth.api.setActiveOrganization({
//       body: { organizationId },
//       headers: await headers(),
//     });
//     return { success: true };
//   }

//   const member = await prisma.member.findFirst({
//     where: {
//       organizationId,
//       userId: session.user.id,
//       deleted_at: null,
//     },
//     select: {
//       role: true,
//     },
//   });

//   if (!member) {
//     throw new Error("Forbidden: Not a member of this organization");
//   }

//   if (member.role !== "owner") {
//     throw new Error(
//       "Forbidden: Hanya owner atau super admin yang dapat berpindah organisasi",
//     );
//   }

//   await auth.api.setActiveOrganization({
//     body: { organizationId },
//     headers: await headers(),
//   });

//   return { success: true };
// }

// export async function syncUserOrganization() {
//   const session = await auth.api.getSession({
//     headers: await headers(),
//   });

//   if (!session?.user?.id) return;

//   const userId = session.user.id;
//   const activeOrgId = session.session.activeOrganizationId;

//   if (activeOrgId) return;

//   const employee = await prisma.karyawan.findFirst({
//     where: {
//       userId,
//       deleted_at: null,
//     },
//     include: {
//       department: {
//         include: {
//           organization: true,
//         },
//       },
//     },
//   });

//   const organizationId = employee?.department?.organization?.id;

//   if (!organizationId) {
//     throw new Error("User is not bound to any organization");
//   }

//   const existingMember = await prisma.member.findFirst({
//     where: {
//       userId,
//       organizationId,
//       deleted_at: null,
//     },
//   });

//   if (!existingMember) {
//     await prisma.member.create({
//       data: {
//         id: nanoid() as unknown as string,
//         userId,
//         organizationId,
//         role: "member",
//       },
//     });
//   }

//   await auth.api.setActiveOrganization({
//     body: { organizationId },
//     headers: await headers(),
//   });
// }
