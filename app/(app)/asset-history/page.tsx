import { Metadata } from "next";
import React from "react";
import HistoryTable from "./components/history-table";

export const metadata: Metadata = {
  title: "Riwayat Aset",
  description: "Log aktivitas dan history unit fisik aset perusahaan",
};

export default function AssetHistoryPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Riwayat Aset</h2>
          <p className="text-muted-foreground">
            Pantau semua aktivitas dan perubahan pada unit fisik aset Anda.
          </p>
        </div>
      </div>
      <HistoryTable />
    </div>
  );
}
