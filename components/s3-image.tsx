"use client";

import { getPrivateUrl } from "@/lib/s3-utils";
import { useEffect, useState } from "react";

interface S3ImageProps {
    imageKey: string | null;
    alt: string;
    className?: string;
}

export default function S3Image({ imageKey, alt, className = "" }: S3ImageProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    useEffect(() => {
        async function fetchUrl() {
            if (!imageKey) {
                setIsLoading(false);
                return;
            }

            try {
                const url = await getPrivateUrl(imageKey);
                setImageUrl(url);
            } catch (error) {
                console.error("Gagal memuat URL gambar", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchUrl();
    }, [imageKey]);
    if (isLoading) {
        return <div className={`animate-pulse bg-gray-200 rounded ${className}`}>Memuat Gambar</div>;
    }
    if (!imageUrl) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 text-gray-500 rounded border border-dashed p-4 ${className}`}>
                Gambar tidak tersedia
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={alt}
            className={`object-cover rounded-md ${className}`}
        />
    );
}