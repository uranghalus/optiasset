import { Metadata } from "next";
import React from "react";
import StockTable from "./components/stock-table";

export const metadata: Metadata = {
  title: "Stok Barang",
  description: "Manajemen persediaan dan stok barang (SUPPLY)",
};

export default function StocksPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border/50 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Stok Barang</h2>
          <p className="text-muted-foreground">
            Lacak ketersediaan barang supply di berbagai lokasi dan gudang.
          </p>
        </div>
      </div>
      <StockTable />
    </div>
  );
}
