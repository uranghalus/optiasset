"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import React from "react";

export function PrintToolbar({ count }: { count: number }) {
  return (
    <div className="p-4 border-b flex justify-between items-center print:hidden bg-card sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold">Cetak Label Aset</h1>
        <p className="text-sm text-muted-foreground">
          {count} Aset siap dicetak
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="size-4" />
          Cetak Sekarang
        </Button>
      </div>
    </div>
  );
}
