"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type GetMembersParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getAllMembers({
  page = 1,
  limit = 10,
  search,
}: GetMembersParams) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  const organization = session.session.activeOrganizationId;
  if (!organization) throw new Error("Organization not found");

  const offset = (page - 1) * limit;

  // Let's use Prisma to get robust relations
  const whereClause: any = {
    organizationId: organization,
  };

  if (search) {
    whereClause.user = {
      name: { contains: search },
    };
  }

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            department: true,
            divisi: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.member.count({ where: whereClause }),
  ]);

  return {
    data: members,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function createMemberAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");
  const organization = session.session.activeOrganizationId;
  if (!organization) throw new Error("Organization not found");

  const userId = formData.get("userId") as string;
  const role = formData.get("role") as string;

  if (!userId || !role) throw new Error("User and Role are required");

  const data = await auth.api.addMember({
    body: {
      userId,
      role: role || ("member" as any),
      organizationId: organization,
    },
    headers: await headers(),
  });

  // Update custom fields natively with prisma
  await prisma.member.updateMany({
    where: { userId, organizationId: organization },
    data: {
      role: role, // ensure comma separated roles are saved properly if better-auth messes it up
    },
  });

  revalidatePath("/members");
  return data;
}

export async function updateMemberAction(id: string, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");
  const organization = session.session.activeOrganizationId;
  if (!organization) throw new Error("Organization not found");

  const role = formData.get("role") as string;
  const departmentId = formData.get("departmentId") as string | null;
  const divisiId = formData.get("divisiId") as string | null;

  // Update directly using Prisma to capture custom fields
  const updated = await prisma.member.update({
    where: { id },
    data: {
      role,
    },
  });

  revalidatePath("/members");
  return updated;
}

export async function deleteMemberAction(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");
  const organization = session.session.activeOrganizationId;
  if (!organization) throw new Error("Organization not found");

  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) throw new Error("Member not found");

  const data = await auth.api.removeMember({
    body: {
      memberIdOrEmail: member.id,
      organizationId: organization,
    },
    headers: await headers(),
  });

  revalidatePath("/members");
  return data;
}
