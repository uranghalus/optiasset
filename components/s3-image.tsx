import { getPrivateUrl } from "@/lib/s3-utils";

interface S3ImageProps {
    imageKey: string | null;
    alt: string;
    className?: string; // Menambahkan dukungan untuk class Tailwind tambahan
}

export default async function S3Image({ imageKey, alt, className = "" }: S3ImageProps) {
    if (!imageKey) {
        return (
            <div className="flex items-center justify-center bg-gray-100 border border-dashed border-gray-300 rounded-lg p-4 text-sm text-red-600">
                ❌ Key gambar tidak tersedia.
            </div>
        );
    }

    // Generate Presigned URL dari server
    const imageUrl = await getPrivateUrl(imageKey);

    if (!imageUrl) {
        return (
            <div className="flex items-center justify-center bg-gray-100 border border-dashed border-gray-300 rounded-lg p-4 text-sm text-red-600">
                ❌ Gagal memuat url gambar.
            </div>
        );
    }

    return (
        // Gunakan tag <img> standar untuk menghindari masalah mixed content (jika TrueNAS via HTTP)
        // Class Tailwind bawaan: lebar penuh, tinggi otomatis, objek menutupi area.
        // Class tambahan akan ditambahkan melalui prop className.
        <img
            src={imageUrl}
            alt={alt}
            className={`w-full h-auto object-cover rounded-lg ${className}`}
            loading="lazy"
        />
    );
}