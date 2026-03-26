// lib/require-permission.ts
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

type PermissionInput = {
  [resource: string]: string[];
};

export async function requirePermission(permissions: PermissionInput) {
  try {
    await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permissions,
      },
    });

    // jika lolos → berarti punya permission
    return true;
  } catch (error) {
    console.error('Permission denied:', error);
    throw new Error('Forbidden');
  }
}
