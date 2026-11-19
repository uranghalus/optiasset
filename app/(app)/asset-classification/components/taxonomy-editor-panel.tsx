import { TaxonomyForm } from "./taxonomy-form";
import { FileEdit, MousePointerClick } from "lucide-react";

export function TaxonomyEditorPanel({ editor, activeTypeFilter }: any) {
  if (!editor.selected) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MousePointerClick className="h-8 w-8" />
          </div>
          <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-chart-2/20 text-chart-2">
            <FileEdit className="h-3 w-3" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            Pilih data atau tambah klasifikasi
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Klik kartu pada panel kiri untuk mengedit, atau gunakan tombol
            "Tambah Golongan" untuk menambah data baru
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <TaxonomyForm
        key={`${editor.mode}-${editor.selected?.id}-${editor.selected?.parentId}`}
        mode={editor.mode}
        selected={editor.selected}
        editor={editor}
        activeTypeFilter={activeTypeFilter}
      />
    </div>
  );
}
