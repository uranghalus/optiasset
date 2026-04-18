/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useDialog } from "@/context/dialog-provider";
import React, { useEffect, useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
    Field,
    FieldContent,
    FieldDescription,
    FieldLabel,
    FieldTitle,
} from "@/components/ui/field";

import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useExportAssets } from "@/hooks/crud/use-assets";
import { SpinnerEmpty } from "@/components/loader";
import { authClient } from "@/lib/auth-client";

export function AssetPrintDialog() {
    const { open, setOpen } = useDialog();

    const [printType, setPrintType] = useState<"all" | "latest" | "monthly">("all");

    const [dateRange, setDateRange] = useState<{
        from?: Date;
        to?: Date;
    }>({});

    const [fileUrl, setFileUrl] = useState<string | null>(null);

    const { mutateAsync, isPending } = useExportAssets();

    // ✅ Reset saat dialog dibuka ulang
    useEffect(() => {
        if (open === "print-pdf") {
            setFileUrl(null);
        }
    }, [open]);

    // ✅ Cleanup blob (hindari memory leak)
    useEffect(() => {
        return () => {
            if (fileUrl) URL.revokeObjectURL(fileUrl);
        };
    }, [fileUrl]);

    const { data: session } = authClient.useSession();
    const handlePrint = async () => {
        try {
            setFileUrl(null);
            const payload: any = {
                type: printType === "monthly" ? "range" : printType,
                organizationId: session?.session.activeOrganizationId, // 🔥 ganti dari session
            };

            if (printType === "monthly" && dateRange.from) {
                const from = new Date(dateRange.from);
                const to = new Date(dateRange.to ?? dateRange.from);

                // ✅ FIX timezone
                from.setHours(0, 0, 0, 0);
                to.setHours(23, 59, 59, 999);

                payload.dateFrom = from;
                payload.dateTo = to;
            }

            const base64 = await mutateAsync(payload);

            // ✅ base64 → blob
            const binary = atob(base64);
            const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
            const blob = new Blob([bytes], { type: "application/pdf" });

            const url = URL.createObjectURL(blob);

            // ❗ simpan, tidak langsung download
            setFileUrl(url);
        } catch (error) {
            console.error("Export failed:", error);
        }
    };

    const handleDownload = () => {
        if (!fileUrl) return;

        const a = document.createElement("a");
        a.href = fileUrl;
        a.download = `assets-${printType}.pdf`;
        a.click();
    };

    return (
        <Dialog
            open={open === "print-pdf"}
            onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Cetak Laporan Aset</DialogTitle>
                    <DialogDescription>
                        Pilih jenis cetakan yang diinginkan
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* TYPE */}
                    <div className="space-y-2">
                        <Label>Jenis Cetakan</Label>

                        <RadioGroup
                            value={printType}
                            onValueChange={(val) =>
                                setPrintType(val as "all" | "latest" | "monthly")
                            }
                        >
                            <FieldLabel htmlFor="all">
                                <Field orientation="horizontal">
                                    <FieldContent>
                                        <FieldTitle>Semua Aset</FieldTitle>
                                        <FieldDescription>
                                            Cetak semua data aset
                                        </FieldDescription>
                                    </FieldContent>
                                    <RadioGroupItem value="all" id="all" />
                                </Field>
                            </FieldLabel>

                            <FieldLabel htmlFor="latest">
                                <Field orientation="horizontal">
                                    <FieldContent>
                                        <FieldTitle>Data Terbaru</FieldTitle>
                                        <FieldDescription>
                                            Cetak data aset terbaru
                                        </FieldDescription>
                                    </FieldContent>
                                    <RadioGroupItem value="latest" id="latest" />
                                </Field>
                            </FieldLabel>

                            <FieldLabel htmlFor="monthly">
                                <Field orientation="horizontal">
                                    <FieldContent>
                                        <FieldTitle>Periode Tanggal</FieldTitle>
                                        <FieldDescription>
                                            Cetak berdasarkan rentang tanggal
                                        </FieldDescription>
                                    </FieldContent>
                                    <RadioGroupItem value="monthly" id="monthly" />
                                </Field>
                            </FieldLabel>
                        </RadioGroup>
                    </div>

                    {/* DATE RANGE */}
                    {printType === "monthly" && (
                        <div className="space-y-2">
                            <Label>Rentang Tanggal</Label>

                            <DateRangePicker
                                onChange={(range) => setDateRange(range || {})}
                            />
                        </div>
                    )}

                    {/* LOADING */}
                    {isPending && (
                        <div className="flex justify-center">
                            <SpinnerEmpty />
                        </div>
                    )}

                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(null)}>
                        Batal
                    </Button>

                    {!fileUrl ? (
                        <Button
                            onClick={handlePrint}
                            disabled={
                                isPending ||
                                (printType === "monthly" &&
                                    (!dateRange.from || !dateRange.to))
                            }
                        >
                            {isPending ? "Memproses..." : "Generate PDF"}
                        </Button>
                    ) : (
                        <Button onClick={handleDownload}>
                            Unduh PDF
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}