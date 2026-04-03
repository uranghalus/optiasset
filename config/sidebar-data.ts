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
          url: "/assets/items",
          icon: Package,
        },
        {
          title: "Kategori Aset",
          url: "/assets/categories",
          icon: Tags,
        },
        {
          title: "Lokasi Aset",
          url: "/assets/locations",
          icon: MapPin,
        },
        {
          title: "Department",
          url: "/assets/departments",
          icon: Network,
        },
        {
          title: "Divisi",
          url: "/assets/divisi",
          icon: Layers,
        },
        // {
        //   title: "Persetujuan",
        //   url: "/approvals",
        //   icon: CheckSquare,
        // },
        // {
        //   title: "Peminjaman Aset",
        //   url: "/asset-loans",
        //   icon: Handshake,
        // },
        // {
        //   title: "Perawatan Aset",
        //   url: "/assets/maintenances",
        //   icon: Wrench,
        // },
        // {
        //   title: "Jadwal Aset",
        //   url: "/assets/schedules",
        //   icon: Clock,
        // },
        // {
        //   title: "Mutasi Aset",
        //   url: "/asset-transfers",
        //   icon: Move,
        // },
        // {
        //   title: "Penghapusan Aset",
        //   url: "/assets/disposals",
        //   icon: ArchiveX,
        // },
        {
          title: "Riwayat Aset",
          url: "/asset-history",
          icon: History,
        },
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
          title: "Organisasi",
          url: "/organizations",
          icon: Building2,
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
