"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Asset, Item, Location, department } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useDialog } from "@/context/dialog-provider";
import { usePermission } from "@/hooks/use-permission";
import {
    ArrowLeft,
    Edit,
    Trash2,
    QrCode,
    Move,
    Handshake,
    Calendar,
    MapPin,
    Building,
    Package,
    DollarSign,
    FileText,
    Camera,
    Tag,
    User,
    AlertTriangle,
    CheckCircle,
    Clock,
    XCircle
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface AssetWithRelations extends Asset {
    item: Item;
    location: Location | null;
    department: department | null;
    assignedUser?: { 
        name: string; 
        email: string;
        department?: { nama_department: string } | null;
    } | null;
}

interface AssetDetailViewProps {
    asset: AssetWithRelations;
}

export function AssetDetailView({ asset }: AssetDetailViewProps) {
    const router = useRouter();
    const { setOpen, setCurrentRow } = useDialog();
    const { can } = usePermission();
    const [imageError, setImageError] = useState(false);

    const getConditionBadge = (condition: string) => {
        const variants = {
            GOOD: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
            REPAIR: { variant: "secondary" as const, icon: Clock, color: "text-yellow-600" },
            BROKEN: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
            LOST: { variant: "outline" as const, icon: AlertTriangle, color: "text-orange-600" },
        };

        const config = variants[condition as keyof typeof variants] || variants.GOOD;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="gap-1">
                <Icon className="h-3 w-3" />
                {condition === "GOOD" && "Bagus"}
                {condition === "REPAIR" && "Dalam Perbaikan"}
                {condition === "BROKEN" && "Rusak"}
                {condition === "LOST" && "Hilang"}
            </Badge>
        );
    };

    const formatCurrency = (amount: number | null) => {
        if (!amount) return "-";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(amount);
    };

    const formatDate = (date: Date | null) => {
        if (!date) return "-";
        return format(new Date(date), "dd MMMM yyyy");
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.back()}
                        className="shrink-0"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {asset.kode_asset || `Asset ${asset.item.name}`}
                        </h1>
                        <p className="text-muted-foreground">
                            Detail lengkap unit asset
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {can('asset', ['edit']) && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                setCurrentRow(asset);
                                setOpen("edit");
                            }}
                            className="gap-2"
                        >
                            <Edit className="h-4 w-4" />
                            Edit
                        </Button>
                    )}
                    {can('asset', ['delete']) && (
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setCurrentRow(asset);
                                setOpen("delete");
                            }}
                            className="gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Hapus
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Asset Photo */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Camera className="h-5 w-5" />
                                Foto Asset
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {asset.photoUrl && !imageError ? (
                                <div className="relative w-full max-w-md mx-auto">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`/uploads/${asset.photoUrl}`}
                                        alt={`Foto ${asset.item.name}`}
                                        className="w-full h-64 object-cover rounded-lg border"
                                        onError={() => setImageError(true)}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center w-full h-64 border-2 border-dashed rounded-lg bg-muted/50">
                                    <div className="text-center">
                                        <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                            {asset.photoUrl ? "Foto tidak dapat dimuat" : "Tidak ada foto"}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Asset Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Informasi Asset
                            </CardTitle>
                            <CardDescription>
                                Detail spesifikasi dan informasi dasar asset
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Tag className="h-4 w-4" />
                                        Kode Asset / Tag
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-6">
                                        {asset.kode_asset || "-"}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Package className="h-4 w-4" />
                                        Item
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-6">
                                        {asset.item.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground pl-6">
                                        Kode: {asset.item.code}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <CheckCircle className="h-4 w-4" />
                                        Kondisi
                                    </div>
                                    <div className="pl-6">
                                        {getConditionBadge(asset.condition || "GOOD")}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Building className="h-4 w-4" />
                                        Department
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-6">
                                        {asset.department?.nama_department || "-"}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <MapPin className="h-4 w-4" />
                                        Lokasi
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-6">
                                        {asset.location?.name || "-"}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <User className="h-4 w-4" />
                                        PIC (Penanggung Jawab)
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-6">
                                        {asset.assignedUser ? (
                                            <>
                                                {asset.assignedUser.name}
                                                {asset.assignedUser.department?.nama_department && ` - ${asset.assignedUser.department.nama_department}`}
                                            </>
                                        ) : (asset.assignedUserId ? "Assigned" : "Not Assigned")}
                                    </p>
                                </div>
                            </div>

                            {/* Additional Details */}
                            <Separator />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Tag className="h-4 w-4" />
                                        Brand
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-6">
                                        {asset.brand || "-"}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Tag className="h-4 w-4" />
                                        Model
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-6">
                                        {asset.model || "-"}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Tag className="h-4 w-4" />
                                        Part Number
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-6">
                                        {asset.partNumber || "-"}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Tag className="h-4 w-4" />
                                        Serial Number
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-6">
                                        {asset.serialNumber || "-"}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <FileText className="h-4 w-4" />
                                        No. SPB
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-6">
                                        {asset.no_spb || "-"}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <FileText className="h-4 w-4" />
                                        No. Dokumen
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-6">
                                        {asset.document_number || "-"}
                                    </p>
                                </div>
                            </div>

                            {/* Notes */}
                            {asset.notes && (
                                <>
                                    <Separator />
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <FileText className="h-4 w-4" />
                                            Catatan
                                        </div>
                                        <p className="text-sm text-muted-foreground pl-6 whitespace-pre-wrap">
                                            {asset.notes}
                                        </p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Purchase Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Informasi Pembelian
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Calendar className="h-4 w-4" />
                                    Tanggal Masuk
                                </div>
                                <p className="text-sm text-muted-foreground pl-6">
                                    {formatDate(asset.inComeDate)}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Calendar className="h-4 w-4" />
                                    Tanggal Beli
                                </div>
                                <p className="text-sm text-muted-foreground pl-6">
                                    {formatDate(asset.purchaseDate)}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <DollarSign className="h-4 w-4" />
                                    Harga Beli
                                </div>
                                <p className="text-sm text-muted-foreground pl-6">
                                    {formatCurrency(asset.purchasePrice)}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Building className="h-4 w-4" />
                                    Vendor / Toko
                                </div>
                                <p className="text-sm text-muted-foreground pl-6">
                                    {asset.vendorName || "-"}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Calendar className="h-4 w-4" />
                                    Garansi Berakhir
                                </div>
                                <p className="text-sm text-muted-foreground pl-6">
                                    {formatDate(asset.warrantyExpire)}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Calendar className="h-4 w-4" />
                                    Garansi Vendor
                                </div>
                                <p className="text-sm text-muted-foreground pl-6">
                                    {formatDate(asset.garansi_exp)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Aksi Cepat</CardTitle>
                            <CardDescription>
                                Operasi umum untuk asset ini
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {can('asset', ['scan-code']) && (
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2"
                                    onClick={() => {
                                        setCurrentRow(asset);
                                        setOpen("view-qr");
                                    }}
                                >
                                    <QrCode className="h-4 w-4" />
                                    Lihat QR Code
                                </Button>
                            )}

                            {can('asset.transfer', ['create']) && (
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2"
                                    onClick={() => {
                                        setCurrentRow(asset);
                                        setOpen("transfer");
                                    }}
                                >
                                    <Move className="h-4 w-4" />
                                    Transfer Asset
                                </Button>
                            )}

                            {can('asset.loan', ['create']) && (
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2"
                                    onClick={() => {
                                        setCurrentRow(asset);
                                        setOpen("loan");
                                    }}
                                >
                                    <Handshake className="h-4 w-4" />
                                    Pinjam Asset
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Asset Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Status Asset</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Status</span>
                                <Badge variant={asset.status === "ACTIVE" ? "default" : "secondary"}>
                                    {asset.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
                                </Badge>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                                Dibuat: {formatDate(asset.createdAt)}
                                {asset.updatedAt && asset.updatedAt.getTime() !== asset.createdAt.getTime() && (
                                    <div>
                                        Diupdate: {formatDate(asset.updatedAt)}
                                    </div>
                                )}
                                {asset.brokenDate && (
                                    <div>
                                        Tanggal Rusak: {formatDate(asset.brokenDate)}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}