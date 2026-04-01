import { DialogProvider } from "@/context/dialog-provider";
import { Metadata } from "next";
import React from "react";
import DepartmentTable from "./components/department-table";
import DepartmentDialogs from "./components/department-dialogs";

export const metadata: Metadata = {
  title: "Departments",
  description: "Manage your departments",
};

export default function DepartmentsPage() {
  return (
    <DialogProvider>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Departments</h2>
            <p className="text-muted-foreground">
              Manage departments for your organization.
            </p>
          </div>
        </div>
        <DepartmentTable />
      </div>
      <DepartmentDialogs />
    </DialogProvider>
  );
}
