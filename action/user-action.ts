"use server";

import { auth } from "@/lib/auth";
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

      // optional search
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

  /**
   * ⚠️ tergantung API kamu:
   * - kalau ada total → pakai itu
   * - kalau tidak → fallback length
   */
  const total = users?.total;

  return {
    data: users?.users ?? users, // fleksibel
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
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

  const data = await auth.api.createUser({
    body: {
      email,
      password,
      name,
      role,
      data: {},
    },
  });

  revalidatePath("/users");
  return data;
}
//LINK update user
export async function updateUserAction(id: string, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  const name = formData.get("name") as string;

  const data = await auth.api.adminUpdateUser({
    body: {
      userId: id,
      data: {
        name,
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
