/* eslint-disable react-hooks/error-boundaries */
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAssetById } from "@/action/asset-action";

import { DialogProvider } from "@/context/dialog-provider";
import AssetDialogs from "../components/asset-dialogs";
import { AssetDetailView } from "../components/asset-detail-view";

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
                <AssetDetailView asset={asset} />
                <AssetDialogs />
            </DialogProvider>
        );
    } catch (error) {
        console.error("Error fetching asset:", error);
        notFound();
    }
}