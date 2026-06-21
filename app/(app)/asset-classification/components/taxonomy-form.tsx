"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  Plus,
  Save,
  X,
  Pencil,
  FolderPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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

const levelMeta: Record<
  string,
  { label: string; color: string; icon: typeof Plus }
> = {
  group: {
    label: "Golongan",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    icon: FolderPlus,
  },
  category: {
    label: "Kategori",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    icon: FolderPlus,
  },
  cluster: {
    label: "Cluster",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    icon: FolderPlus,
  },
  subcluster: {
    label: "Sub Cluster",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    icon: FolderPlus,
  },
};

function getLevelLabel(level: string) {
  return levelMeta[level]?.label || "Data";
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
      reset({ code: "", name: "", notes: "" });
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
    reset({ code: "", name: "", notes: "" });
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
          createGroup.mutate(fd, { onSuccess: afterCreateSuccess });
          return;
        case "category":
          if (!selected.parentId) {
            alert("Harap tunggu hingga parent tersimpan di database.");
            return;
          }
          fd.append("assetGroupId", selected.parentId);
          createCategory.mutate(fd, { onSuccess: afterCreateSuccess });
          return;
        case "cluster":
          if (!selected.parentId) {
            alert("Harap tunggu hingga parent tersimpan di database.");
            return;
          }
          fd.append("assetCategoryId", selected.parentId);
          createCluster.mutate(fd, { onSuccess: afterCreateSuccess });
          return;
        case "subcluster":
          if (!selected.parentId) {
            alert("Parent tidak valid");
            return;
          }
          fd.append("assetClusterId", selected.parentId);
          createSubCluster.mutate(fd, { onSuccess: afterCreateSuccess });
          return;
      }
    }

    /* UPDATE */
    if (mode === "edit") {
      switch (selected.level) {
        case "group":
          updateGroup.mutate(
            { id: selected.id, formData: fd },
            { onSuccess() { editor.closeEditor(); } }
          );
          return;
        case "category":
          updateCategory.mutate(
            { id: selected.id, formData: fd },
            { onSuccess() { editor.closeEditor(); } }
          );
          return;
        case "cluster":
          updateCluster.mutate(
            { id: selected.id, formData: fd },
            { onSuccess() { editor.closeEditor(); } }
          );
          return;
        case "subcluster":
          updateSubCluster.mutate(
            { id: selected.id, formData: fd },
            { onSuccess() { editor.closeEditor(); } }
          );
          return;
      }
    }
  }

  const meta = levelMeta[selected.level] || levelMeta.subcluster;
  const LevelIcon = mode === "edit" ? Pencil : meta.icon;
  const title =
    mode === "create"
      ? `Tambah ${getLevelLabel(selected.level)}`
      : `Edit ${getLevelLabel(selected.level)}`;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-lg border border-border/50 bg-gradient-to-r from-primary/5 to-muted/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LevelIcon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mode === "create"
                ? "Simpan dan lanjut tambah data atau tutup panel"
                : "Perbarui data klasifikasi"}
            </p>
          </div>
          <Badge className={meta.color} variant="outline">
            {getLevelLabel(selected.level)}
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit(submit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium">Kode</label>
          <Input
            {...register("code")}
            placeholder="Masukkan kode"
            className="font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium">Nama</label>
          <Input {...register("name")} placeholder="Masukkan nama" />
        </div>

        {selected.level === "subcluster" && (
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Catatan</label>
            <Input {...register("notes")} placeholder="Catatan tambahan (opsional)" />
          </div>
        )}

        <div className="flex gap-2 flex-wrap pt-4 border-t">
          {mode === "create" && (
            <>
              <Button
                type="submit"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  submitMode.current = "continue";
                }}
              >
                <Plus className="h-4 w-4" />
                Simpan & Tambah Lagi
              </Button>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  submitMode.current = "close";
                }}
              >
                <Save className="h-4 w-4" />
                Simpan & Tutup
              </Button>
            </>
          )}

          {mode === "edit" && (
            <Button type="submit" size="sm" className="gap-1.5">
              <Save className="h-4 w-4" />
              Update
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            type="button"
            className="gap-1.5"
            onClick={() => editor.closeEditor()}
          >
            <X className="h-4 w-4" />
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}
