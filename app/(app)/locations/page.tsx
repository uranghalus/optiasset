import { DialogProvider } from "@/context/dialog-provider";
import { Metadata } from "next";
import React from "react";
import LocationsTable from "./components/locations-table";
import LocationsDialog from "./components/locations-dialogs";

export const metadata: Metadata = {
  title: "Locations",
  description: "Locations",
};

export default function LocationsPage() {
  return (
    <DialogProvider>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Asset Locations
            </h2>
            <p className="text-muted-foreground">
              Manage locations for your assets.
            </p>
          </div>
        </div>
        <LocationsTable />
      </div>
      <LocationsDialog />
    </DialogProvider>
  );
}
