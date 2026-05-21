"use client";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

// 👇 Sesuaikan import ini dengan hook yang mengambil data dari model `Category` (Polimorfik) Anda

import { useImportAsset } from "@/hooks/crud/use-assets";
import { useCategoriesForSelect } from "@/hooks/crud/use-items";
import { useActiveMemberRole } from "@/hooks/use-active-member";
import { authClient } from "@/lib/auth-client";
import { getAssetFormAccess } from "@/lib/utils";
import { ImportForm, ImportFormSchema } from "@/schema/asset-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileSpreadsheet, UploadCloud, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ImportAssetDialog({ open, onOpenChange }: Props) {
  const [filePreview, setFilePreview] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);

  const form = useForm<ImportForm>({
    resolver: zodResolver(ImportFormSchema),
    defaultValues: {
      categoryId: "", // 👈 Cukup gunakan categoryId saja
      file: undefined,
    },
  });

  const { mutateAsync: importAsset, isPending: isImporting } = useImportAsset();
  const { data: session } = authClient.useSession();

  // Ambil data Kategori Item
  const { data: categories, isLoading: isCategoriesLoading } = useCategoriesForSelect();

  const { data: role } = useActiveMemberRole();
  const { canView } = getAssetFormAccess(role);

  // Reset state saat dialog dibuka/ditutup
  useEffect(() => {
    if (!open) {
      form.reset();
      setFilePreview(null);
      setImportResult(null);
    }
  }, [open, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ekstensi
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ];

    if (
      !validTypes.includes(file.type) &&
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls")
    ) {
      form.setError("file", {
        message: "Harap unggah file dengan format .xls atau .xlsx",
      });
      e.target.value = "";
      return;
    }

    form.setValue("file", file, { shouldValidate: true });
    setFilePreview(file);
    form.clearErrors("file");
  };

  const handleRemoveFile = () => {
    setFilePreview(null);
    form.setValue("file", undefined, { shouldValidate: true });
    const fileInput = document.getElementById("excel-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const onSubmit = async (values: ImportForm) => {
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", values.file);
      // 👇 Kirim categoryId ke Server Action 👇
      formData.append("categoryId", values.categoryId);

      if (!session?.session.activeOrganizationId) {
        form.setError("root", {
          message: "Anda tidak memiliki organisasi aktif",
        });
        return;
      }

      // Panggil Server Action
      const result = await importAsset({
        formData: formData,
        organizationId: session?.session.activeOrganizationId,
      });

      setImportResult(result);

      // Jika tidak ada yang gagal, tutup dialog setelah delay singkat
      if (result.failed === 0) {
        setTimeout(() => onOpenChange(false), 2000);
      }
    } catch (error: any) {
      console.error(error);
      form.setError("root", {
        type: "server",
        message: error?.message ?? "Terjadi kesalahan saat memproses file Excel",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Data Aset (Excel)</DialogTitle>
          <DialogDescription>
            Pilih <b>Kategori Item</b> terlebih dahulu, lalu unggah file Excel berisi daftar aset yang ingin di-import.
          </DialogDescription>
        </DialogHeader>

        <form
          id="import-asset-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {form.formState.errors.root?.message && (
            <p className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {form.formState.errors.root.message}
            </p>
          )}

          {importResult && (
            <div
              className={`p-4 rounded-lg text-sm ${importResult.failed > 0 ? "bg-amber-50 text-amber-900 border border-amber-200" : "bg-green-50 text-green-900 border border-green-200"}`}
            >
              <p className="font-semibold mb-1">Hasil Import:</p>
              <ul className="list-disc list-inside">
                <li>Berhasil: {importResult.success} baris</li>
                <li>Gagal: {importResult.failed} baris</li>
              </ul>
              {importResult.errors?.length > 0 && (
                <div className="mt-2 max-h-32 overflow-y-auto bg-white/50 p-2 rounded text-xs text-red-600 space-y-1">
                  {importResult.errors.map((err: string, i: number) => (
                    <div key={i}>{err}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            {canView && (
              <>
                <h3 className="font-semibold text-sm border-b pb-1">
                  Master Kategori (Wajib)
                </h3>

                <Controller
                  name="categoryId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Kategori Item</FieldLabel>
                      <Combobox
                        title="Pilih Kategori Item"
                        valueKey="id"
                        value={categories?.find((c: any) => c.id === field.value)}
                        searchFn={(search, offset, size) =>
                          Promise.resolve(
                            categories
                              ?.filter((c: any) =>
                                c.name.toLowerCase().includes(search.toLowerCase()) ||
                                (c.code && c.code.toLowerCase().includes(search.toLowerCase()))
                              )
                              .slice(offset, offset + size) || [],
                          )
                        }
                        renderText={(c) => `${c.code ? c.code + ' - ' : ''}${c.name}`}
                        onChange={(c) => field.onChange(c.id)}
                        disabled={isCategoriesLoading || isImporting}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </>
            )}
          </div>

          {/* EXCEL UPLOAD SECTION */}
          <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
            <h3 className="font-semibold text-sm">File Excel</h3>

            <Controller
              name="file"
              control={form.control}
              render={({ fieldState }) => (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="excel-upload"
                      className={`flex-1 ${isImporting ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      <div
                        className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${fieldState.invalid ? "border-red-300 bg-red-50 hover:bg-red-100" : "border-slate-300 hover:bg-slate-100"}`}
                      >
                        {filePreview ? (
                          <div className="flex flex-col items-center">
                            <FileSpreadsheet className="h-10 w-10 text-green-600 mb-2" />
                            <span className="text-sm font-medium text-slate-700 text-center line-clamp-1 px-4">
                              {filePreview.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              {(filePreview.size / 1024).toFixed(2)} KB
                            </span>
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="h-8 w-8 text-slate-400" />
                            <span className="text-sm text-slate-600 font-medium">
                              Klik atau Drag & Drop file Excel ke sini
                            </span>
                          </>
                        )}
                      </div>
                      <input
                        id="excel-upload"
                        type="file"
                        accept=".xlsx, .xls"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isImporting}
                      />
                    </label>
                  </div>

                  {filePreview && !isImporting && (
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-2" /> Hapus File
                      </Button>
                    </div>
                  )}

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                  <p className="text-xs text-slate-500 text-center">
                    Format yang didukung: .xlsx, .xls | Pastikan format kolom sesuai standar.
                  </p>
                </div>
              )}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isImporting}
            >
              Batal
            </Button>
            <Button
              form="import-asset-form"
              type="submit"
              disabled={isImporting || !form.formState.isValid}
              className="w-full md:w-auto"
            >
              {isImporting ? "Memproses Import..." : "Mulai Import Data"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}