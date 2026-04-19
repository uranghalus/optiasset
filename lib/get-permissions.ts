'use server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { statement } from './auth-permission';

type PermissionMap = Record<string, string[]>;

export async function getPermissionMap(): Promise<PermissionMap> {
  const h = await headers();
  const result: PermissionMap = {};

  const checks: Promise<void>[] = [];

  for (const [resource, actions] of Object.entries(statement)) {
    for (const action of actions) {
      const check = auth.api
        .hasPermission({
          headers: h,
          body: {
            permissions: {
              [resource]: [action], // 🔥 per action
            },
          },
        })
        .then((res) => {
          if (res?.success) {
            if (!result[resource]) result[resource] = [];
            result[resource].push(action);
          }
        });

      checks.push(check);
    }
  }

  await Promise.all(checks);

  return result;
}
