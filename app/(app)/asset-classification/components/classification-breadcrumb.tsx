"use client";

import {
  ChevronRight,
  Home,
  Folder,
  Layers,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  id: string;
  name: string;
  code: string;
  level: string;
}

interface ClassificationBreadcrumbProps {
  path: BreadcrumbItem[];
  onNavigate: (index: number) => void;
}

const levelIcons: Record<string, typeof Folder> = {
  group: Folder,
  category: Layers,
  cluster: Package,
  subcluster: Package,
};

const levelColors: Record<string, string> = {
  group: "text-blue-600 dark:text-blue-400",
  category: "text-emerald-600 dark:text-emerald-400",
  cluster: "text-amber-600 dark:text-amber-400",
  subcluster: "text-purple-600 dark:text-purple-400",
};

export function ClassificationBreadcrumb({
  path,
  onNavigate,
}: ClassificationBreadcrumbProps) {
  return (
    <div className="flex items-center gap-1 px-4 py-2.5 border-b bg-muted/20 overflow-x-auto scrollbar-none">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-7 gap-1.5 px-2 text-xs shrink-0",
          path.length === 0
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground"
        )}
        onClick={() => onNavigate(-1)}
      >
        <Home className="h-3.5 w-3.5" />
        Golongan
      </Button>

      {path.map((item, index) => {
        const Icon = levelIcons[item.level] || Package;
        const isLast = index === path.length - 1;
        const colorClass = levelColors[item.level] || "";

        return (
          <div key={`${item.id}-${index}`} className="flex items-center gap-1 shrink-0">
            <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 gap-1.5 px-2 text-xs",
                isLast
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground"
              )}
              onClick={() => onNavigate(index)}
            >
              <Icon className={cn("h-3.5 w-3.5", colorClass)} />
              <span className="truncate max-w-[120px]">{item.name}</span>
            </Button>
          </div>
        );
      })}
    </div>
  );
}
