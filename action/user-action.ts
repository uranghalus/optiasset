"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

type GetUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getAllUsers({
  page = 1,
  limit = 10,
  search,
}: GetUsersParams) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  const offset = (page - 1) * limit;

  const users = await auth.api.listUsers({
    query: {
      limit,
      offset,

      ...(search && {
        searchValue: search,
        searchField: "name",
        searchOperator: "contains",
      }),

      sortBy: "name",
      sortDirection: "asc",
    },
    headers: await headers(),
  });

  // ✅ normalize data
  const userList = Array.isArray(users?.users)
    ? users.users
    : Array.isArray(users)
      ? users
      : [];

  // ✅ pastikan total aman
  const total =
    typeof users?.total === "number" ? users.total : userList.length;
  console.log("RAW USERS RESPONSE:", users);
  return {
    data: userList,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1, // 🔥 anti NaN
    },
  };
}

/* =======================
   GET USERS FOR SELECT
   ======================= */
export async function getUsersForSelect() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return users;
}
//LINK create user
export async function createUserAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as any;
  const departmentId = formData.get("departmentId") as string;
  const divisiId = formData.get("divisiId") as string;

  const data = await auth.api.createUser({
    body: {
      email,
      password,
      name,
      role: "user",
      data: {
        departmentId,
        divisiId,
      },
    },
  });
  const addMember = await auth.api.addMember({
    body: {
      userId: data.user.id,
      role: role, // required
      organizationId: session.session.activeOrganizationId ?? undefined,
    },
  });
  revalidatePath("/users");
  return {
    data,
    addMember,
  };
}
//LINK update user
export async function updateUserAction(id: string, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const role = formData.get("role") as any;
  const departmentId = formData.get("departmentId") as string;
  const divisiId = formData.get("divisiId") as string;
  const data = await auth.api.adminUpdateUser({
    body: {
      userId: id,
      data: {
        name,
        departmentId,
        divisiId,
        role,
      },
    },
    headers: await headers(),
  });

  revalidatePath("/users");
  return data;
}
// LINK remove user
export async function deleteUserAction(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  const data = await auth.api.removeUser({
    body: {
      userId: id,
    },
    headers: await headers(),
  });

  revalidatePath("/users");
  return data;
}
