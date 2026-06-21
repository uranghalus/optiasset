"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import {
  PlusCircle,
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
  const getIcon = (entityType: string, action: string) => {
    switch (entityType) {
      case "AUTH":
        return <Key className="h-4 w-4 text-amber-500" />;
      case "ITEM":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "STOCK":
        return <Database className="h-4 w-4 text-emerald-500" />;
      case "ASSET":
        return <Settings className="h-4 w-4 text-indigo-500" />;
      default:
        return <RefreshCcw className="h-4 w-4 text-slate-500" />;
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
        return "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400";
      case "ITEM":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400";
      case "STOCK":
        return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400";
      case "ASSET":
        return "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400";
      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-900/40 dark:text-slate-400";
    }
  };

  return (
    <Card className="relative overflow-hidden h-full">
      {/* Decorative gradient top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-chart-2 to-chart-3" />

      <CardHeader className="flex flex-row items-center gap-3 pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Clock className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base font-bold">Aktivitas Terbaru</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Log aktivitas sistem
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-3">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground italic">
                Belum ada aktivitas tercatat.
              </p>
            </div>
          ) : (
            recentActivity.map((log, index) => (
              <div
                key={log.id}
                className={cn(
                  "relative flex items-start gap-3 pb-4",
                  index < recentActivity.length - 1 && "border-b border-border/50"
                )}
              >
                {/* Timeline connector */}
                {index < recentActivity.length - 1 && (
                  <div className="absolute left-[15px] top-10 bottom-0 w-px bg-gradient-to-b from-border/50 to-transparent" />
                )}

                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    "border border-border/50 shadow-sm",
                    getEntityTypeBg(log.entityType)
                  )}
                >
                  {getIcon(log.entityType, log.action)}
                </div>

                <div className="flex flex-col flex-1 min-w-0 gap-1">
                  <div className="text-sm leading-relaxed">
                    <span className="font-bold text-foreground">
                      {log.userName}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {getActionText(log.action)}
                    </span>{" "}
                    {log.entityInfo && (
                      <span className="font-medium text-foreground">
                        {log.entityInfo}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-2.5 w-2.5" />
                      <span className="font-medium">{log.entityType}</span>
                    </div>
                    <span className="text-border">•</span>
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
      </CardContent>
    </Card>
  );
}
