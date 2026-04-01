import { DialogProvider } from "@/context/dialog-provider";
import { Metadata } from "next";
import React from "react";
import AssetTable from "./components/asset-table";
import AssetDialogs from "./components/asset-dialogs";

export const metadata: Metadata = {
  title: "Daftar Aset",
  description: "Manajemen daftar unit aset perusahaan",
};

export default function AssetsPage() {
  return (
    <DialogProvider>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Daftar Aset</h2>
            <p className="text-muted-foreground">
              Kelola record unit fisik aset perusahaan Anda.
            </p>
          </div>
        </div>
        <AssetTable />
      </div>
      <AssetDialogs />
    </DialogProvider>
  );
}
