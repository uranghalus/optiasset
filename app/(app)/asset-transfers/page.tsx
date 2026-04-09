import { Metadata } from "next";
import React from "react";
import TransferTable from "./components/transfer-table";

export const metadata: Metadata = {
  title: "Mutasi Aset",
  description: "Riwayat perpindahan aset antar lokasi",
};

export default function AssetTransfersPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mutasi Aset</h2>
          <p className="text-muted-foreground">
            Lacak riwayat perpindahan aset antar departemen dan lokasi secara
            detail.
          </p>
        </div>
      </div>
      <TransferTable />
    </div>
  );
}
