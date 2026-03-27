"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { Badge } from "@/components/ui/badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  type NavCollapsible,
  type NavItem,
  type NavLink,
  type NavGroup as NavGroupProps,
} from "@/types";

/**
 * Komponen utama untuk group navigasi sidebar
 */
export function NavGroup({ title, items }: NavGroupProps) {
  const { state, isMobile } = useSidebar();
  const pathname = usePathname();

  const label = title; // ✅ langsung pakai string

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${item.url}`;

          if (!item.items)
            return (
              <SidebarMenuLink key={key} item={item} pathname={pathname} />
            );

          if (state === "collapsed" && !isMobile)
            return (
              <SidebarMenuCollapsedDropdown
                key={key}
                item={item}
                pathname={pathname}
              />
            );

          return (
            <SidebarMenuCollapsible key={key} item={item} pathname={pathname} />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

/**
 * Badge kecil untuk item nav
 */
function NavBadge({ children }: { children: ReactNode }) {
  return <Badge className="rounded-full px-1 py-0 text-xs">{children}</Badge>;
}

/**
 * Item link biasa
 */
function SidebarMenuLink({
  item,
  pathname,
}: {
  item: NavLink;
  pathname: string;
}) {
  const { setOpenMobile } = useSidebar();
  const label = item.title;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={checkIsActive(pathname, item)}
        tooltip={label}
      >
        <Link href={item.url} onClick={() => setOpenMobile(false)}>
          {item.icon && <item.icon />}
          <span>{label}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/**
 * Item dengan submenu (expandable)
 */
function SidebarMenuCollapsible({
  item,
  pathname,
}: {
  item: NavCollapsible;
  pathname: string;
}) {
  const { setOpenMobile } = useSidebar();
  const label = item.title;

  return (
    <Collapsible
      asChild
      defaultOpen={checkIsActive(pathname, item, true)}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={label}>
            {item.icon && <item.icon />}
            <span>{label}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180" />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items.map((subItem) => {
              const subLabel = subItem.title;

              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={checkIsActive(pathname, subItem)}
                  >
                    <Link
                      href={subItem.url}
                      onClick={() => setOpenMobile(false)}
                    >
                      {subItem.icon && <subItem.icon />}
                      <span>{subLabel}</span>
                      {subItem.badge && (
                        <NavBadge>{subItem.badge}</NavBadge>
                      )}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

/**
 * Dropdown versi collapsed sidebar
 */
function SidebarMenuCollapsedDropdown({
  item,
  pathname,
}: {
  item: NavCollapsible;
  pathname: string;
}) {
  const label = item.title;

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={label}
            isActive={checkIsActive(pathname, item)}
          >
            {item.icon && <item.icon />}
            <span>{label}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="right" align="start" sideOffset={4}>
          <DropdownMenuLabel>
            {label} {item.badge ? `(${item.badge})` : ""}
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {item.items.map((sub) => {
            const subLabel = sub.title;

            return (
              <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
                <Link
                  href={sub.url}
                  className={
                    checkIsActive(pathname, sub) ? "bg-secondary" : ""
                  }
                >
                  {sub.icon && <sub.icon />}
                  <span className="max-w-52 text-wrap">{subLabel}</span>
                  {sub.badge && (
                    <span className="ms-auto text-xs">{sub.badge}</span>
                  )}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

/**
 * Fungsi helper untuk menentukan apakah link aktif
 */
function checkIsActive(pathname: string, item: NavItem, mainNav = false) {
  return (
    pathname === item.url ||
    pathname.split("?")[0] === item.url ||
    !!item?.items?.some((i) => i.url === pathname) ||
    (mainNav &&
      pathname.split("/")[1] !== "" &&
      pathname.split("/")[1] === item?.url?.split("/")[1])
  );
}