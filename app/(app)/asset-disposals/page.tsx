import { Metadata } from "next";
import React from "react";
import DisposalTable from "./components/disposal-table";
import { DialogProvider } from "@/context/dialog-provider";
import DisposalDialog from "./components/disposal-dialog";

export const metadata: Metadata = {
  title: "Penghapusan Aset",
  description: "Daftar pengajuan dan riwayat penghapusan aset",
};

export default function AssetDisposalsPage() {
  return (
    <DialogProvider>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Penghapusan Aset</h2>
            <p className="text-muted-foreground">
              Kelola pengajuan dan persetujuan penghapusan aset secara bertingkat.
            </p>
          </div>
        </div>
        <DisposalTable />
      </div>
      <DisposalDialog />
    </DialogProvider>
  );
}
