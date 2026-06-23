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
        "z-50 h-16 transition-all duration-300 backdrop-blur-xl bg-background/70",
        fixed && "sticky top-0 w-full",
        isScrolled
          ? "shadow-lg border-b border-border/50"
          : "shadow-none border-b border-transparent",
        className,
      )}
      {...props}
    >
      <div
        className={cn("relative flex h-full items-center gap-3 p-4 sm:gap-4")}
      >
        <SidebarTrigger variant="ghost" className="max-md:scale-125 rounded-lg" />
        <Separator orientation="vertical" className="h-6" />
        {/* <Search /> */}
        {/* <NotificationCenter /> */}
        {children}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </header>
  );
}
