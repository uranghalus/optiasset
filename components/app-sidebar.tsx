"use client";

import { useLayout } from "@/context/layout-provider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import { NavGroup } from "./nav-group";

import { sidebarData } from "@/config/sidebar-data";
import { authClient } from "@/lib/auth-client";
import type { NavItem } from "@/types";
import { NavUser } from "./nav-user";
import { Combine, GalleryVerticalEnd } from "lucide-react";

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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Combine className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">OptimaAsset</span>
                  <span className="">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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
