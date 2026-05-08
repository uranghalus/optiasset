/* eslint-disable react-hooks/error-boundaries */
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAssetById } from "@/action/asset-action";

import { DialogProvider } from "@/context/dialog-provider";
import AssetDialogs from "../components/asset-dialogs";
import { AssetDetailView } from "../components/asset-detail-view";
import { Suspense } from "react";
import AssetHistoryTable from "../components/asset-history-table";

interface AssetDetailPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({
    params,
}: AssetDetailPageProps): Promise<Metadata> {
    const { id } = await params;
    try {
        const asset = await getAssetById(id);
        if (!asset) {
            return {
                title: "Asset Tidak Ditemukan",
            };
        }
        return {
            title: `Detail Asset - ${asset.kode_asset || asset.item.name}`,
            description: `Detail lengkap asset ${asset.item.name}`,
        };
    } catch (error) {
        return {
            title: "Detail Asset",
        };
    }
}

export default async function AssetDetailPage({
    params,
}: AssetDetailPageProps) {
    const { id } = await params;

    try {
        const asset = await getAssetById(id);

        if (!asset) {
            notFound();
        }

        return (
            <DialogProvider>
                <div className="flex flex-col gap-6 pb-10">
                    <AssetDetailView asset={asset} />
                    {/* Wrapper untuk Tabel History */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow">
                        <div className="p-6 flex flex-col space-y-1.5 border-b">
                            <h3 className="font-semibold leading-none tracking-tight text-lg">
                                Riwayat Pergerakan Aset
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Jejak historikal aktivitas, peminjaman, dan mutasi untuk aset ini.
                            </p>
                        </div>
                        <div className="p-0">
                            {/* Suspense agar loading history tidak memblokir render halaman utama */}
                            <Suspense
                                fallback={
                                    <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
                                        Memuat data riwayat...
                                    </div>
                                }
                            >
                                {/* Panggil komponen tabel yang mengambil data history-nya sendiri */}
                                <AssetHistoryTable assetId={asset.id} />
                            </Suspense>
                        </div>
                    </div>
                    <AssetDialogs />
                </div>
            </DialogProvider>
        );
    } catch (error) {
        console.error("Error fetching asset:", error);
        notFound();
    }
}