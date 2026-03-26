import {
  LayoutDashboard,
  Package,
  Boxes,
  Tags,
  MapPin,
  Handshake,
  Wrench,
  Move,
  History,
  ShieldCheck,
  FileText,
  Users,
  UserCog,
  Building,
  Layers,
  Briefcase,
  Key,
  UserCircle,
  Sliders,
  Upload,
  Building2,
  ClipboardList,
  Truck,
  Warehouse,
  ArrowDownUp,
  ArchiveX,
  Clock,
  CheckSquare,
  ShieldAlert,
  ClipboardCheck,
} from "lucide-react";

import { SidebarData } from "@/types";

/**
 * Pemetaan role sidebar:
 *
 * GLOBAL (semua role):            tidak perlu `roles` field
 * Admin-only:                     roles: ['owner', 'admin']
 * Asset staff (global scope):     roles: ['owner', 'admin', 'finance_manager', 'staff_asset']
 * Semua jabatan operasional:      roles: ['owner', 'admin', 'manager', 'supervisor', 'staff_lapangan', 'staff_administrasi', 'finance_manager', 'staff_asset']
 */

/** Semua jabatan — digunakan untuk item yang visible ke semua role */
const ALL_ROLES = [
  "owner",
  "admin",
  "member",
  "manager",
  "supervisor",
  "staff_lapangan",
  "staff_administrasi",
  "finance_manager",
  "staff_asset",
] as const;

/** Hanya owner & admin (system admin) */
const ADMIN_ROLES = ["owner", "admin"] satisfies string[];

/** finance_manager + staff_asset + admin/owner (global-scope roles) */
const GLOBAL_ASSET_ROLES = [
  "owner",
  "admin",
  "finance_manager",
  "staff_asset",
] satisfies string[];

/** Role yang bisa mengelola aset (buat, ubah, dst) — semua kecuali finance_manager */
const ASSET_MANAGER_ROLES = [
  "owner",
  "admin",
  "manager",
  "supervisor",
  "staff_lapangan",
  "staff_administrasi",
  "staff_asset",
] satisfies string[];

/** Semua role yang bisa melihat aset (semua jabatan) */
const ASSET_VIEWER_ROLES = [...ALL_ROLES] satisfies string[];

export const sidebarData: SidebarData = {
  // ======================
  // APP INFO
  // ======================
  teams: [
    {
      name: "DutaAsset",
      logo: Package,
      plan: "v1.0.0",
    },
  ],

  // ======================
  // NAVIGATION
  // ======================
  navGroups: [
    // ---------- GENERAL ----------
    {
      title: "groups.general",
      items: [
        {
          title: "dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
          // Dashboard visible semua role
        },
        {
          title: "assets",
          url: "/assets/create",
          icon: Package,
          // Hanya role yang bisa create aset (bukan finance_manager)
          roles: ASSET_MANAGER_ROLES,
        },
      ],
    },

    // ---------- ASSET MANAGEMENT ----------
    {
      title: "groups.assetManagement",
      // Seluruh group visible untuk semua role yang ada hubungannya dengan aset
      roles: ASSET_VIEWER_ROLES,
      items: [
        {
          title: "assetList",
          url: "/assets",
          icon: Boxes,
          // Semua role bisa lihat daftar aset
        },
        {
          title: "assetCategories",
          url: "/assets/categories",
          icon: Tags,
          // Hanya admin/owner/staff_asset yang manage kategori
          roles: GLOBAL_ASSET_ROLES,
        },
        {
          title: "assetLocations",
          url: "/asset-locations",
          icon: MapPin,
          // Hanya admin/owner/staff_asset yang manage lokasi
          roles: GLOBAL_ASSET_ROLES,
        },
        {
          title: "approvals",
          url: "/approvals",
          icon: CheckSquare,
          roles: GLOBAL_ASSET_ROLES,
        },
        {
          title: "assetLoans",
          url: "/asset-loans",
          icon: Handshake,
          // Semua yang bisa interact dengan aset
          roles: ASSET_VIEWER_ROLES,
        },
        {
          title: "maintenance",
          url: "/assets/maintenances",
          icon: Wrench,
          roles: ASSET_VIEWER_ROLES,
        },
        {
          title: "assetSchedules",
          url: "/assets/schedules",
          icon: Clock,
          roles: ASSET_VIEWER_ROLES,
        },
        {
          title: "assetTransfers",
          url: "/asset-transfers",
          icon: Move,
          roles: ASSET_VIEWER_ROLES,
        },
        {
          title: "assetDisposals",
          url: "/assets/disposals",
          icon: ArchiveX,
          roles: ASSET_VIEWER_ROLES,
        },
        {
          title: "assetHistory",
          url: "/asset-history",
          icon: History,
          roles: ASSET_VIEWER_ROLES,
        },
      ],
    },

    // ---------- INVENTORY CONTROL ----------
    {
      title: "groups.inventoryControl",
      // Inventory hanya untuk admin, owner, dan staff_administrasi
      roles: ["owner", "admin", "staff_administrasi", "staff_asset"],
      items: [
        {
          title: "inventory.masterItem",
          url: "/inventory/items",
          icon: Package,
        },
        {
          title: "inventory.itemCategories",
          url: "/inventory/categories",
          icon: Tags,
        },
        {
          title: "inventory.warehouses",
          url: "/inventory/warehouses",
          icon: Warehouse,
        },
        {
          title: "inventory.requisition",
          icon: ClipboardList,
          items: [
            {
              title: "inventory.reqItems",
              url: "/inventory/requisitions",
            },
            {
              title: "inventory.reqApproval",
              url: "/inventory/requisition/approval",
            },
          ],
        },
        {
          title: "inventory.receipts",
          url: "/inventory/receipts",
          icon: Truck,
        },
        {
          title: "inventory.issuances",
          url: "/inventory/issuances",
          icon: ArrowDownUp,
        },
        {
          title: "inventory.adjustments",
          url: "/inventory/adjustments",
          icon: ArrowDownUp,
        },
        {
          title: "inventory.transfers",
          url: "/inventory/transfers",
          icon: Move,
        },
        {
          title: "inventory.stocks",
          url: "/inventory/stocks",
          icon: Boxes,
        },
      ],
    },

    // ---------- K3 / SAFETY ----------
    {
      title: "groups.safety",
      roles: [...GLOBAL_ASSET_ROLES, "supervisor"],
      items: [
        {
          title: "safety.equipment",
          url: "/safety/equipment",
          icon: ShieldAlert,
        },
        {
          title: "safety.inspections",
          url: "/safety/inspections",
          icon: ClipboardCheck,
        },
      ],
    },

    // ---------- AUDIT & LAPORAN ----------
    {
      title: "groups.auditReports",
      roles: [...GLOBAL_ASSET_ROLES, "manager", "supervisor"],
      items: [
        {
          title: "auditLogs",
          url: "/audit-logs",
          icon: ShieldCheck,
          // Hanya admin/owner
          roles: ADMIN_ROLES,
        },
        {
          title: "reports",
          url: "/reports",
          icon: FileText,
          // Manager ke atas bisa lihat laporan
          roles: [...GLOBAL_ASSET_ROLES, "manager", "supervisor"],
        },
      ],
    },

    // ---------- ORGANISASI & SDM ----------
    {
      title: "groups.orgHr",
      // Hanya admin/owner yang manage org & SDM
      roles: ADMIN_ROLES,
      items: [
        {
          title: "organizations",
          url: "/organizations",
          icon: Building2,
        },
        {
          title: "users",
          url: "/users",
          icon: UserCog,
        },
        {
          title: "employees",
          url: "/employees",
          icon: Briefcase,
        },
        {
          title: "departments",
          url: "/departments",
          icon: Layers,
        },
        {
          title: "divisions",
          url: "/divisions",
          icon: Building,
        },
        {
          title: "teams.title",
          icon: Users,
          items: [
            {
              title: "teams.list",
              url: "/teams",
            },
            {
              title: "teams.members",
              url: "/teams/members",
            },
            {
              title: "teams.permissions",
              url: "/teams/permissions",
            },
          ],
        },
        {
          title: "roles",
          url: "/roles",
          icon: Key,
        },
      ],
    },

    // ---------- SETTINGS ----------
    {
      title: "settings",
      // Settings visible untuk semua role
      items: [
        {
          title: "profile",
          url: "/settings/profile",
          icon: UserCircle,
        },
        {
          title: "preferences",
          url: "/settings/preferences",
          icon: Sliders,
        },
        {
          title: "importExport",
          url: "/settings/import-export",
          icon: Upload,
          // Hanya role yang punya izin import/export
          roles: [...GLOBAL_ASSET_ROLES, "staff_administrasi"],
        },
      ],
    },
  ],
};
