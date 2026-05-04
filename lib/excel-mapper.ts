export const ASSET_MAPPER = {
  unit: ["unit", "nama barang"],
  model: ["model", "type"],
  kode_asset: ["kode asset", "asset code"],
  pic: ["pic"],
  sn: ["no. seri", "serial number", "sn"],
  lokasi: ["area", "lantai", "lokasi"],
  kondisi_baik: ["baik"],
  kondisi_rusak: ["rusak"],
  tgl_pengadaan: ["tgl", "bln", "thn", "pengadaan"], // Menangkap "Tgl/Bln/Thn" atau "Bln&Thn"
  kepemilikan: ["kepemilikan", "milik"], // Menangkap "Kepemilikan"
  keterangan: ["keterangan", "notes"],
};

export function getColumnIndex(headers: string[], keywords: string[]) {
  return headers.findIndex((h) =>
    keywords.some((k) => h.toLowerCase().includes(k.toLowerCase())),
  );
}
