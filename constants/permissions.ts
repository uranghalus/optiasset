// constants/permissions.ts
//
// Daftar resource & aksi yang tersedia di system.
// File ini digunakan oleh PermissionCheckboxGroup di dialog Role & Permission.
// HARUS sinkron dengan `statement` di lib/auth-permission.ts

export const PERMISSIONS = {
  // ── Organisasi & SDM ────────────────────────────────────────────────
  ac: ["view", "list", "create", "edit", "delete", "read", "update"],
  role: ["view", "list", "create", "edit", "delete", "read", "update"],
  employee: [
    "view",
    "list",
    "create",
    "edit",
    "delete",
    "sync-user",
    "unsync-user",
  ],
  user: [
    "view",
    "list",
    "create",
    "edit",
    "delete",
    "set-role",
    "ban",
    "impersonate",
    "set-password",
  ],
  department: ["view", "list", "create", "edit", "delete"],
  division: ["view", "list", "create", "edit", "delete"],
  team: ["view", "create", "update", "delete"],

  // ── Asset Management ────────────────────────────────────────────────
  /** Daftar Aset + Tambah Aset */
  asset: ["view", "list", "create", "edit", "delete", "export", "import"],
  /** Kategori Aset */
  "asset.category": ["view", "list", "create", "edit", "delete"],
  /** Lokasi Aset */
  "asset.location": ["view", "list", "create", "edit", "delete"],
  /** Peminjaman Aset */
  "asset.loan": ["view", "create", "return"],
  /** Maintenance Aset */
  "asset.maintenance": ["view", "create", "edit", "complete"],
  /** Mutasi Aset */
  "asset.transfer": [
    "view",
    "create",
    "approve",
    "complete",
    "cancel",
    "cross_department",
  ],
  /** Riwayat Aset */
  "asset.history": ["view"],

  // ── Inventory Control ───────────────────────────────────────────────
  /** Master Item, Kategori Item, Gudang, Stok, Penerimaan, Penyesuaian, Mutasi Stok */
  inventory: ["view", "create", "edit", "delete"],
  /** Permintaan Barang + Persetujuan Permintaan */
  "inventory.requisition": ["view", "create", "approve"],

  // ── Audit & Laporan ─────────────────────────────────────────────────
  /** Log Audit */
  "audit.log": ["view"],
  /** Laporan */
  report: ["view"],
} as const;

/** Label ramah-pengguna untuk setiap resource (ditampilkan di dialog) */
export const PERMISSION_LABELS: Record<string, string> = {
  ac: "Access Control",
  role: "Role & Permission",
  employee: "Karyawan",
  user: "Pengguna",
  department: "Department",
  division: "Divisi",
  team: "Teams",
  asset: "Aset",
  "asset.category": "Kategori Aset",
  "asset.location": "Lokasi Aset",
  "asset.loan": "Peminjaman Aset",
  "asset.maintenance": "Maintenance Aset",
  "asset.transfer": "Mutasi Aset",
  "asset.history": "Riwayat Aset",
  inventory: "Inventory Control",
  "inventory.requisition": "Requisition",
  "audit.log": "Log Audit",
  report: "Laporan",
};

export type PermissionMap = {
  [K in keyof typeof PERMISSIONS]?: string[];
};
