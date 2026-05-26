"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

import { useCreateDisposal, useAssetsForDisposalSelect } from "@/hooks/crud/use-asset-disposals";
import { DisposalForm, DisposalFormSchema } from "@/schema/disposal-schema";
import { Combobox } from "@/components/ui/combobox";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DisposalActionDialog({
  open,
  onOpenChange,
}: Props) {
  const { mutate: createMutation, isPending } = useCreateDisposal();
  const { data: assets, isLoading: assetsLoading } = useAssetsForDisposalSelect();

  const form = useForm<DisposalForm>({
    resolver: zodResolver(DisposalFormSchema),
    defaultValues: {
      assetId: "",
      reason: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        assetId: "",
        reason: "",
      });
    }
  }, [open, form]);

  const onSubmit = async (values: DisposalForm) => {
    const formData = new FormData();
    formData.append("assetId", values.assetId);
    formData.append("reason", values.reason);

    try {
      await createMutation(formData);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error(error);

      form.setError("root", {
        type: "server",
        message: "Terjadi kesalahan saat menyimpan data",
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset();
        onOpenChange(state);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajukan Penghapusan Aset</DialogTitle>
          <DialogDescription>
            Buat pengajuan penghapusan aset baru untuk diproses secara bertingkat.
          </DialogDescription>
        </DialogHeader>

        <form
          id="disposal-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* GLOBAL ERROR */}
          {form.formState.errors.root?.message && (
            <p className="text-sm text-red-500">
              {form.formState.errors.root.message}
            </p>
          )}

          <div className="space-y-4">
            <FieldGroup>
              {/* PILIH ASET */}
              <Controller
                name="assetId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Pilih Aset</FieldLabel>
                    <Combobox
                      title="Pilih Aset"
                      valueKey="id"
                      value={assets?.find((a) => a.id === field.value)}
                      searchFn={(search, offset, size) =>
                        Promise.resolve(
                          assets
                            ?.filter((a) =>
                              `${a.kode_asset} ${a.brand} ${a.model} ${a.item?.name}`
                                .toLowerCase()
                                .includes(search.toLowerCase())
                            )
                            .slice(offset, offset + size) || []
                        )
                      }
                      renderText={(item) =>
                        `${item.kode_asset || "Tanpa Kode"} - ${item.item?.name || ""} ${item.brand || ""} ${item.model || ""}`
                      }
                      onChange={(item) => field.onChange(item.id)}
                      disabled={isPending || assetsLoading}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* ALASAN PENGHAPUSAN */}
              <Controller
                name="reason"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Alasan Penghapusan</FieldLabel>
                    <Textarea
                      {...field}
                      placeholder="Masukkan alasan lengkap penghapusan aset..."
                      disabled={isPending}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Mengirim..." : "Kirim Pengajuan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
