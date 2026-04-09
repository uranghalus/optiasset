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

  return (
    <Card className="col-span-1 border-none shadow-none bg-accent/30">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <RefreshCcw className="h-5 w-5 text-blue-600" />
          Aktivitas Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              Belum ada aktivitas tercatat.
            </p>
          ) : (
            recentActivity.map((log) => (
              <div key={log.id} className="flex items-start gap-4">
                <div
                  className={cn(
                    "p-2 rounded-full",
                    "bg-background border shadow-sm",
                  )}
                >
                  {getIcon(log.entityType, log.action)}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="text-sm">
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
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                    <UserIcon className="h-2 w-2" />
                    {log.entityType} •{" "}
                    {formatDistanceToNow(new Date(log.createdAt), {
                      addSuffix: true,
                    })}
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
