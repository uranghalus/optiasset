import AssetEditForm from "../../components/asset-edit-form";

export default async function EditAssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Tunggu (await) parameter dari URL
  const resolvedParams = await params;
  const assetId = resolvedParams.id;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Detail Aset</h1>
        <p className="text-muted-foreground">
          Perbarui informasi data aset, lokasi, atau status kondisinya.
        </p>
      </div>

      <hr className="my-4" />

      {/* Panggil Client Component form Anda di sini dan oper ID-nya */}
      <AssetEditForm assetId={assetId} />
    </div>
  );
}
