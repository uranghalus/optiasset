"use client";

import * as React from "react";
import { useEffect } from "react";
import { ChevronsUpDown, Building2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { Skeleton } from "./ui/skeleton";
import { useRouter } from "next/navigation";
import { useOrganizations } from "@/hooks/crud/use-organizations";

export function OrganizationSwitcher() {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const { data: activeOrg, isPending: isPendingActive } =
    authClient.useActiveOrganization();
  const { data: organizationsData, isPending: isPendingList } = useOrganizations({
    page: 1,
    pageSize: 1000,
  });

  const organizations = organizationsData?.data || [];

  const isPending = isPendingActive || isPendingList;

  async function handleSwitch(organizationId: string) {
    await authClient.organization.setActive({
      organizationId,
    });
    router.refresh();
  }

  useEffect(() => {
    if (
      !isPendingActive &&
      !isPendingList &&
      !activeOrg &&
      organizations &&
      organizations.length > 0
    ) {
      handleSwitch(organizations[0].id);
    }
  }, [activeOrg, organizations, isPendingActive, isPendingList]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isPending}>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {isPending ? (
                <div className="flex items-center space-x-3 w-full">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Building2 className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {activeOrg?.name || "Select Organization"}
                    </span>
                    <span className="truncate text-xs">
                      {activeOrg?.slug || "Click to select"}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "bottom"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organizations
            </DropdownMenuLabel>
            {organizations?.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleSwitch(org.id)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <Building2 className="size-4 shrink-0" />
                </div>
                <div className="font-medium text-sm">{org.name}</div>
                {activeOrg?.id === org.id && (
                  <span className="ml-auto text-xs font-mono">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
