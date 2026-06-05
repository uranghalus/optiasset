"use client";

interface S3ImageProps {
    imageKey: string | null;
    alt: string;
    className?: string;
}

export default function S3Image({ imageKey, alt, className = "" }: S3ImageProps) {
    // Tampilan saat key kosong
    if (!imageKey) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 border border-dashed border-gray-300 rounded-lg p-4 text-sm text-red-600 ${className}`}>
                ❌ Key gambar tidak tersedia.
            </div>
        );
    }

    // Menggunakan API route lokal untuk proxy image dari S3 
    // Ini menyelesaikan masalah Mixed Content (HTTP S3 di web HTTPS), 
    // masalah CORS, dan menghindari error pemanggilan Server Action di Client.
    const imageUrl = `/api/image?key=${encodeURIComponent(imageKey)}`;

    // Tampilan saat berhasil
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={imageUrl}
            alt={alt}
            className={`w-full h-auto object-cover rounded ${className}`}
            onError={(e) => {
                // Fallback sederhana jika gambar gagal dimuat dari API route
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZmlsbD0iIzk5OSI+SW1hZ2Ugbm90IGZvdW5kPC90ZXh0Pjwvc3ZnPg==';
            }}
        />
    );
}