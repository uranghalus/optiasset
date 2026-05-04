"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDialog } from "@/context/dialog-provider";
import { useImportAssetExcel } from "@/hooks/crud/use-asset-classification";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ImportAssetExcelForm,
  ImportAssetExcelSchema,
} from "@/schema/asset-classification-schema";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
export default function ClassificationImportDialog({
  onOpenChange,
  open,
}: Props) {
  const { mutate: importExcel, isPending: importing } = useImportAssetExcel();
  const { data: session } = authClient.useSession();
  const form = useForm<ImportAssetExcelForm>({
    resolver: zodResolver(ImportAssetExcelSchema),
    defaultValues: {
      file: undefined,
    },
  });
  const { errors } = form.formState;

  const onSubmit = (data: ImportAssetExcelForm) => {
    if (!session?.session.activeOrganizationId) {
      toast.error("Organisasi tidak ditemukan");
      return;
    }
    if (!data.file) {
      toast.error("Pilih file terlebih dahulu");
      return;
    }

    const formData = new FormData();
    formData.append("file", data.file);

    importExcel(
      {
        formData: formData,
        organizationId: session.session.activeOrganizationId,
      },
      {
        onSuccess: () => {
          onOpenChange(false); // Tutup dialog jika berhasil
          form.reset(); // Kosongkan file untuk import berikutnya
        },
      },
    );
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) onOpenChange(val);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Impor Golongan</DialogTitle>
          <DialogDescription>Impor golongan dari file Excel</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="file"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>File</FieldLabel>
                <Input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    field.onChange(file);
                  }}
                />
                <FieldError>{errors.file?.message}</FieldError>
              </Field>
            )}
          />
          <Button type="submit" disabled={importing}>
            {importing ? "Mengimpor..." : "Impor"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
