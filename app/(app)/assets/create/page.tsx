import { Metadata } from "next";
import AssetAddForm from "../components/asset-add-form";

export const metadata: Metadata = {
  title: "Tambah Aset",
  description: "Tambah unit aset perusahaan",
};
export default function CreateAssetPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tambah Aset</h2>
          <p className="text-muted-foreground">
            Tambah unit aset perusahaan Anda.
          </p>
        </div>
      </div>
      <AssetAddForm />
    </div>
  );
}
