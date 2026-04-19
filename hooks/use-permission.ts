'use client';

import { usePermissionContext } from '@/context/permission-provider';
import type { Resource, Action } from '@/lib/permission-type';

export function usePermission() {
  const permissionMap = usePermissionContext();

  function can<T extends Resource>(resource: T, actions: Action<T>[]) {
    if (!permissionMap) return false; // 🔥 penting

    const allowed = permissionMap[resource] ?? [];
    return actions.every((a) => allowed.includes(a));
  }

  return {
    can,
    permissionMap, // 👈 ini yang kamu cari
    loading: !permissionMap,
  };
}
