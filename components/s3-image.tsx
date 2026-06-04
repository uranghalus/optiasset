"use client"; // Tambahkan ini agar aman digunakan di komponen klien

import { useEffect, useState } from "react";
import { getPrivateUrl } from "@/lib/s3-utils";

interface S3ImageProps {
    imageKey: string | null;
    alt: string;
    className?: string;
}

export default function S3Image({ imageKey, alt, className = "" }: S3ImageProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        let isMounted = true;

        async function fetchImage() {
            if (!imageKey) {
                setIsLoading(false);
                return;
            }

            try {
                // Memanggil Server Action dari Client Component
                const url = await getPrivateUrl(imageKey);
                if (isMounted) {
                    setImageUrl(url);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Gagal mengambil gambar:", error);
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchImage();

        return () => {
            isMounted = false; // Cleanup untuk menghindari memory leak
        };
    }, [imageKey]);

    // Tampilan saat key kosong
    if (!imageKey) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 border border-dashed border-gray-300 rounded-lg p-4 text-sm text-red-600 ${className}`}>
                ❌ Key gambar tidak tersedia.
            </div>
        );
    }

    // Tampilan saat sedang loading URL dari server
    if (isLoading) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 border border-dashed border-gray-300 rounded-lg p-4 text-sm text-gray-500 animate-pulse ${className}`}>
                Memuat gambar...
            </div>
        );
    }

    // Tampilan saat URL gagal didapatkan (misal error S3)
    if (!imageUrl) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 border border-dashed border-gray-300 rounded-lg p-4 text-sm text-red-600 ${className}`}>
                ❌ Gagal memuat url gambar.
            </div>
        );
    }

    // Tampilan saat berhasil
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={imageUrl}
            alt={alt}
            className={`w-full h-auto object-cover rounded ${className}`}
        />
    );
}