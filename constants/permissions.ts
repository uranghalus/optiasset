// constants/permissions.ts
//
// Daftar resource & aksi yang tersedia di system.
// File ini digunakan oleh PermissionCheckboxGroup di dialog Role & Permission.
// HARUS sinkron dengan `statement` di lib/auth-permission.ts

export const PERMISSIONS = {
  // ── Organisasi & SDM ────────────────────────────────────────────────
  ac: ["view", "list", "create", "edit", "delete", "read", "update"],
  role: ['view', 'list', 'create', 'edit', 'delete', 'read', 'update'],
  employee: [
    'view',
    'list',
    'create',
    'edit',
    'delete',
    'sync-user',
    'unsync-user',
  ],
  'asset.classification': ['view', 'list', 'create', 'edit', 'delete'],
  user: [
    'view',
    'list',
    'create',
    'edit',
    'delete',
    'set-role',
    'ban',
    'impersonate',
    'set-password',
  ],
  department: ['view', 'list', 'create', 'edit', 'delete'],
  division: ['view', 'list', 'create', 'edit', 'delete'],
  team: ['view', 'create', 'update', 'delete'],
  member: ['create', 'update', 'delete'],
  invitation: ['create', 'cancel'],
  organization: ['update', 'delete'],

  // Asset Management — global scope
  asset: [
    'view',
    'list',
    'edit',
    'delete',
    'export',
    'import',
    'create',
    'generate-code',
    'scan-code',
    'assign',
  ],
  'asset.category': ['view', 'list', 'create', 'edit', 'delete'],
  'asset.location': ['view', 'list', 'create', 'edit', 'delete'],
  'asset.loan': ['view', 'create', 'return'],
  'asset.maintenance': ['view', 'create', 'edit', 'complete'],
  'asset.transfer': [
    'view',
    'create',
    'approve',
    'complete',
    'cancel',
    'cross_department',
  ],
  'asset.history': ['view'],

  // Inventory Control
  inventory: ['view', 'create', 'edit', 'delete'],

  // Audit & Laporan
  'audit.log': ['view'],
  report: ['view'],
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
  "audit.log": "Log Audit",
  report: "Laporan",
};

export type PermissionMap = {
  [K in keyof typeof PERMISSIONS]?: string[];
};
