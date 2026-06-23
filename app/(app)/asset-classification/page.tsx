import { Metadata } from "next";
import React from "react";
import AssetClassificationWrapper from "./components/classification-wrapper";
import { DialogProvider } from "@/context/dialog-provider";
import ClassificationDialog from "./components/classication-dialog";
import { Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Klasifikasi Aset",
  description: "Manajemen klasifikasi aset perusahaan",
};

export default function AssetClassificationPage() {
  return (
    <DialogProvider>
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-lg border border-border/50 bg-gradient-to-r from-primary/5 via-primary/10 to-chart-4/5 p-5">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-chart-4/10 blur-2xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Klasifikasi Aset
                </h2>
                <p className="text-sm text-muted-foreground">
                  Manajemen klasifikasi aset perusahaan
                </p>
              </div>
            </div>
          </div>
        </div>
        <AssetClassificationWrapper />
      </div>
      <ClassificationDialog />
    </DialogProvider>
  );
}
