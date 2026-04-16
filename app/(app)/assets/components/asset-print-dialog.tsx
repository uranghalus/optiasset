"use client";
import { useDialog } from "@/context/dialog-provider";
import React, { useState } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function AssetPrintDialog() {
    const { open, setOpen } = useDialog();
    const [printType, setPrintType] = useState<"all" | "monthly">("all");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState(new Date().getFullYear().toString());

    const handlePrint = () => {
        let url = "/assets/print-pdf?type=" + printType;
        if (printType === "monthly" && month && year) {
            url += `&month=${month}&year=${year}`;
        }
        window.open(url, "_blank");
        setOpen(null);
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

    return (
        <Dialog open={open === "print"} onOpenChange={() => setOpen("print")}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Cetak Laporan Aset</DialogTitle>
                    <DialogDescription>
                        Pilih jenis cetakan yang diinginkan
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Jenis Cetakan</Label>
                        <Select value={printType} onValueChange={(value: "all" | "monthly") => setPrintType(value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Cetak Semua Data</SelectItem>
                                <SelectItem value="monthly">Cetak Data Bulan Tertentu</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {printType === "monthly" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Bulan</Label>
                                <Select value={month} onValueChange={setMonth}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih bulan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="01">Januari</SelectItem>
                                        <SelectItem value="02">Februari</SelectItem>
                                        <SelectItem value="03">Maret</SelectItem>
                                        <SelectItem value="04">April</SelectItem>
                                        <SelectItem value="05">Mei</SelectItem>
                                        <SelectItem value="06">Juni</SelectItem>
                                        <SelectItem value="07">Juli</SelectItem>
                                        <SelectItem value="08">Agustus</SelectItem>
                                        <SelectItem value="09">September</SelectItem>
                                        <SelectItem value="10">Oktober</SelectItem>
                                        <SelectItem value="11">November</SelectItem>
                                        <SelectItem value="12">Desember</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Tahun</Label>
                                <Select value={year} onValueChange={setYear}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((y) => (
                                            <SelectItem key={y} value={y}>
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(null)}>
                        Batal
                    </Button>
                    <Button onClick={handlePrint} disabled={printType === "monthly" && (!month || !year)}>
                        Cetak PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}