"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  useCreateAssetGroup,
  useCreateAssetCategory,
  useCreateAssetCluster,
  useCreateAssetSubCluster,
  useUpdateAssetGroup,
  useUpdateAssetCategory,
  useUpdateAssetCluster,
  useUpdateAssetSubCluster,
} from "@/hooks/crud/use-asset-classification";

type FormValues = {
  code: string;
  name: string;
  notes?: string;
};

function getLevelLabel(level: string) {
  switch (level) {
    case "group":
      return "Golongan";

    case "category":
      return "Kategori";

    case "cluster":
      return "Cluster";

    case "subcluster":
      return "Sub Cluster";

    default:
      return "Data";
  }
}

export function TaxonomyForm({ mode, selected, editor }: any) {
  const submitMode = useRef<"continue" | "close">("continue");

  const form = useForm<FormValues>({
    defaultValues: {
      code: "",
      name: "",
      notes: "",
    },
  });

  const { register, handleSubmit, reset } = form;

  useEffect(() => {
    if (mode === "create") {
      reset({
        code: "",
        name: "",
        notes: "",
      });
      return;
    }

    if (mode === "edit" && selected?.data) {
      reset({
        code: selected.data.code || "",
        name: selected.data.name || "",
        notes: selected.data.notes || "",
      });
    }
  }, [mode, selected?.id, selected?.parentId, selected?.level, reset]);

  const createGroup = useCreateAssetGroup();

  const createCategory = useCreateAssetCategory();

  const createCluster = useCreateAssetCluster();

  const createSubCluster = useCreateAssetSubCluster();

  const updateGroup = useUpdateAssetGroup();

  const updateCategory = useUpdateAssetCategory();

  const updateCluster = useUpdateAssetCluster();

  const updateSubCluster = useUpdateAssetSubCluster();

  function afterCreateSuccess() {
    if (submitMode.current === "close") {
      editor.closeEditor();
      return;
    }

    reset({
      code: "",
      name: "",
      notes: "",
    });
  }

  function submit(values: FormValues) {
    const fd = new FormData();

    fd.append("code", values.code);

    fd.append("name", values.name);

    if (values.notes) {
      fd.append("notes", values.notes);
    }

    /* CREATE */
    if (mode === "create") {
      switch (selected.level) {
        case "group":
          createGroup.mutate(fd, {
            onSuccess: afterCreateSuccess,
          });
          return;

        case "category":
          if (!selected.parentId || selected.parentId.includes("-")) {
            alert("Harap tunggu hingga parent tersimpan di database.");
            return;
          }
          fd.append("assetGroupId", selected.parentId);

          createCategory.mutate(fd, {
            onSuccess: afterCreateSuccess,
          });
          return;

        case "cluster":
          if (!selected.parentId || selected.parentId.includes("-")) {
            alert("Harap tunggu hingga parent tersimpan di database.");
            return;
          }
          fd.append("assetCategoryId", selected.parentId);

          createCluster.mutate(fd, {
            onSuccess: afterCreateSuccess,
          });
          return;

        case "subcluster":
          if (!selected.parentId || selected.parentId.includes("-")) {
            alert("Harap tunggu hingga parent tersimpan di database.");
            return;
          }
          fd.append("assetClusterId", selected.parentId);

          createSubCluster.mutate(fd, {
            onSuccess: afterCreateSuccess,
          });
          return;
      }
    }

    /* UPDATE */
    if (mode === "edit") {
      switch (selected.level) {
        case "group":
          updateGroup.mutate(
            {
              id: selected.id,
              formData: fd,
            },
            {
              onSuccess() {
                editor.closeEditor();
              },
            },
          );
          return;

        case "category":
          updateCategory.mutate(
            {
              id: selected.id,
              formData: fd,
            },
            {
              onSuccess() {
                editor.closeEditor();
              },
            },
          );
          return;

        case "cluster":
          updateCluster.mutate(
            {
              id: selected.id,
              formData: fd,
            },
            {
              onSuccess() {
                editor.closeEditor();
              },
            },
          );
          return;

        case "subcluster":
          updateSubCluster.mutate(
            {
              id: selected.id,
              formData: fd,
            },
            {
              onSuccess() {
                editor.closeEditor();
              },
            },
          );
          return;
      }
    }
  }

  const title =
    mode === "create"
      ? `Tambah ${getLevelLabel(selected.level)}`
      : `Edit ${getLevelLabel(selected.level)}`;

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold">{title}</h2>

        <p className="text-sm text-muted-foreground mt-1">
          {mode === "create"
            ? "Simpan dan lanjut tambah data atau tutup panel"
            : "Perbarui data klasifikasi"}
        </p>
      </div>

      <form onSubmit={handleSubmit(submit)} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">Kode</label>
          <Input {...register("code")} placeholder="Code" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Nama</label>
          <Input {...register("name")} placeholder="Name" />
        </div>

        {selected.level === "subcluster" && (
          <div>
            <label className="mb-2 block text-sm font-medium">Catatan</label>
            <Input {...register("notes")} placeholder="Notes" />
          </div>
        )}

        <div className="flex gap-3 flex-wrap pt-4">
          {mode === "create" && (
            <>
              <Button
                type="submit"
                onClick={() => {
                  submitMode.current = "continue";
                }}
              >
                Simpan & Tambah Lagi
              </Button>

              <Button
                type="submit"
                variant="outline"
                onClick={() => {
                  submitMode.current = "close";
                }}
              >
                Simpan & Tutup
              </Button>
            </>
          )}

          {mode === "edit" && <Button type="submit">Update</Button>}

          <Button
            variant="ghost"
            type="button"
            onClick={() => editor.closeEditor()}
          >
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}
