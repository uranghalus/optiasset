'use client'

import { useAssetHistoryById } from '@/hooks/crud/use-asset-history'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { CheckCircle2, CircleDashed } from "lucide-react"

interface AssetHistoryTableProps {
    assetId: string
}


export default function AssetHistoryTable({ assetId }: AssetHistoryTableProps) {
    const { data: assetHistory, isLoading, error } = useAssetHistoryById({ id: assetId })

    // 1. LOADING STATE
    if (isLoading) {
        return (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground italic">
                <span className="animate-pulse">Memuat riwayat aset...</span>
            </div>
        )
    }

    // 2. ERROR STATE
    if (error) {
        return (
            <div className="flex h-32 items-center justify-center text-sm text-red-500">
                Gagal memuat riwayat.
            </div>
        )
    }

    // 3. TYPE GUARD (Solusi untuk error .map)
    // Kita pastikan jika data bukan array (atau object error), kita jadikan array kosong
    const safeHistory = Array.isArray(assetHistory) ? assetHistory : [];

    if (safeHistory.length === 0) {
        return (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground italic">
                Belum ada catatan riwayat untuk aset ini.
            </div>
        )
    }

    return (
        <div className="relative w-full overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[180px]">Waktu</TableHead>
                        <TableHead>Aktivitas</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead className="min-w-[250px]">Keterangan</TableHead>
                        <TableHead className="text-right">Acknowledge</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {/* 4. GUNAKAN safeHistory di sini */}
                    {safeHistory.map((log: any) => (
                        <TableRow key={log.id}>
                            {/* ... (Isi Cell tetap sama) */}
                            <TableCell className="whitespace-nowrap text-xs">
                                {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm", { locale: localeId })}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="font-semibold uppercase text-[10px]">
                                    {log.action.replace(/_/g, " ")}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                                {log.user?.name || "Sistem"}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm leading-none">{log.asset_info}</span>
                                    {log.oldValue && log.newValue && (
                                        <span className="text-[11px] text-muted-foreground italic">
                                            {log.oldValue} <span className="text-primary font-bold">→</span> {log.newValue}
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                {log.isAcknowledged ? (
                                    <div className="flex items-center justify-end gap-1 text-green-600">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span className="text-[10px] font-medium">Diketahui</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-end gap-1 text-yellow-600">
                                        <CircleDashed className="h-4 w-4 animate-spin-slow" />
                                        <span className="text-[10px] font-medium">Menunggu</span>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}