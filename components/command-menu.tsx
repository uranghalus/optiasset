"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronRight,
  Laptop,
  Moon,
  Sun,
  Boxes,
  Package,
  User,
} from "lucide-react";
import { useSearch } from "@/context/search-provider";
import { globalSearch, SearchResult } from "@/action/search-action";
import { useDebounce } from "@/hooks/use-debounce";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { ScrollArea } from "./ui/scroll-area";
import { useTheme } from "@/context/theme-provider";
import { sidebarData } from "@/config/sidebar-data";

export function CommandMenu() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { open, setOpen } = useSearch();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const debouncedQuery = useDebounce(query, 300);

  React.useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const data = await globalSearch(debouncedQuery);
        setResults(data);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false);
      setQuery("");
      command();
    },
    [setOpen],
  );

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "ASSET":
        return <Boxes className="mr-2 h-4 w-4" />;
      case "ITEM":
        return <Package className="mr-2 h-4 w-4" />;
      case "EMPLOYEE":
        return <User className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Type a command or search..."
        onValueChange={setQuery}
      />
      <CommandList>
        <ScrollArea type="hover" className="h-72 pe-1">
          <CommandEmpty>
            {isLoading ? "Searching..." : "No results found."}
          </CommandEmpty>

          {results.length > 0 && (
            <CommandGroup heading="Results">
              {results.map((item) => (
                <CommandItem
                  key={`${item.type}-${item.id}`}
                  value={`${item.type}-${item.title}`}
                  onSelect={() => {
                    runCommand(() => router.push(item.url));
                  }}
                >
                  {getIcon(item.type)}
                  <div className="flex flex-col">
                    <span>{item.title}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {item.subtitle}
                    </span>
                  </div>
                </CommandItem>
              ))}
              <CommandSeparator />
            </CommandGroup>
          )}

          {sidebarData.navGroups.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((navItem, i) => {
                if (navItem.url)
                  return (
                    <CommandItem
                      key={`${navItem.url}-${i}`}
                      value={navItem.title}
                      onSelect={() => {
                        runCommand(() => router.push(navItem.url));
                      }}
                    >
                      <div className="flex size-4 items-center justify-center">
                        <ArrowRight className="text-muted-foreground/80 size-2" />
                      </div>
                      {navItem.title}
                    </CommandItem>
                  );

                return navItem.items?.map((subItem, i) => (
                  <CommandItem
                    key={`${navItem.title}-${subItem.url}-${i}`}
                    value={`${navItem.title}-${subItem.url}`}
                    onSelect={() => {
                      runCommand(() => router.push(subItem.url));
                    }}
                  >
                    <div className="flex size-4 items-center justify-center">
                      <ArrowRight className="text-muted-foreground/80 size-2" />
                    </div>
                    {navItem.title} <ChevronRight /> {subItem.title}
                  </CommandItem>
                ));
              })}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <Sun /> <span>Light</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <Moon className="scale-90" />
              <span>Dark</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
              <Laptop />
              <span>System</span>
            </CommandItem>
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  );
}
