"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Settings,
  Package,
  Key,
  RefreshCcw,
  Database,
  User as UserIcon,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentLog {
  id: string;
  action: string;
  entityType: string;
  entityInfo: string | null;
  userName: string;
  createdAt: Date;
}

interface RecentActivityProps {
  recentActivity: RecentLog[];
}

export function RecentActivity({ recentActivity }: RecentActivityProps) {
  const getIcon = (entityType: string) => {
    switch (entityType) {
      case "AUTH":
        return <Key className="h-3.5 w-3.5 text-amber-500" />;
      case "ITEM":
        return <Package className="h-3.5 w-3.5 text-blue-500" />;
      case "STOCK":
        return <Database className="h-3.5 w-3.5 text-emerald-500" />;
      case "ASSET":
        return <Settings className="h-3.5 w-3.5 text-violet-500" />;
      default:
        return <RefreshCcw className="h-3.5 w-3.5 text-slate-500" />;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case "CREATE":
        return "membuat";
      case "UPDATE":
        return "memperbarui";
      case "DELETE":
        return "menghapus";
      case "LOGIN":
        return "masuk";
      case "LOGOUT":
        return "keluar";
      case "IN":
        return "menambah stok";
      case "OUT":
        return "mengeluarkan stok";
      case "ADJUSTMENT":
        return "menyesuaikan stok";
      default:
        return action.toLowerCase();
    }
  };

  const getEntityTypeBg = (entityType: string) => {
    switch (entityType) {
      case "AUTH":
        return "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 ring-amber-100 dark:ring-amber-900/30";
      case "ITEM":
        return "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 ring-blue-100 dark:ring-blue-900/30";
      case "STOCK":
        return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 ring-emerald-100 dark:ring-emerald-900/30";
      case "ASSET":
        return "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400 ring-violet-100 dark:ring-violet-900/30";
      default:
        return "bg-slate-50 text-slate-600 dark:bg-slate-950/50 dark:text-slate-400 ring-slate-100 dark:ring-slate-900/30";
    }
  };

  const getTimelineDot = (entityType: string) => {
    switch (entityType) {
      case "AUTH":
        return "bg-amber-400 dark:bg-amber-500";
      case "ITEM":
        return "bg-blue-400 dark:bg-blue-500";
      case "STOCK":
        return "bg-emerald-400 dark:bg-emerald-500";
      case "ASSET":
        return "bg-violet-400 dark:bg-violet-500";
      default:
        return "bg-slate-400 dark:bg-slate-500";
    }
  };

  return (
    /* ── Double-Bezel: Outer Shell ── */
    <div
      className={cn(
        "group relative p-1.5 rounded-[1.5rem] ring-1 ring-border/30 bg-muted/15",
        "transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
        "hover:ring-border/50 hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.25)]",
        /* Entry animation */
        "animate-in fade-in slide-in-from-bottom-6 blur-in-[4px] fill-mode-both",
      )}
      style={{ animationDelay: "550ms", animationDuration: "700ms", animationTimingFunction: "cubic-bezier(0.32,0.72,0,1)" }}
    >
      {/* ── Double-Bezel: Inner Core ── */}
      <div className="relative overflow-hidden rounded-[calc(1.5rem-0.375rem)] bg-card/80 dark:bg-card/60 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
        {/* Gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/50 via-chart-2/50 to-chart-3/50 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary ring-1 ring-primary/10">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold tracking-tight">Aktivitas Terbaru</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Log aktivitas sistem
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-0">
          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/40 mb-3">
                <Clock className="h-6 w-6 text-muted-foreground/60" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                Belum ada aktivitas tercatat.
              </p>
            </div>
          ) : (
            recentActivity.map((log, index) => (
              <div
                key={log.id}
                className={cn(
                  "relative flex items-start gap-3.5 py-3.5",
                  index < recentActivity.length - 1 && "border-b border-border/25",
                  /* Staggered entry */
                  "animate-in fade-in slide-in-from-left-3 fill-mode-both",
                )}
                style={{ animationDelay: `${620 + index * 60}ms`, animationDuration: "500ms", animationTimingFunction: "cubic-bezier(0.32,0.72,0,1)" }}
              >
                {/* Timeline dot + connector */}
                <div className="relative flex flex-col items-center shrink-0">
                  <div className={cn(
                    "w-2 h-2 rounded-full ring-2 ring-background z-10",
                    getTimelineDot(log.entityType),
                  )} />
                  {index < recentActivity.length - 1 && (
                    <div className="w-px flex-1 bg-gradient-to-b from-border/40 to-transparent mt-1" />
                  )}
                </div>

                {/* Icon */}
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1",
                    getEntityTypeBg(log.entityType),
                  )}
                >
                  {getIcon(log.entityType, log.action)}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 min-w-0 gap-1">
                  <div className="text-sm leading-relaxed">
                    <span className="font-bold text-foreground">
                      {log.userName}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {getActionText(log.action)}
                    </span>{" "}
                    {log.entityInfo && (
                      <span className="font-semibold text-foreground">
                        {log.entityInfo}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-2.5 w-2.5" />
                      <span className="font-medium">{log.entityType}</span>
                    </div>
                    <span className="text-border/50">·</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      <span>
                        {formatDistanceToNow(new Date(log.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
