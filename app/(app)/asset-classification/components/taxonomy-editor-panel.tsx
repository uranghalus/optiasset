import { TaxonomyForm } from "./taxonomy-form";

export function TaxonomyEditorPanel({ editor }: any) {
  if (!editor.selected) {
    return (
      <div className="p-8 text-muted-foreground">
        Pilih data atau tambah klasifikasi
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
      />
    </div>
  );
}
