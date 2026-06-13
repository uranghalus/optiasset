"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";

interface S3DocumentLinkProps {
    documentKey?: string | null;
}

function getFileNameFromKey(key?: string | null) {
    if (!key) return "dokumen-asset";
    try {
        const decoded = decodeURIComponent(key);
        return decoded.split("/").pop() || "dokumen-asset";
    } catch {
        return key.split("/").pop() || "dokumen-asset";
    }
}

export default function S3DocumentLink({ documentKey }: S3DocumentLinkProps) {
    const [documentUrl, setDocumentUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        async function fetchUrl() {
            if (!documentKey) {
                if (mounted) {
                    setDocumentUrl(null);
                    setError(null);
                    setIsLoading(false);
                }
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const res = await fetch(`/api/s3/signed-url?key=${encodeURIComponent(documentKey)}`);
                const data = await res.json();
                const signedUrl = data?.url || null;
                if (!mounted) return;
                if (!signedUrl) {
                    setError("Tidak dapat memuat dokumen.");
                    setDocumentUrl(null);
                } else {
                    setDocumentUrl(signedUrl);
                }
            } catch (err) {
                console.error("Gagal memuat URL dokumen", err);
                if (mounted) {
                    setError("Tidak dapat memuat dokumen.");
                    setDocumentUrl(null);
                }
            } finally {
                if (mounted) setIsLoading(false);
            }
        }

        fetchUrl();

        return () => {
            mounted = false;
        };
    }, [documentKey]);

    const fileName = getFileNameFromKey(documentKey);

    if (isLoading) {
        return (
            <div className="text-sm text-muted-foreground pl-6">
                Memuat dokumen...
            </div>
        );
    }

    if (error || !documentUrl) {
        return (
            <div className="text-sm text-destructive pl-6">
                {error ?? "Dokumen tidak tersedia."}
            </div>
        );
    }

    return (
        <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="outline" size="sm" className="gap-2" asChild>
                <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Lihat Dokumen
                </a>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild>
                <a href={documentUrl} download={fileName}>
                    <Download className="h-3.5 w-3.5" />
                    Unduh Dokumen
                </a>
            </Button>
        </div>
    );
}
