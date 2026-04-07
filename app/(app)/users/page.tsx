import { DialogProvider } from "@/context/dialog-provider";
import React from "react";
import UsersTable from "./component/user-table";

import UserDialogs from "./component/user-dialogs";

export default function UserPage() {
  return (
    <DialogProvider>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Users</h2>
            <p className="text-muted-foreground">
              Manage users for your application.
            </p>
          </div>
        </div>
        <UsersTable />
      </div>
      <UserDialogs />
    </DialogProvider>
  );
}
