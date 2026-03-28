import { AppSidebar } from '@/components/app-sidebar'
import { Header } from '@/components/header'
import { Main } from '@/components/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switcher'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { ThemeProvider } from '@/context/theme-provider'
import { getServerSession } from '@/lib/get-session'
import { cn } from '@/lib/utils'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies()
    const sidebarState = cookieStore.get('sidebar_state')?.value
    const defaultOpen = sidebarState !== 'false'
    const session = await getServerSession()
    if (!session) redirect('/')
    return (
        <ThemeProvider>
            <SearchProvider>
                <LayoutProvider>
                    <SidebarProvider defaultOpen={defaultOpen}>
                        <AppSidebar />
                        <SidebarInset className={cn(
                            '@container/content',
                            'has-[[data-layout=fixed]]:h-svh',
                            'peer-data-[variant=inset]:has-[[data-layout=fixed]]:h-[calc(100svh-(var(--spacing)*4))]'
                        )}>
                            <Header>
                                <div className="ms-auto flex items-center space-x-4">
                                    <ThemeSwitch />
                                    <ProfileDropdown />
                                </div>
                            </Header>

                            <Main fluid>
                                {children}
                            </Main>
                        </SidebarInset>
                    </SidebarProvider>
                </LayoutProvider>
            </SearchProvider>
        </ThemeProvider>
    )
}
