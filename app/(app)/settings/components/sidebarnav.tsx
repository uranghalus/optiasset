"use client";

import { useState, useEffect, type JSX } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SidebarItem = {
  href: string;
  title: string;
  icon: JSX.Element;
};

export interface SidebarNavProps {
  className?: string;
  items: SidebarItem[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [value, setValue] = useState<string>(pathname);

  useEffect(() => {
    setValue(pathname);
  }, [pathname]);

  const handleChange = (val: string) => {
    setValue(val);
    router.push(val);
  };

  return (
    <>
      {/* ================= Mobile (Select) ================= */}
      <div className="p-1 md:hidden">
        <Select value={value} onValueChange={handleChange}>
          <SelectTrigger className="h-12 w-full">
            <SelectValue placeholder="Pilih menu" />
          </SelectTrigger>

          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.href} value={item.href}>
                <div className="flex items-center gap-3">
                  <span className="scale-110">{item.icon}</span>
                  <span>{item.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ================= Desktop (Tabs) ================= */}
      <ScrollArea className="hidden md:block w-full min-w-40 px-1 py-2">
        <Tabs
          orientation="vertical"
          value={value}
          onValueChange={handleChange}
          className={cn("w-full", className)}
        >
          <TabsList className="flex h-auto w-full flex-col items-start gap-1 bg-transparent">
            {items.map((item) => (
              <TabsTrigger
                key={item.href}
                value={item.href}
                className={cn(
                  "w-full justify-start gap-2 px-3 py-2",
                  "data-[state=active]:bg-muted",
                  "data-[state=active]:text-foreground",
                )}
              >
                <span className="text-muted-foreground">{item.icon}</span>
                <span>{item.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </ScrollArea>
    </>
  );
}
