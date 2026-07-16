import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Boxes,
  Shield,
  BarChart3,
  Users,
  Settings,
  ArrowRight,
  Sparkles,
  Zap,
  Globe,
  CheckCircle,
  LayoutDashboard,
  ClipboardList,
  ArrowUpRight,
  Key,
  Building2,
  Package,
  Truck,
  History,
  Bell,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getServerSession } from "@/lib/get-session";
import { getDashboardData } from "@/action/dashboard-action";

const quickActions = [
  {
    icon: Package,
    title: "Tambah Aset Baru",
    description: "Daftarkan aset baru ke dalam sistem",
    href: "/assets/create",
    color: "bg-blue-500",
  },
  {
    icon: ClipboardList,
    title: "Ajukan Peminjaman",
    description: "Minta pinjam aset untuk kebutuhan kerja",
    href: "/asset-loans/create",
    color: "bg-emerald-500",
  },
  {
    icon: Truck,
    title: "Transfer Aset",
    description: "Pindahkan aset antar lokasi/departemen",
    href: "/asset-transfers/create",
    color: "bg-violet-500",
  },
  {
    icon: Search,
    title: "Cari Aset",
    description: "Temukan aset berdasarkan kode, nama, atau lokasi",
    href: "/assets",
    color: "bg-amber-500",
  },
  {
    icon: History,
    title: "Riwayat Audit",
    description: "Lihat log aktivitas dan inspeksi aset",
    href: "/audit-logs",
    color: "bg-rose-500",
  },
  {
    icon: Building2,
    title: "Klasifikasi Aset",
    description: "Kelola golongan, kategori, kelompok, sub-kelompok",
    href: "/asset-classification",
    color: "bg-orange-500",
  },
];

const modules = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description: "Ringkasan aset, distribusi kategori, stok rendah, aktivitas terkini",
    href: "/dashboard",
    badge: "Utama",
    badgeColor: "bg-primary",
  },
  {
    icon: Boxes,
    title: "Manajemen Aset",
    description: "CRUD aset, detail, foto, dokumen, garansi, kondisi, lokasi",
    href: "/assets",
    badge: "Core",
    badgeColor: "bg-blue-500",
  },
  {
    icon: Package,
    title: "Item & Stok",
    description: "Master item, kategori item, stok per lokasi, transaksi stok",
    href: "/items",
    badge: "Inventaris",
    badgeColor: "bg-emerald-500",
  },
  {
    icon: ClipboardList,
    title: "Peminjaman Aset",
    description: "Ajukan, setujui, tolak, kembalikan, perpanjang pinjaman",
    href: "/asset-loans",
    badge: "Workflow",
    badgeColor: "bg-violet-500",
  },
  {
    icon: Truck,
    title: "Transfer Aset",
    description: "Permintaan transfer, approval, penerimaan, mutasi lokasi",
    href: "/asset-transfers",
    badge: "Workflow",
    badgeColor: "bg-amber-500",
  },
  {
    icon: Settings,
    title: "Klasifikasi (4-Level)",
    description: "Golongan → Kategori → Kelompok → Sub-kelompok, kode otomatis",
    href: "/asset-classification",
    badge: "Setup",
    badgeColor: "bg-orange-500",
  },
  {
    icon: History,
    title: "Audit Log",
    description: "Log aktivitas lengkap: create, update, delete, login, export",
    href: "/audit-logs",
    badge: "Keamanan",
    badgeColor: "bg-rose-500",
  },
  {
    icon: Users,
    title: "Pengguna & Organisasi",
    description: "User, departemen, divisi, role, tim, organisasi multi-tenant",
    href: "/users",
    badge: "Admin",
    badgeColor: "bg-slate-500",
  },
  {
    icon: Key,
    title: "Pengaturan",
    description: "Profil, notifikasi, preferensi, keamanan, integrasi",
    href: "/settings",
    badge: "Sistem",
    badgeColor: "bg-gray-500",
  },
];

export default async function WelcomePage() {
  const session = await getServerSession();
  const data = await getDashboardData().catch(() => null);

  const userName = session?.user?.name || "Pengguna";
  const userRole = session?.user?.role || "staff";
  const orgName = session?.session?.activeOrganizationId 
    ? "Organisasi Aktif" 
    : "Belum memilih organisasi";

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar - User Context */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Boxes className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">OptiAsset Internal</h1>
                <p className="text-xs text-muted-foreground">Sistem Manajemen Aset Perusahaan</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="px-2 py-1 bg-muted rounded-full text-muted-foreground">
                {userName} • {userRole}
              </span>
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">
                {orgName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 lg:py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Selamat datang kembali, {userName.split(" ")[0]}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
              Kelola Aset Perusahaan dengan
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Efisien, Terstruktur, & Terintegrasi
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Platform internal untuk melacak seluruh siklus hidup aset — dari pengadaan, penempatan, 
              pemeliharaan, peminjaman, transfer, hingga penghapusan — dengan audit trail lengkap 
              dan klasifikasi hirarki 4-level standar enterprise.
            </p>
          </div>

          {/* Quick Stats from Real Data */}
          {data && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              <StatCard
                label="Total Aset"
                value={data.stats.totalAssets.toLocaleString()}
                icon={Boxes}
                trend="+12% bulan ini"
                trendColor="text-emerald-500"
              />
              <StatCard
                label="Total Item"
                value={data.stats.totalItems.toLocaleString()}
                icon={Package}
                trend={data.stats.totalStock > 0 ? `${data.stats.totalStock} unit stok` : "Stok kosong"}
                trendColor="text-blue-500"
              />
              <StatCard
                label="Stok Rendah"
                value={data.lowStockItems.length.toString()}
                icon={Bell}
                trend={data.lowStockItems.length > 0 ? "Perlu perhatian" : "Aman"}
                trendColor={data.lowStockItems.length > 0 ? "text-rose-500" : "text-emerald-500"}
              />
              <StatCard
                label="Aktivitas Hari Ini"
                value={data.recentActivity.length.toString()}
                icon={History}
                trend="Log audit terkini"
                trendColor="text-muted-foreground"
              />
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Aksi Cepat
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickActions.map((action, i) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group p-4 bg-card/50 border border-border/50 rounded-xl hover:border-primary/30 hover:shadow-lg transition-all duration-200"
                >
                  <div className={cn("inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3", action.color)}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{action.description}</p>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors mt-2 inline-block" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-12 lg:py-16 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Modul Aplikasi
              </h2>
              <p className="text-muted-foreground mt-1">
                Akses semua fitur manajemen aset dari satu tempat
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              Buka Dashboard Utama
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((module, i) => (
              <Link
                key={module.title}
                href={module.href}
                className="group p-5 bg-card/50 border border-border/50 rounded-xl hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("inline-flex items-center justify-center w-11 h-11 rounded-xl", module.badgeColor + "/10")}>
                      <module.icon className={cn("h-5 w-5", module.badgeColor.replace("bg-", "text-"))} />
                    </div>
                    <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full", module.badgeColor + "/10", module.badgeColor.replace("bg-", "text-"))}>
                      {module.badge}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    {module.title}
                  </h3>
                  <p className="text-sm text-muted-foreground flex-1 mb-4">
                    {module.description}
                  </p>
                  <div className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                    Buka modul
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity Preview */}
      {data?.recentActivity && data.recentActivity.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Aktivitas Terbaru</h2>
                <p className="text-muted-foreground mt-1">5 aktivitas paling baru dari audit log</p>
              </div>
              <Link
                href="/audit-logs"
                className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
              >
                Lihat semua
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <Card className="border-border/50 bg-card/50">
              <div className="divide-y divide-border/50">
                {data?.recentActivity.slice(0, 5).map((activity, i) => (
                  <div key={activity.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <History className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {activity.entityType} {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.entityInfo} • {activity.userName}
                      </p>
                    </div>
                    <time className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                      {new Date(activity.createdAt).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 border-t border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Boxes className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">OptiAsset Internal</span>
              <span className="px-2 py-0.5 text-xs bg-muted rounded-full">v2.0</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Dibangun dengan Next.js 15, React 19, Prisma, MariaDB, Tailwind v4</span>
              <span>© 2024 Perusahaan Anda. Internal Use Only.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, trendColor }: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: string;
  trendColor: string;
}) {
  return (
    <div className="p-4 bg-card/50 border border-border/50 rounded-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{value}</p>
          <p className={cn("text-xs mt-1", trendColor)}>{trend}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}