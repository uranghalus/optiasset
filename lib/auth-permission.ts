import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements } from 'better-auth/plugins/organization/access';

// =============================================================================
// STATEMENT — semua resource yang ada di sistem
// Setiap resource dipetakan langsung ke menu sidebar yang bersangkutan.
// =============================================================================

export const statement = {
  ...defaultStatements,

  // ── Org Management (Sidebar: Organisasi & SDM) ───────────────────────────
  ac: ['view', 'list', 'create', 'edit', 'delete', 'read', 'update'],
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

  // ── Asset Management (Sidebar: Asset Management) ─────────────────────────

  /** Sidebar: Daftar Aset + Tambah Aset */
  asset: ['view', 'list', 'create', 'edit', 'delete', 'export', 'import'],

  /** Sidebar: Kategori Aset — hanya global-scope roles */
  'asset.category': ['view', 'list', 'create', 'edit', 'delete'],

  /** Sidebar: Lokasi Aset — hanya global-scope roles */
  'asset.location': ['view', 'list', 'create', 'edit', 'delete'],

  /** Sidebar: Peminjaman Aset */
  'asset.loan': ['view', 'create', 'return'],

  /** Sidebar: Maintenance Aset */
  'asset.maintenance': ['view', 'create', 'edit', 'complete'],

  /** Sidebar: Mutasi Aset */
  'asset.transfer': [
    'view',
    'create',
    'approve',
    'complete',
    'cancel',
    'cross_department',
  ],

  /** Sidebar: Riwayat Aset */
  'asset.history': ['view'],

  // ── Inventory Control (Sidebar: Inventory Control) ───────────────────────

  /** Master Item, Kategori Item, Gudang, Stok, Penerimaan, Penyesuaian, Mutasi Stok */
  inventory: ['view', 'create', 'edit', 'delete'],

  /** Sidebar: Permintaan Barang + Persetujuan Permintaan */
  'inventory.requisition': ['view', 'create', 'approve'],

  // ── Audit & Laporan (Sidebar: Audit & Laporan) ───────────────────────────

  /** Sidebar: Log Audit — hanya owner/admin */
  'audit.log': ['view'],

  /** Sidebar: Laporan — global-scope + manager/supervisor */
  report: ['view'],
} as const;

export const ac = createAccessControl(statement);

// =============================================================================
// BASE ROLES (system-level)
// =============================================================================

/** Owner — full access ke semua resource + org management */
export const owner = ac.newRole({
  // Org management
  ac: ['view', 'list', 'create', 'edit', 'delete', 'read', 'update'],
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
  asset: ['view', 'list', 'create', 'edit', 'delete', 'export', 'import'],
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
  'inventory.requisition': ['view', 'create', 'approve'],

  // Audit & Laporan
  'audit.log': ['view'],
  report: ['view'],
});

/** Admin — full access kecuali delete org */
export const admin = ac.newRole({
  // Org management
  ac: ['view', 'list', 'create', 'edit', 'delete', 'read', 'update'],
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
  organization: ['update'], // tidak bisa delete org

  // Asset Management — global scope
  asset: ['view', 'list', 'create', 'edit', 'delete', 'export', 'import'],
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
  'inventory.requisition': ['view', 'create', 'approve'],

  // Audit & Laporan
  'audit.log': ['view'],
  report: ['view'],
});
