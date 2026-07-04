"use client";

import { useRouter } from "next/navigation";
import { Asset, Item, Location, department } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useDialog } from "@/context/dialog-provider";
import { usePermission } from "@/hooks/use-permission";
import { parsePhotoUrls } from "@/schema/asset-schema";
import { useState, useEffect } from "react";
import { getPrivateUrl } from "@/lib/s3-utils";

import {
  ArrowLeft, Edit, Trash2, QrCode, Move, Handshake, Calendar,
  MapPin, Building, Package, DollarSign, FileText, Camera, Tag,
  User, AlertTriangle, CheckCircle, Clock, XCircle, Download,
  Hash, Box, ChevronLeft, ChevronRight, Maximize2, Minimize2,
  Shield, Layers, Store, Link2, GripVertical, ImageIcon
} from "lucide-react";
import { format } from "date-fns";
import { authClient } from "@/lib/auth-client";
import { useActiveMemberRole } from "@/hooks/use-active-member";

interface ClassificationNode {
  id: string;
  name: string;
  code: string | null;
}

interface AssetWithRelations extends Asset {
  item: Item & { category?: { name: string; code: string } | null };
  location: Location | null;
  department: department | null;
  documentUrl: string | null;
  aparDetails?: { jenis: string; size: number }[];
  hydrantDetails?: { ukuran: string }[];
  assetGroup: ClassificationNode | null;
  assetCategory: ClassificationNode | null;
  assetCluster: ClassificationNode | null;
  assetSubCluster: ClassificationNode | null;
}

interface AssetDetailViewProps {
  asset: AssetWithRelations;
}

function PhotoGallery({ photoUrl }: { photoUrl: string | null }) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUrls() {
      setIsLoading(true);
      const keys = parsePhotoUrls(photoUrl);
      if (!keys.length) {
        setIsLoading(false);
        return;
      }
      const urls = await Promise.all(
        keys.map((key) =>
          key.startsWith('data:') || key.startsWith('http')
            ? Promise.resolve(key)
            : getPrivateUrl(key).catch(() => null)
        )
      );
      setImageUrls(urls.filter(Boolean) as string[]);
      setIsLoading(false);
    }
    loadUrls();
  }, [photoUrl]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-72 bg-muted/30 rounded-xl animate-pulse">
        <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
      </div>
    );
  }

  if (!imageUrls.length) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-xl bg-muted/20">
        <Camera className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">Belum ada foto</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main preview */}
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border bg-black/5 group">
        {imageUrls[activeIndex] && (
          <img
            src={imageUrls[activeIndex]}
            alt={`Foto asset ${activeIndex + 1}`}
            className="w-full h-full object-contain bg-white"
          />
        )}

        {imageUrls.length > 1 && (
          <>
            <button
              onClick={() => setActiveIndex((i) => (i === 0 ? imageUrls.length - 1 : i - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveIndex((i) => (i === imageUrls.length - 1 ? 0 : i + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
        >
          {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </button>

        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm text-xs px-2.5 py-1 rounded-full border shadow-sm font-medium">
          {activeIndex + 1} / {imageUrls.length}
        </span>
      </div>

      {/* Thumbnail strip */}
      {imageUrls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imageUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === activeIndex
                  ? "border-primary ring-1 ring-primary shadow-sm"
                  : "border-transparent hover:border-muted-foreground/30 opacity-70 hover:opacity-100"
              }`}
            >
              <img src={url} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, children, colSpan }: { icon: any; label: string; children: React.ReactNode; colSpan?: string }) {
  return (
    <div className={`${colSpan || ""}`}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-sm font-medium pl-[22px]">{children}</div>
    </div>
  );
}

function DataCard({ title, icon: Icon, children, className }: { title: string; icon: any; children: React.ReactNode; className?: string }) {
  return (
    <Card className={`overflow-hidden border-0 shadow-sm ${className || ""}`}>
      <div className="h-1 w-full bg-gradient-to-r from-primary/60 to-primary/10" />
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4 space-y-3">
        {children}
      </CardContent>
    </Card>
  );
}

export function AssetDetailView({ asset }: AssetDetailViewProps) {
  const router = useRouter();
  const { setOpen, setCurrentRow } = useDialog();
  const { can } = usePermission();
  const { data: userRole } = useActiveMemberRole();
  const { data: session } = authClient.useSession();

  const isSameDepartemen = session?.user.departmentId === asset.department?.id_department;
  const isOwner = userRole === "owner";
  const isStaffAsset = userRole === "staff_asset" as any;

  const showEditButton = can('asset', ['edit']) && (isSameDepartemen || isOwner || isStaffAsset);
  const showDeleteButton = can('asset', ['delete']) && (isOwner || (isSameDepartemen && !isStaffAsset));

  const getConditionBadge = (condition: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any; color: string; label: string }> = {
      GOOD: { variant: "default", icon: CheckCircle, color: "text-green-600", label: "Bagus" },
      REPAIR: { variant: "secondary", icon: Clock, color: "text-yellow-600", label: "Dalam Perbaikan" },
      BROKEN: { variant: "destructive", icon: XCircle, color: "text-red-600", label: "Rusak" },
      LOST: { variant: "outline", icon: AlertTriangle, color: "text-orange-600", label: "Hilang" },
    };
    const config = variants[condition] || variants.GOOD;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1 px-2.5 py-0.5">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "—";
    try { return format(new Date(date), "dd MMMM yyyy"); }
    catch { return "—"; }
  };

  const photoCount = parsePhotoUrls(asset.photoUrl).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {asset.kode_asset || "Asset"}
              </h1>
              {getConditionBadge(asset.condition || "GOOD")}
              <Badge variant={asset.status === "ACTIVE" ? "default" : "secondary"} className="capitalize">
                {asset.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {asset.item.name}{asset.item.code ? ` (${asset.item.code})` : ""}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {showEditButton && (
            <Button variant="outline" onClick={() => { setCurrentRow(asset); setOpen("edit"); }} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
          {showDeleteButton && (
            <Button variant="destructive" onClick={() => { setCurrentRow(asset); setOpen("delete"); }} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Hapus
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main - Left */}
        <div className="xl:col-span-2 space-y-8">
          {/* Photo Gallery */}
          <DataCard title={`Foto Asset${photoCount > 0 ? ` (${photoCount})` : ""}`} icon={Camera}>
            <PhotoGallery photoUrl={asset.photoUrl} />
          </DataCard>

          {/* Informasi Asset */}
          <DataCard title="Informasi Asset" icon={Package}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <InfoRow icon={Tag} label="Kode Asset / Tag">
                <span className="font-mono">{asset.kode_asset || "—"}</span>
              </InfoRow>
              <InfoRow icon={Box} label="Nama Item">
                {asset.item.name}
                {asset.item.code && <span className="text-muted-foreground ml-1">({asset.item.code})</span>}
              </InfoRow>
              <InfoRow icon={Package} label="Kondisi">
                {getConditionBadge(asset.condition || "GOOD")}
              </InfoRow>
              <InfoRow icon={Building} label="Departemen">
                {asset.department?.nama_department || "—"}
              </InfoRow>
              <InfoRow icon={MapPin} label="Lokasi">
                {asset.location?.name || "—"}
              </InfoRow>
              <InfoRow icon={User} label="PIC">
                {asset.PIC || "—"}
              </InfoRow>
              <InfoRow icon={Layers} label="Tipe Aset">
                <Badge variant="outline" className="capitalize">
                  {asset.item.assetType === "FIXED" ? "Aktiva Tetap" : asset.item.assetType === "SUPPLY" ? "Barang Habis Pakai" : asset.item.assetType}
                </Badge>
              </InfoRow>
              <InfoRow icon={Shield} label="Status Penempatan">
                <Badge variant={asset.assignedStatus === "ASSIGNED" ? "secondary" : "outline"}>
                  {asset.assignedStatus === "ASSIGNED" ? "Dipinjamkan" : "Tersedia"}
                </Badge>
              </InfoRow>
            </div>
          </DataCard>

          {/* Spesifikasi Fisik */}
          <DataCard title="Spesifikasi Fisik" icon={Layers}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <InfoRow icon={Tag} label="Brand / Merk">{asset.brand || "—"}</InfoRow>
              <InfoRow icon={Tag} label="Model / Tipe">{asset.model || "—"}</InfoRow>
              <InfoRow icon={Hash} label="Part Number">{asset.partNumber || "—"}</InfoRow>
              <InfoRow icon={Hash} label="Serial Number">{asset.serialNumber || "—"}</InfoRow>
            </div>
          </DataCard>

          {/* Klasifikasi Asset */}
          {(asset.assetGroup || asset.assetCategory || asset.assetCluster || asset.assetSubCluster) && (
            <DataCard title="Klasifikasi Asset" icon={Layers}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {asset.assetGroup && (
                  <InfoRow icon={Layers} label="Golongan">
                    <span className="font-medium">{asset.assetGroup.name}</span>
                    {asset.assetGroup.code && <span className="text-muted-foreground text-xs ml-1">({asset.assetGroup.code})</span>}
                  </InfoRow>
                )}
                {asset.assetCategory && (
                  <InfoRow icon={Layers} label="Kategori">
                    <span className="font-medium">{asset.assetCategory.name}</span>
                    {asset.assetCategory.code && <span className="text-muted-foreground text-xs ml-1">({asset.assetCategory.code})</span>}
                  </InfoRow>
                )}
                {asset.assetCluster && (
                  <InfoRow icon={Layers} label="Cluster">
                    <span className="font-medium">{asset.assetCluster.name}</span>
                    {asset.assetCluster.code && <span className="text-muted-foreground text-xs ml-1">({asset.assetCluster.code})</span>}
                  </InfoRow>
                )}
                {asset.assetSubCluster && (
                  <InfoRow icon={Layers} label="Sub Cluster">
                    <span className="font-medium">{asset.assetSubCluster.name}</span>
                    {asset.assetSubCluster.code && <span className="text-muted-foreground text-xs ml-1">({asset.assetSubCluster.code})</span>}
                  </InfoRow>
                )}
              </div>
            </DataCard>
          )}

          {/* APAR / Hydrant */}
          {(asset.aparDetails?.length || asset.hydrantDetails?.length) && (
            <DataCard title="Spesifikasi Khusus" icon={Shield}>
              {asset.aparDetails?.map((d, i) => (
                <div key={i} className="grid grid-cols-2 gap-4">
                  <InfoRow icon={Shield} label="Jenis APAR">{d.jenis}</InfoRow>
                  <InfoRow icon={Shield} label="Kapasitas">{d.size} Kg</InfoRow>
                </div>
              ))}
              {asset.hydrantDetails?.map((d, i) => (
                <InfoRow key={i} icon={Shield} label="Ukuran Hydrant">{d.ukuran}</InfoRow>
              ))}
            </DataCard>
          )}
        </div>

        {/* Sidebar - Right */}
        <div className="space-y-6">
          {/* Informasi Pembelian */}
          <DataCard title="Informasi Pembelian" icon={DollarSign}>
            <div className="space-y-4">
              <InfoRow icon={Calendar} label="Tanggal Masuk">{formatDate(asset.inComeDate)}</InfoRow>
              <InfoRow icon={Calendar} label="Tanggal Beli">{formatDate(asset.purchaseDate)}</InfoRow>
              <InfoRow icon={DollarSign} label="Harga Beli">
                <span className="font-semibold text-primary">{formatCurrency(asset.purchasePrice)}</span>
              </InfoRow>
              <InfoRow icon={Store} label="Vendor">{asset.vendorName || "—"}</InfoRow>
              <InfoRow icon={Calendar} label="Garansi Berakhir">{formatDate(asset.warrantyExpire)}</InfoRow>
              <InfoRow icon={Calendar} label="Garansi Vendor">{formatDate(asset.garansi_exp)}</InfoRow>
            </div>
          </DataCard>

          {/* Dokumen Legalitas */}
          <DataCard title="Dokumen Legalitas" icon={FileText}>
            <InfoRow icon={FileText} label="No. Dokumen">{asset.document_number || "—"}</InfoRow>
            <InfoRow icon={Link2} label="No. SPB">{asset.no_spb || "—"}</InfoRow>
            <Separator className="my-2" />
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <Download className="h-3.5 w-3.5" />
                Lampiran Berkas
              </div>
              <div className="pl-[22px]">
                {asset.documentUrl ? (
                  <a
                    href={`/api/s3/signed-url?key=${encodeURIComponent(asset.documentUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-2 h-9">
                      <FileText className="h-3.5 w-3.5" />
                      Lihat Dokumen
                    </Button>
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </div>
            </div>
          </DataCard>

          {/* Catatan */}
          {asset.notes && (
            <DataCard title="Catatan" icon={FileText}>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {asset.notes}
              </p>
            </DataCard>
          )}

          {/* Aksi Cepat */}
          <DataCard title="Aksi Cepat" icon={Move}>
            <div className="space-y-2">
              {can('asset', ['scan-code']) && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-10"
                  onClick={() => { setCurrentRow(asset); setOpen("view-qr"); }}
                >
                  <QrCode className="h-4 w-4" />
                  Lihat QR Code
                </Button>
              )}
              {can('asset.transfer', ['create']) && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-10"
                  onClick={() => { setCurrentRow(asset); setOpen("transfer"); }}
                >
                  <Move className="h-4 w-4" />
                  Transfer Asset
                </Button>
              )}
              {can('asset.loan', ['create']) && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-10"
                  onClick={() => { setCurrentRow(asset); setOpen("loan"); }}
                >
                  <Handshake className="h-4 w-4" />
                  Pinjam Asset
                </Button>
              )}
            </div>
          </DataCard>

          {/* Status & Timeline */}
          <DataCard title="Riwayat Status" icon={Clock}>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={asset.status === "ACTIVE" ? "default" : "secondary"} className="capitalize">
                  {asset.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dibuat</span>
                  <span className="font-medium text-xs">{formatDate(asset.createdAt)}</span>
                </div>
                {asset.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Diupdate</span>
                    <span className="font-medium text-xs">{formatDate(asset.updatedAt)}</span>
                  </div>
                )}
                {asset.brokenDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tanggal Rusak</span>
                    <span className="font-medium text-xs">{formatDate(asset.brokenDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </DataCard>
        </div>
      </div>
    </div>
  );
}
