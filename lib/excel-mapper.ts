export const ASSET_MAPPER = {
  unit: ["unit", "nama barang"],
  model: ["model", "type", "ukuran"], // Menangkap "Model/ Type/Ukuran"
  kode_asset: ["kode asset", "asset code"],
  pic: ["pic"],
  sn: ["seri", "sn"], // Akan menangkap "Keterangan NO. SERI"
  lantai: ["lantai"],
  area: ["area", "lokasi"], // Akan menangkap "Area" baik yang di depan atau di dalam Keterangan
  baik: ["baik"],   // Menangkap kolom khusus "Baik"
  rusak: ["rusak"], // Menangkap kolom khusus "Rusak"
  tgl_pengadaan: ["tgl", "bln", "thn", "pengadaan"], // Menangkap "Bln&Thn"
  kepemilikan: ["kepemilikan", "milik"],
  keterangan: ["keterangan"], // Hanya untuk text keterangan umum (jika ada)
};

// Fungsi pencarian menggunakan header yang sudah digabung
export function getColumnIndex(headers: string[], keywords: string[]) {
  return headers.findIndex((h) =>
    keywords.some((k) => h.includes(k.toLowerCase())),
  );
}