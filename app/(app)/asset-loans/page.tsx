import { Metadata } from "next";
import React from "react";
import LoanTable from "./components/loan-table";

import { DialogProvider } from "@/context/dialog-provider";
import LoanDialogs from "./components/loan-dialogs";
import LoanHeaderActions from "./components/loan-header-actions";

export const metadata: Metadata = {
  title: "Peminjaman Aset",
  description: "Daftar peminjaman aset oleh karyawan",
};

export default function AssetLoansPage() {
  return (
    <DialogProvider>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Peminjaman Aset
            </h2>
            <p className="text-muted-foreground">
              Kelola dan pantau aset yang sedang dipinjam oleh personil.
            </p>
          </div>
          <LoanHeaderActions />
        </div>
        <LoanTable />
        <LoanDialogs />
      </div>
    </DialogProvider>
  );
}
