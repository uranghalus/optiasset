import { Main } from "@/components/main";
import { Separator } from "@/components/ui/separator";
import {
  UserCog,
  Wrench,
  Sliders,
  Palette,
  FileInput,
  Workflow,
} from "lucide-react";
import React, { ReactNode } from "react";
import { SidebarNav } from "./components/sidebarnav";

interface Props {
  children: ReactNode;
}

export default function SettingLayout({ children }: Props) {
  const sidebarNavItems = [
    {
      title: "Profil",
      href: "/settings/profile",
      icon: <UserCog size={18} />,
    },
    {
      title: "Akun",
      href: "/settings/account",
      icon: <Wrench size={18} />,
    },
    {
      title: "Tampilan",
      href: "/settings/appearance",
      icon: <Palette size={18} />,
    },
    // {
    //   title: "Preferensi",
    //   href: "/settings/preferences",
    //   icon: <Sliders size={18} />,
    // },
  ];

  return (
    <Main fixed>
      <div className="space-y-1 border-b border-border/50 pb-4">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Pengaturan
        </h1>
        <p className="text-muted-foreground">
          Kelola pengaturan akun dan preferensi aplikasi Anda.
        </p>
      </div>

      <Separator className="my-4 lg:my-6" />

      <div className="flex flex-1 flex-col space-y-2 overflow-auto md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12">
        <aside className="top-0 lg:sticky lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>

        {/* ===== Content replaces <Outlet /> ===== */}
        <div className="flex w-full overflow-y-auto p-1">{children}</div>
      </div>
    </Main>
  );
}
