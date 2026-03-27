"use client";

import { useLayout } from "@/context/layout-provider";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar";

import { NavGroup } from "./nav-group";


import { sidebarData } from "@/config/sidebar-data";
import { authClient } from "@/lib/auth-client";
import type { NavItem } from "@/types";
import { NavUser } from "./nav-user";

/**
 * Cek apakah satu item/group diperbolehkan tampil berdasarkan role user.
 */
function isAllowed(
    roles: string[] | undefined,
    userRole: string | undefined,
): boolean {
    if (!roles || roles.length === 0) return true;
    if (!userRole) return false;
    return roles.includes(userRole);
}

/**
 * Filter item-item dalam satu group berdasarkan role user.
 */
function filterItems(
    items: NavItem[],
    userRole: string | undefined,
): NavItem[] {
    return items
        .filter((item) => isAllowed(item.roles, userRole))
        .map((item) => {
            if (item.items) {
                return { ...item, items: filterItems(item.items, userRole) };
            }
            return item;
        });
}

export function AppSidebar() {
    const { collapsible, variant } = useLayout();

    // ✅ Ambil session saja (tanpa organization)
    const { data: session } = authClient.useSession();

    // ✅ Role langsung dari user
    const userRole = session?.user?.role;

    // Filter navGroups
    const visibleNavGroups = sidebarData.navGroups
        .filter((group) => isAllowed(group.roles, userRole))
        .map((group) => ({
            ...group,
            items: filterItems(group.items, userRole),
        }))
        .filter((group) => group.items.length > 0);

    return (
        <Sidebar collapsible={collapsible} variant={variant}>
            {/* ================= HEADER ================= */}
            <SidebarHeader>
                {/* ❌ OrganizationSwitcher dihapus */}
            </SidebarHeader>

            {/* ================= CONTENT ================= */}
            <SidebarContent>
                {visibleNavGroups.map((group) => (
                    <NavGroup key={group.title} {...group} />
                ))}
            </SidebarContent>

            {/* ================= FOOTER ================= */}
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>

            {/* ================= COLLAPSE RAIL ================= */}
            <SidebarRail />
        </Sidebar>
    );
}