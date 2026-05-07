// constants/permissions.ts
//
// Daftar resource & aksi yang tersedia di system.
// File ini digunakan oleh PermissionCheckboxGroup di dialog Role & Permission.
// HARUS sinkron dengan `statement` di lib/auth-permission.ts

import { statement } from '@/lib/auth-permission';

export const PERMISSIONS = statement;

/** Label ramah-pengguna untuk setiap resource (ditampilkan di dialog) */
export const PERMISSION_LABELS: Record<string, string> = {
  ac: 'Access Control',
  role: 'Role & Permission',
  employee: 'Karyawan',
  user: 'Pengguna',
  department: 'Department',
  division: 'Divisi',
  team: 'Teams',
  asset: 'Aset',
  'asset.classification': 'Klasifikasi Aset',
  'asset.category': 'Kategori Aset',
  'asset.location': 'Lokasi Aset',
  'asset.loan': 'Peminjaman Aset',
  'asset.maintenance': 'Maintenance Aset',
  'asset.transfer': 'Mutasi Aset',
  'asset.history': 'Riwayat Aset',
  inventory: 'Inventory Control',
  'audit.log': 'Log Audit',
  report: 'Laporan',

  // Tambahan dari defaultStatements (Better Auth) jika ditampilkan di UI:
  member: 'Anggota',
  invitation: 'Undangan',
  organization: 'Organisasi',
};

export type PermissionMap = {
  [K in keyof typeof PERMISSIONS]?: string[];
};
