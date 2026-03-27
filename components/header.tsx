"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
// import { Search } from "./search";
// import { NotificationCenter } from "./notification-center";

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean;
};

export function Header({ className, fixed, children, ...props }: HeaderProps) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY || 0);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isScrolled = offset > 10 && fixed;

  return (
    <header
      className={cn(
        "z-50 h-16 transition-shadow duration-300",
        fixed && "sticky top-0 w-full",
        isScrolled
          ? "shadow-md backdrop-blur-md bg-background/80"
          : "shadow-none",
        className,
      )}
      {...props}
    >
      <div
        className={cn("relative flex h-full items-center gap-3 p-4 sm:gap-4")}
      >
        <SidebarTrigger variant="outline" className="max-md:scale-125" />
        <Separator orientation="vertical" className="h-6" />
        {/* <Search /> */}
        {/* <NotificationCenter /> */}
        {children}
      </div>
    </header>
  );
}
