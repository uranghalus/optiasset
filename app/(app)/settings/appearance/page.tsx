"use client";

import { useColor } from "@/context/color-provider";
import { useTheme } from "@/context/theme-provider";
import { useFont } from "@/context/font-provider";
import { useLayout } from "@/context/layout-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Sun,
  Moon,
  Monitor,
  PanelLeft,
  LayoutDashboard,
  Columns2,
  Type,
  Palette,
  Layout,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Color Options ────────────────────────────────────────────────────────────
const colorOptions = [
  {
    name: "Zinc",
    value: "zinc",
    bg: "bg-zinc-900",
    ring: "ring-zinc-900",
    darkBg: "dark:bg-zinc-100",
  },
  {
    name: "Blue",
    value: "blue",
    bg: "bg-blue-600",
    ring: "ring-blue-600",
    darkBg: "dark:bg-blue-500",
  },
  {
    name: "Green",
    value: "green",
    bg: "bg-green-600",
    ring: "ring-green-600",
    darkBg: "dark:bg-green-500",
  },
  {
    name: "Red",
    value: "red",
    bg: "bg-red-600",
    ring: "ring-red-600",
    darkBg: "dark:bg-red-500",
  },
  {
    name: "Orange",
    value: "orange",
    bg: "bg-orange-500",
    ring: "ring-orange-500",
    darkBg: "dark:bg-orange-400",
  },
] as const;

// ─── Font Options ─────────────────────────────────────────────────────────────
const fontOptions = [
  {
    value: "inter",
    label: "Inter",
    sample: "The quick brown fox",
    style: { fontFamily: "'Inter', sans-serif" },
  },
  {
    value: "manrope",
    label: "Manrope",
    sample: "The quick brown fox",
    style: { fontFamily: "'Manrope', sans-serif" },
  },
  {
    value: "system",
    label: "System Default",
    sample: "The quick brown fox",
    style: { fontFamily: "system-ui, sans-serif" },
  },
] as const;

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-semibold leading-none">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AppearancePage() {
  const { theme, setTheme, resetTheme } = useTheme();
  const { color, setColor, resetColor } = useColor();
  const { font, setFont, resetFont } = useFont();
  const { variant, setVariant, collapsible, setCollapsible, resetLayout } =
    useLayout();

  // ─── Theme Options ────────────────────────────────────────────────────────────
  const themeOptions = [
    {
      value: "light",
      label: "Terang",
      icon: Sun,
      preview: (
        <div className="flex h-14 w-full items-center justify-center rounded-lg bg-white border border-zinc-200 shadow-sm gap-2 px-3">
          <div className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
          <div className="flex-1 space-y-1">
            <div className="h-2 w-3/4 rounded bg-zinc-200" />
            <div className="h-2 w-1/2 rounded bg-zinc-100" />
          </div>
        </div>
      ),
    },
    {
      value: "dark",
      label: "Gelap",
      icon: Moon,
      preview: (
        <div className="flex h-14 w-full items-center justify-center rounded-lg bg-zinc-950 border border-zinc-800 shadow-sm gap-2 px-3">
          <div className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
          <div className="flex-1 space-y-1">
            <div className="h-2 w-3/4 rounded bg-zinc-800" />
            <div className="h-2 w-1/2 rounded bg-zinc-900" />
          </div>
        </div>
      ),
    },
    {
      value: "system",
      label: "Sistem",
      icon: Monitor,
      preview: (
        <div className="flex h-14 w-full overflow-hidden rounded-lg border border-zinc-200 shadow-sm">
          <div className="flex-1 bg-white flex items-center justify-center border-r border-zinc-200 px-2 gap-1">
            <div className="h-2 w-full rounded bg-zinc-200" />
          </div>
          <div className="flex-1 bg-zinc-950 flex items-center justify-center px-2 gap-1">
            <div className="h-2 w-full rounded bg-zinc-800" />
          </div>
        </div>
      ),
    },
  ] as const;

  // ─── Layout Variant Options ───────────────────────────────────────────────────
  const variantOptions = [
    {
      value: "sidebar",
      label: "Klasik",
      icon: PanelLeft,
      preview: (
        <div className="flex h-14 w-full gap-1 rounded-lg border border-border overflow-hidden bg-muted/30 p-1.5">
          <div className="w-8 rounded bg-muted" />
          <div className="flex-1 rounded bg-background border border-border" />
        </div>
      ),
    },
    {
      value: "inset",
      label: "Inset",
      icon: LayoutDashboard,
      preview: (
        <div className="flex h-14 w-full gap-1 rounded-lg border border-border overflow-hidden bg-muted/50 p-2">
          <div className="w-7 rounded-sm bg-muted/80" />
          <div className="flex-1 rounded-sm bg-background border border-border/50" />
        </div>
      ),
    },
    {
      value: "floating",
      label: "Mengambang",
      icon: Columns2,
      preview: (
        <div className="relative flex h-14 w-full items-center rounded-lg border border-border overflow-hidden bg-background p-1.5 gap-1">
          <div className="w-8 rounded bg-muted/60 border border-border/50 h-full shadow-sm" />
          <div className="flex-1 rounded bg-muted/20 h-full" />
        </div>
      ),
    },
  ] as const;

  // ─── Collapsible Options ──────────────────────────────────────────────────────
  const collapsibleOptions = [
    {
      value: "icon",
      label: "Hanya Ikon",
      description: "Hanya tampilkan ikon saat sidebar ditutup.",
    },
    {
      value: "offcanvas",
      label: "Sembunyikan",
      description: "Sembunyikan sidebar sepenuhnya saat ditutup.",
    },
    {
      value: "none",
      label: "Selalu Terbuka",
      description: "Cegah sidebar agar tidak bisa ditutup.",
    },
  ] as const;

  const handleResetAll = () => {
    resetTheme();
    resetColor();
    resetFont();
    resetLayout();
  };

  return (
    <div className="flex flex-col gap-8 flex-1 w-full max-w-2xl px-2 pb-12">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tampilan Aplikasi</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Sesuaikan antarmuka aplikasi sesuai dengan preferensi Anda.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetAll}
          className="gap-2 shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Semua
        </Button>
      </div>

      <Separator />

      {/* ── Theme ───────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader
          icon={Sun}
          title="Tema"
          description="Pilih mode terang, gelap, atau ikuti pengaturan sistem komputer Anda."
        />
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map((opt) => {
            const isActive = theme === opt.value;
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  "group flex flex-col gap-2 rounded-xl border-2 p-3 text-left transition-all hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border/80",
                )}
              >
                {opt.preview}
                <div className="flex items-center justify-between px-0.5">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{opt.label}</span>
                  </div>
                  {isActive && (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                      <Check className="h-2.5 w-2.5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* ── Color Accent ────────────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader
          icon={Palette}
          title="Aksen Warna"
          description="Pilih warna utama yang akan digunakan di seluruh antarmuka aplikasi."
        />
        <div className="flex flex-wrap gap-3">
          {colorOptions.map((opt) => {
            const isActive = color === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setColor(opt.value)}
                className={cn(
                  "group flex flex-col items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg p-2 transition-all",
                  isActive ? "bg-primary/5" : "hover:bg-accent/30",
                )}
                aria-label={`Pilih warna ${opt.name}`}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full transition-all ring-2 ring-offset-2 ring-offset-background",
                    opt.bg,
                    opt.darkBg,
                    isActive ? opt.ring : "ring-transparent",
                  )}
                >
                  {isActive && (
                    <Check className="h-4 w-4 text-white dark:text-zinc-900" />
                  )}
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {opt.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* ── Font ────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader
          icon={Type}
          title="Tipografi"
          description="Pilih jenis huruf yang paling nyaman untuk Anda baca."
        />
        <div className="flex flex-col gap-2">
          {fontOptions.map((opt) => {
            const isActive = font === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setFont(opt.value)}
                className={cn(
                  "flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border/80",
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">{opt.label}</span>
                  <span
                    className="text-base text-muted-foreground"
                    style={opt.style}
                  >
                    {opt.sample}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isActive && (
                    <>
                      <Badge
                        variant="secondary"
                        className="hidden sm:flex text-xs"
                      >
                        Aktif
                      </Badge>
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* ── Sidebar Layout ──────────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader
          icon={Layout}
          title="Tata Letak Sidebar"
          description="Pilih gaya visual untuk menu navigasi di samping."
        />
        <div className="grid grid-cols-3 gap-3">
          {variantOptions.map((opt) => {
            const isActive = variant === opt.value;
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setVariant(opt.value)}
                className={cn(
                  "group flex flex-col gap-2 rounded-xl border-2 p-3 transition-all hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border/80",
                )}
              >
                {opt.preview}
                <div className="flex items-center justify-between px-0.5">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{opt.label}</span>
                  </div>
                  {isActive && (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                      <Check className="h-2.5 w-2.5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* ── Sidebar Collapse Behavior ───────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader
          icon={PanelLeft}
          title="Perilaku Ciutkan Sidebar"
          description="Tentukan apa yang terjadi saat sidebar diminimalkan."
        />
        <div className="flex flex-col gap-2">
          {collapsibleOptions.map((opt) => {
            const isActive = collapsible === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setCollapsible(opt.value)}
                className={cn(
                  "flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border/80",
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {opt.description}
                  </span>
                </div>
                {isActive && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary shrink-0">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
