import { DialogProvider } from "@/context/dialog-provider";
import { Metadata } from "next";
import React from "react";
import DivisiTable from "./components/divisi-table";
import DivisiDialogs from "./components/divisi-dialogs";

export const metadata: Metadata = {
  title: "Divisi",
  description: "Manage your divisions",
};

export default function DivisiPage() {
  return (
    <DialogProvider>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Divisi</h2>
            <p className="text-muted-foreground">
              Manage divisions for your organization.
            </p>
          </div>
        </div>
        <DivisiTable />
      </div>
      <DivisiDialogs />
    </DialogProvider>
  );
}
