/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { auth } from '@/lib/auth';
import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { BanUserInput, banUserSchema } from '@/schema/user-schema';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

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

  if (!session) throw new Error('Unauthorized');

  const offset = (page - 1) * limit;

  const users = await auth.api.listUsers({
    query: {
      limit,
      offset,

      ...(search && {
        searchValue: search,
        searchField: 'name',
        searchOperator: 'contains',
      }),

      sortBy: 'name',
      sortDirection: 'asc',
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
    typeof users?.total === 'number' ? users.total : userList.length;
  console.log('RAW USERS RESPONSE:', users);
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

  if (!session) throw new Error('Unauthorized');

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  });

  return users;
}
//LINK create user
export async function createUserAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error('Unauthorized');

  const email = formData.get('email') as string;
  const name = formData.get('name') as string;
  const password = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const role = formData.get('role') as any;
  const departmentId = formData.get('departmentId') as string;
  const divisiId = formData.get('divisiId') as string;

  const data = await auth.api.createUser({
    body: {
      email,
      password,
      name,
      role: 'user',
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
  revalidatePath('/users');
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

  if (!session) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const role = formData.get('role') as any;
  const departmentId = formData.get('departmentId') as string;
  const divisiId = formData.get('divisiId') as string;
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

  revalidatePath('/users');
  return data;
}
// LINK remove user
export async function deleteUserAction(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error('Unauthorized');

  const data = await auth.api.removeUser({
    body: {
      userId: id,
    },
    headers: await headers(),
  });

  revalidatePath('/users');
  return data;
}
/* =======================
   GET USERS BY DEPARTMENT FOR SELECT
======================= */
export async function getUsersByDepartmentForSelect(departmentId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  if (!departmentId) return [];

  const users = await prisma.user.findMany({
    where: {
      departmentId,
      // optional jika multi tenant
      members: {
        some: {
          organizationId: session.session.activeOrganizationId as string,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return users.map((user) => ({
    label: user.name,
    value: user.id,
    email: user.email,
  }));
}
// LINK Multi Delet User
export async function deleteManyUser(ids: string[]) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');
  const deletePromises = ids.map(
    async (id) =>
      await auth.api.removeUser({
        body: { userId: id },
        headers: await headers(),
      }),
  );

  const results = await Promise.all(deletePromises);

  revalidatePath('/users');
  return results;
}
// LINK Multi Ban User
export async function banManyUser(ids: string[]) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');
  const banPromises = ids.map(
    async (id) =>
      await auth.api.banUser({
        body: { userId: id },
        headers: await headers(),
      }),
  );

  const results = await Promise.all(banPromises);

  revalidatePath('/users');
  return results;
}
// LINK Multi Unban User
export async function unbanManyUser(ids: string[]) {
  const session = await getServerSession();
  if (!session) throw new Error('Unauthorized');
  const unbanPromises = ids.map(
    async (id) =>
      await auth.api.unbanUser({
        body: { userId: id },
        headers: await headers(),
      }),
  );

  const results = await Promise.all(unbanPromises);

  revalidatePath('/users');
  return results;
}
// LINK Banned User
export async function bannedUser(id: string, data: BanUserInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error('Unauthorized');
  const parsedData = banUserSchema.safeParse(data);
  if (!parsedData.success) {
    return {
      error: 'Data tidak valid',
      details: parsedData.error,
    };
  }
  const { banReason, banExpiresInDays } = parsedData.data;
  // Konversi hari ke detik (Better Auth meminta format detik)
  // 60 detik * 60 menit * 24 jam * jumlah hari
  const banExpiresIn = banExpiresInDays
    ? 60 * 60 * 24 * banExpiresInDays
    : undefined;
  try {
    await auth.api.banUser({
      body: {
        userId: id,
        banReason: banReason,
        banExpiresIn: banExpiresIn,
      },
      headers: await headers(),
    });
    revalidatePath(`/users`);
    return { success: true, message: 'User berhasil dibanned.' };
  } catch (error: any) {
    console.error('Ban User Error:', error);
    return {
      error: error?.message || 'Terjadi kesalahan saat mem-banned user.',
    };
  }
}
// LINK Unbanned User
export async function unbanUser(id: string) {
  try {
    await auth.api.unbanUser({
      body: {
        userId: id,
      },
      headers: await headers(),
    });
    revalidatePath(`/users`);
    return { success: true, message: 'User berhasil di-unbanned.' };
  } catch (error: any) {
    console.error('Unban User Error:', error);
    return {
      error: error?.message || 'Terjadi kesalahan saat meng-unbanned user.',
    };
  }
}
