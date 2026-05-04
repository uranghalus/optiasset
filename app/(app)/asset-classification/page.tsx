import { Metadata } from "next";
import React from "react";
import AssetClassificationWrapper from "./components/classification-wrapper";
import { DialogProvider } from "@/context/dialog-provider";
export const metadata: Metadata = {
  title: "Klasifikasi Aset",
  description: "Manajemen klasifikasi aset perusahaan",
};
export default function AssetClassificationPage() {

  return (
    <DialogProvider>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Klasifikasi Aset</h2>
            <p className="text-muted-foreground">
              Manajemen klasifikasi aset perusahaan
            </p>
          </div>
        </div>
        <AssetClassificationWrapper />
      </div>;
    </DialogProvider>
  )
}
