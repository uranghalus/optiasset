import { Metadata } from "next";
import React from "react";
import TransactionsTable from "./components/transactions-table";

export const metadata: Metadata = {
  title: "Transaksi Stok",
  description: "Riwayat keluar masuk barang supply",
};

export default function StockTransactionsPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transaksi Stok</h2>
          <p className="text-muted-foreground">
            Riwayat lengkap perpindahan barang supply (In/Out/Adjustment).
          </p>
        </div>
      </div>
      <TransactionsTable />
    </div>
  );
}
