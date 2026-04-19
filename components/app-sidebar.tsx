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
import { NavUser } from "./nav-user";
import { OrganizationSwitcher } from "./organization-switcher";

import { usePermission } from "@/hooks/use-permission";
import type { NavItem } from "@/types";
import type { Resource, Action } from "@/lib/permission-type";

//
// 🔥 TYPE untuk function can()
//
type CanFunction = <T extends Resource>(
  resource: T,
  actions: Action<T>[]
) => boolean;

//
// 🔥 CHECK PERMISSION
//
function isAllowedByPermission(item: NavItem, can: CanFunction): boolean {
  if (!item.permission) return true;

  return can(item.permission.resource as Resource, item.permission.actions as Action<Resource>[]);
}

//
// 🔥 FILTER ITEM (recursive)
//
function filterItems(items: NavItem[], can: CanFunction): NavItem[] {
  return items
    .filter((item) => isAllowedByPermission(item, can))
    .map((item) => {
      if (item.items) {
        return {
          ...item,
          items: filterItems(item.items, can),
        };
      }
      return item;
    })
    .filter((item) => !item.items || item.items.length > 0);
}

//
// 🔥 MAIN COMPONENT
//
export function AppSidebar() {
  const { collapsible, variant } = useLayout();
  const { can, loading } = usePermission();

  // ⛔ Hindari flicker
  if (loading) return null;

  //
  // 🔥 FILTER GROUP + ITEMS
  //
  const visibleNavGroups = sidebarData.navGroups
    .map((group) => ({
      ...group,
      items: filterItems(group.items, can),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      {/* ================= HEADER ================= */}
      <SidebarHeader>
        <OrganizationSwitcher />
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