import { Metadata } from "next";
import React from "react";
import AuditLogTable from "./components/audit-log-table";

export const metadata: Metadata = {
  title: "Audit Log",
  description: "Log aktivitas sistem dan riwayat kejadian di aplikasi",
};

export default function AuditLogsPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Audit Log</h2>
          <p className="text-muted-foreground">
            Rekam jejak seluruh aktivitas penting dalam aplikasi (CRUD, Login,
            Logout).
          </p>
        </div>
      </div>
      <AuditLogTable />
    </div>
  );
}
