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
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { useRejectLoan } from "@/hooks/crud/use-asset-loans";
import { z } from "zod";

const RejectSchema = z.object({
  reason: z.string().min(5, "Alasan minimal 5 karakter"),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: any;
};

export function LoanRejectDialog({ open, onOpenChange, loan }: Props) {
  const rejectMutation = useRejectLoan();

  const form = useForm({
    resolver: zodResolver(RejectSchema),
    defaultValues: {
      reason: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ reason: "" });
    }
  }, [open, form]);

  const onSubmit = async (values: { reason: string }) => {
    try {
      await rejectMutation.mutateAsync({
        loanId: loan.id,
        reason: values.reason,
      });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tolak Peminjaman</DialogTitle>
          <DialogDescription>
            Berikan alasan penolakan untuk peminjaman aset oleh{" "}
            <span className="font-bold text-foreground">
              {loan?.borrower?.name}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <Controller
            name="reason"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Alasan Penolakan</FieldLabel>
                <Textarea
                  {...field}
                  placeholder="Contoh: Aset sedang digunakan untuk keperluan mendesak..."
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={rejectMutation.isPending}
              variant="destructive"
              className="w-full"
            >
              {rejectMutation.isPending ? "Memproses..." : "Konfirmasi Tolak"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
