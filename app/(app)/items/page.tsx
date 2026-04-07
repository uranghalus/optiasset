import { DialogProvider } from "@/context/dialog-provider";
import { Metadata } from "next";
import React from "react";
import ItemTable from "./components/item-table";
import ItemDialogs from "./components/item-dialogs";

export const metadata: Metadata = {
  title: "Master Item",
  description: "Katalog master item aset",
};

export default function ItemsPage() {
  return (
    <DialogProvider>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Master Item</h2>
            <p className="text-muted-foreground">
              Kelola katalog master item untuk aset Anda.
            </p>
          </div>
        </div>
        <ItemTable />
      </div>
      <ItemDialogs />
    </DialogProvider>
  );
}
