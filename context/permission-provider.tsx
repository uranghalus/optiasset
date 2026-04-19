"use client";

import { createContext, useContext } from "react";

export type PermissionMap = Record<string, string[]>;

// ❗ default null (biar ketahuan kalau belum inject)
export const PermissionContext = createContext<PermissionMap | null>(null);

export function PermissionProvider({
    permissionMap,
    children,
}: {
    permissionMap: PermissionMap;
    children: React.ReactNode;
}) {
    return (
        <PermissionContext.Provider value={permissionMap}>
            {children}
        </PermissionContext.Provider>
    );
}

export function usePermissionContext() {
    const ctx = useContext(PermissionContext);

    if (!ctx) {
        console.error("PermissionContext not found! Provider belum dipasang.");
    }

    return ctx;
}