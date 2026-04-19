'use server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

type PermissionAction =
  | 'create'
  | 'delete'
  | 'update'
  | 'list'
  | 'view'
  | 'edit'
  | 'read';
export async function getAllRoles({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error('Unauthorized');

  const organization = session.session.activeOrganizationId;
  if (!organization) throw new Error('Organization not found');

  const roles = await auth.api.listOrgRoles({
    query: {
      organizationId: organization,
    },
    headers: await headers(),
  });

  // 🧠 Manual pagination
  const start = (page - 1) * limit;
  const end = start + limit;

  const paginatedRoles = roles.slice(start, end);

  return {
    data: paginatedRoles,
    pagination: {
      page,
      limit,
      total: roles.length,
      totalPages: Math.ceil(roles.length / limit),
    },
  };
}

export async function createOrganizationRole(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error('Unauthorized');
  const organization = session.session.activeOrganizationId;
  if (!organization) throw new Error('Organization not found');
  const name = formData.get('name') as string;
  const permissionsRaw = formData.get('permissions') as string;

  if (!permissionsRaw) {
    throw new Error('Permissions required');
  }

  if (!name) {
    throw new Error('Role name required');
  }

  // ✅ parse JSON dari form
  let permissions: Record<string, PermissionAction[]>;
  try {
    permissions = JSON.parse(permissionsRaw) as Record<
      string,
      PermissionAction[]
    >;
  } catch {
    throw new Error('Invalid permissions format');
  }

  // Validasi minimal ada satu permission
  const hasPermissions = Object.values(permissions).some(
    (actions) => actions.length > 0,
  );
  if (!hasPermissions) {
    throw new Error('Pilih minimal satu permission');
  }

  // Clean up empty permissions (remove keys dengan value array kosong)
  const cleanPermissions = Object.fromEntries(
    Object.entries(permissions).filter(([, actions]) => actions.length > 0),
  );

  console.log('Creating role with:', {
    role: name,
    permission: cleanPermissions,
    organizationId: organization,
  });

  const savedRoles = await auth.api.createOrgRole({
    body: {
      role: name,
      permission: cleanPermissions,
      organizationId: organization,
    },
    headers: await headers(),
  });
  revalidatePath('/roles');
  return savedRoles;
}

export async function updateOrganizationRole(id: string, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error('Unauthorized');
  const organization = session.session.activeOrganizationId;
  if (!organization) throw new Error('Organization not found');
  const role = formData.get('role') as string;
  const permissionsRaw = formData.get('permissions') as string;

  if (!permissionsRaw) {
    throw new Error('Permissions required');
  }

  if (!role) {
    throw new Error('Role name required');
  }

  // ✅ parse JSON dari form
  let permissions: Record<string, PermissionAction[]>;
  try {
    permissions = JSON.parse(permissionsRaw) as Record<
      string,
      PermissionAction[]
    >;
  } catch {
    throw new Error('Invalid permissions format');
  }

  // Validasi minimal ada satu permission
  const hasPermissions = Object.values(permissions).some(
    (actions) => actions.length > 0,
  );
  if (!hasPermissions) {
    throw new Error('Pilih minimal satu permission');
  }

  // Clean up empty permissions (remove keys dengan value array kosong)
  const cleanPermissions = Object.fromEntries(
    Object.entries(permissions).filter(([, actions]) => actions.length > 0),
  );

  console.log('Updating role with:', {
    roleId: id,
    roleName: role,
    organizationId: organization,
    permission: cleanPermissions,
  });

  const updatedRoles = await auth.api.updateOrgRole({
    body: {
      roleId: id,
      roleName: role,
      organizationId: organization,
      data: {
        permission: cleanPermissions,
      },
    },
    headers: await headers(),
  });
  revalidatePath('/roles');
  return updatedRoles;
}

export async function deleteOrganizationRole(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error('Unauthorized');
  const organization = session.session.activeOrganizationId;
  if (!organization) throw new Error('Organization not found');
  const role = await auth.api.deleteOrgRole({
    body: {
      roleId: id,
      organizationId: organization,
    },
    headers: await headers(),
  });
  revalidatePath('/roles');
  return role;
}
