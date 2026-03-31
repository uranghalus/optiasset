import { DialogProvider } from "@/context/dialog-provider";
import { Metadata } from "next";
import React from "react";
import OrganizationsTable from "./components/organizations-table";
import OrganizationsDialog from "./components/organizations-dialogs";

export const metadata: Metadata = {
  title: "Organizations",
  description: "Organizations management",
};

export default function OrganizationsPage() {
  return (
    <DialogProvider>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Organizations</h2>
            <p className="text-muted-foreground">
              Manage organizations for your application.
            </p>
          </div>
        </div>
        <OrganizationsTable />
      </div>
      <OrganizationsDialog />
    </DialogProvider>
  );
}
