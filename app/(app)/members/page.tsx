import { DialogProvider } from "@/context/dialog-provider";
import React from "react";
import MembersTable from "./components/members-table";
import MembersDialogs from "./components/members-dialogs";

export default function MembersPage() {
  return (
    <DialogProvider>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Members</h2>
            <p className="text-muted-foreground">
              Manage members for your organization.
            </p>
          </div>
        </div>
        <MembersTable />
      </div>
      <MembersDialogs />
    </DialogProvider>
  );
}
