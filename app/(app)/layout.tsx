import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { Main } from "@/components/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { ThemeSwitch } from "@/components/theme-switcher";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { LayoutProvider } from "@/context/layout-provider";
import { SearchProvider } from "@/context/search-provider";
import { ThemeProvider } from "@/context/theme-provider";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/get-session";
import { cn } from "@/lib/utils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar_state")?.value;
  const defaultOpen = sidebarState !== "false";
  const session = await getServerSession();
  if (!session) redirect("/");

  // Jika user belum memiliki active organization, auto-set ke org pertama yang dia miliki
  if (!session.session?.activeOrganizationId) {
    const requestHeaders = await headers();
    const organizations = await auth.api.listOrganizations({
      headers: requestHeaders,
    });
    if (organizations && organizations.length > 0) {
      await auth.api.setActiveOrganization({
        body: { organizationId: organizations[0].id },
        headers: requestHeaders,
      });
    }
  }

  return (
    <ThemeProvider>
      <SearchProvider>
        <LayoutProvider>
          <SidebarProvider defaultOpen={defaultOpen} className="print:block">
            <div className="print:hidden">
              <AppSidebar />
            </div>
            <SidebarInset
              className={cn(
                "@container/content",
                "has-[[data-layout=fixed]]:h-svh",
                "peer-data-[variant=inset]:has-[[data-layout=fixed]]:h-[calc(100svh-(var(--spacing)*4))]",
                "print:p-0 print:border-none",
              )}
            >
              <div className="print:hidden">
                <Header>
                  <div className="ms-auto flex items-center space-x-4">
                    <ThemeSwitch />
                    <ProfileDropdown />
                  </div>
                </Header>
              </div>

              <Main fluid>{children}</Main>
            </SidebarInset>
          </SidebarProvider>
        </LayoutProvider>
      </SearchProvider>
    </ThemeProvider>
  );
}
