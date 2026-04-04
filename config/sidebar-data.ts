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
  UserCircle,
  Sliders,
  Upload,
  ArchiveX,
  Clock,
  CheckSquare,
  Building2,
  Network,
  Layers,
  Warehouse,
  ClipboardList,
  Truck,
  ShieldUser,
} from "lucide-react";

import { SidebarData } from "@/types";

export const sidebarData: SidebarData = {
  // ======================
  // INFO APLIKASI
  // ======================
  teams: [
    {
      name: "DutaAsset",
      logo: Package,
      plan: "v1.0.0",
    },
  ],

  // ======================
  // NAVIGASI
  // ======================
  navGroups: [
    // ---------- UMUM ----------
    {
      title: "Umum",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Tambah Aset",
          url: "/assets/create",
          icon: Package,
        },
      ],
    },

    // ---------- MANAJEMEN ASET ----------
    {
      title: "Manajemen Aset",
      items: [
        {
          title: "Daftar Aset",
          url: "/assets",
          icon: Boxes,
        },
        {
          title: "Master Item",
          url: "/items",
          icon: Package,
        },
        {
          title: "Kategori",
          url: "/categories",
          icon: Tags,
        },
        {
          title: "Lokasi",
          url: "/locations",
          icon: MapPin,
        },
        {
          title: "Department",
          url: "/departments",
          icon: Network,
        },
        {
          title: "Divisi",
          url: "/divisions",
          icon: Layers,
        },
        {
          title: "Mutasi Aset",
          url: "/asset-transfers",
          icon: Move,
        },
        {
          title: "Penghapusan Aset",
          url: "/asset-disposals",
          icon: ArchiveX,
        },
        {
          title: "Riwayat Aset",
          url: "/asset-history",
          icon: History,
        },
      ],
    },

    // ---------- INVENTORY / PERSEDIAAN ----------
    {
      title: "Persediaan",
      items: [
        {
          title: "Stok Barang",
          url: "/stocks",
          icon: Warehouse,
        },
        {
          title: "Transaksi Stok",
          url: "/stock-transactions",
          icon: ClipboardList,
        },
      ],
    },

    // ---------- OPERASIONAL ----------
    {
      title: "Operasional",
      items: [
        {
          title: "Peminjaman Aset",
          url: "/asset-loans",
          icon: Handshake,
        },
        {
          title: "Perawatan Aset",
          url: "/maintenances",
          icon: Wrench,
        },
        {
          title: "Jadwal Perawatan",
          url: "/maintenance-schedules",
          icon: Clock,
        },
        {
          title: "Persetujuan",
          url: "/approvals",
          icon: CheckSquare,
        },
      ],
    },

    // ---------- ORGANISASI ----------
    {
      title: "Organisasi",
      items: [
        {
          title: "Organisasi",
          url: "/organizations",
          icon: Building2,
        },
        {
          title: "Tim",
          url: "/teams",
          icon: Layers,
        },
        {
          title: "Anggota",
          url: "/members",
          icon: UserCircle,
        },
        {
          title: "Role",
          url: "/roles",
          icon: ShieldUser,
        }
      ],
    },

    // ---------- PENGATURAN ----------
    {
      title: "Pengaturan",
      items: [
        {
          title: "Profil",
          url: "/settings/profile",
          icon: UserCircle,
        },
        {
          title: "Preferensi",
          url: "/settings/preferences",
          icon: Sliders,
        },
        {
          title: "Impor & Ekspor",
          url: "/settings/import-export",
          icon: Upload,
        },
      ],
    },
  ],
};
