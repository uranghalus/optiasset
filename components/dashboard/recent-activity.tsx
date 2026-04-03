"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface RecentAsset {
  id: string;
  name: string;
  code: string;
  type: string;
  category: string;
  createdAt: Date;
}

interface RecentActivityProps {
  assets: RecentAsset[];
}

export function RecentActivity({ assets }: RecentActivityProps) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Recent Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assets.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No recent items found.
            </p>
          ) : (
            assets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between space-x-4"
              >
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {asset.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{asset.code}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={asset.type === "FIXED" ? "default" : "outline"}
                    className="text-[10px]"
                  >
                    {asset.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(asset.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
