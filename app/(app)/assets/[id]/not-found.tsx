import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <AlertTriangle className="h-12 w-12 text-orange-500" />
                    </div>
                    <CardTitle>Asset Tidak Ditemukan</CardTitle>
                    <CardDescription>
                        Asset yang Anda cari tidak ada atau telah dihapus.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Button asChild>
                        <Link href="/assets" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Daftar Asset
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}