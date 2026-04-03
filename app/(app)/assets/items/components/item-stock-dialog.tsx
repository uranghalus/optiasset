"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Item } from "@/generated/prisma/client";
import {
  useItemStocks,
  useRecordStockTransaction,
  useStockTransactions,
  useLocationsForSelect,
} from "@/hooks/crud/use-stock";
import { format } from "date-fns";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  Package,
  Plus,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ItemStockDialogProps {
  item: Item | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemStockDialog({
  item,
  open,
  onOpenChange,
}: ItemStockDialogProps) {
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] =
    useState<string>("DEFAULT");
  const [transactionType, setTransactionType] = useState<"IN" | "OUT">("IN");
  const [quantity, setQuantity] = useState<string>("1");
  const [notes, setNotes] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(false);

  const { data: stocks, isLoading: stocksLoading } = useItemStocks(item?.id);
  const { data: locations } = useLocationsForSelect();
  const { data: transactions, isLoading: transactionsLoading } =
    useStockTransactions(selectedStockId || undefined);
  const recordMutation = useRecordStockTransaction();

  if (!item) return null;

  const handleRecord = async () => {
    if (!quantity || parseInt(quantity, 10) <= 0) return;

    try {
      if (isInitializing) {
        await recordMutation.mutateAsync({
          itemId: item.id,
          locationId:
            selectedLocationId === "DEFAULT" ? null : selectedLocationId,
          type: "IN",
          quantity: parseInt(quantity, 10),
          notes: notes || "Initial stock",
        });
        setIsInitializing(false);
      } else if (selectedStockId) {
        await recordMutation.mutateAsync({
          stockId: selectedStockId,
          type: transactionType,
          quantity: parseInt(quantity, 10),
          notes,
        });
      }
      setQuantity("1");
      setNotes("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Stok Barang: {item.name}
            </div>
            {!isInitializing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsInitializing(true)}
                className="gap-2"
              >
                <Plus className="h-3 w-3" /> Inisialisasi Lokasi Baru
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            {item.brand} {item.model} - {item.code}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Ringkasan Stok</TabsTrigger>
            <TabsTrigger value="history" disabled={!selectedStockId}>
              Riwayat Transaksi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 py-4">
            {!isInitializing && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lokasi</TableHead>
                      <TableHead className="text-right">Kuantitas</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stocks?.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-muted-foreground h-24"
                        >
                          Belum ada stok di lokasi manapun. Klik "Inisialisasi"
                          untuk menambah.
                        </TableCell>
                      </TableRow>
                    ) : (
                      stocks?.map((stock: any) => (
                        <TableRow
                          key={stock.id}
                          className={
                            selectedStockId === stock.id ? "bg-muted" : ""
                          }
                        >
                          <TableCell className="font-medium">
                            {stock.location?.name || "Gudang Utama"}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-lg font-bold">
                              {stock.quantity}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedStockId(stock.id)}
                            >
                              Pilih
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {(selectedStockId || isInitializing) && (
              <div className="p-4 border rounded-lg bg-muted/50 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">
                    {isInitializing
                      ? "Inisialisasi Stok Baru"
                      : "Catat Transaksi"}
                  </h3>
                  {isInitializing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsInitializing(false)}
                    >
                      Batal
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {isInitializing ? (
                    <div className="space-y-2 col-span-2">
                      <label className="text-xs font-medium uppercase text-muted-foreground">
                        Pilih Lokasi
                      </label>
                      <Select
                        value={selectedLocationId}
                        onValueChange={setSelectedLocationId}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DEFAULT">Gudang Utama</SelectItem>
                          {locations?.map((loc: any) => (
                            <SelectItem key={loc.id} value={loc.id}>
                              {loc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase text-muted-foreground">
                        Tipe
                      </label>
                      <Select
                        value={transactionType}
                        onValueChange={(v: any) => setTransactionType(v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IN">Stok Masuk (+)</SelectItem>
                          <SelectItem value="OUT">Stok Keluar (-)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div
                    className={
                      isInitializing ? "space-y-2 col-span-2" : "space-y-2"
                    }
                  >
                    <label className="text-xs font-medium uppercase text-muted-foreground">
                      Jumlah
                    </label>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase text-muted-foreground">
                    Catatan
                  </label>
                  <Textarea
                    placeholder={
                      isInitializing
                        ? "Keterangan inisialisasi..."
                        : "Contoh: Pengadaan baru atau Pemakaian rutin"
                    }
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleRecord}
                  disabled={recordMutation.isPending}
                >
                  {recordMutation.isPending
                    ? "Memproses..."
                    : "Simpan Transaksi"}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="py-4 space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <History className="h-4 w-4" />
              Riwayat Transaksi untuk Lokasi Terpilih
            </div>
            <div className="rounded-md border max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tgl / Jam</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead>Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.map((tx: any) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-xs">
                        {format(new Date(tx.createdAt), "dd/MM/yy HH:mm")}
                      </TableCell>
                      <TableCell>
                        {tx.type === "IN" ? (
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-200 bg-green-50 gap-1"
                          >
                            <ArrowUpCircle className="h-3 w-3" /> Masuk
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-red-600 border-red-200 bg-red-50 gap-1"
                          >
                            <ArrowDownCircle className="h-3 w-3" /> Keluar
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        {tx.type === "IN" ? "+" : "-"}
                        {tx.quantity}
                      </TableCell>
                      <TableCell className="text-xs italic text-muted-foreground">
                        {tx.notes || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {transactions?.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Belum ada riwayat transaksi.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
