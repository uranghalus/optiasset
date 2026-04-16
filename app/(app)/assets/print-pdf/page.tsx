import { getAssetsForPrint } from "@/action/asset-action";
import { format } from "date-fns";
import { Metadata } from "next";

export async function generateMetadata({
    searchParams,
}: {
    searchParams: { type: "all" | "monthly"; month?: string; year?: string };
}): Promise<Metadata> {
    const { type, month, year } = searchParams;
    const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const title = type === "monthly" && month && year
        ? `Laporan Aset - ${monthNames[parseInt(month) - 1]} ${year}`
        : "Laporan Aset - Semua Data";

    return {
        title,
    };
}

export default async function PrintPDFPage({
    searchParams,
}: {
    searchParams: { type: "all" | "monthly"; month?: string; year?: string };
}) {
    const { type, month, year } = searchParams;
    const assets = await getAssetsForPrint({ type, month, year });

    const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const title = type === "monthly" && month && year
        ? `Laporan Aset - ${monthNames[parseInt(month) - 1]} ${year}`
        : "Laporan Aset - Semua Data";

    return (
        <div style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px',
            lineHeight: '1.4',
            margin: '0',
            padding: '20px'
        }}>
            <style jsx>{`
                @page {
                    size: A4;
                    margin: 1cm;
                }
                @media print {
                    body { print-color-adjust: exact; }
                }
            `}</style>

            <div style={{
                textAlign: 'center',
                marginBottom: '30px',
                borderBottom: '2px solid #000',
                paddingBottom: '10px'
            }}>
                <h1 style={{
                    margin: '0',
                    fontSize: '18px',
                    fontWeight: 'bold'
                }}>{title}</h1>
                <p style={{
                    margin: '5px 0',
                    color: '#666'
                }}>Dicetak pada: {format(new Date(), "dd MMMM yyyy, HH:mm")}</p>
                <p style={{
                    margin: '5px 0',
                    color: '#666'
                }}>Total Aset: {assets.length}</p>
            </div>

            {assets.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#666'
                }}>
                    <p>Tidak ada data aset untuk ditampilkan</p>
                </div>
            ) : (
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginTop: '20px'
                }}>
                    <thead>
                        <tr>
                            <th style={{
                                border: '1px solid #ddd',
                                padding: '8px',
                                textAlign: 'left',
                                backgroundColor: '#f5f5f5',
                                fontWeight: 'bold'
                            }}>No</th>
                            <th style={{
                                border: '1px solid #ddd',
                                padding: '8px',
                                textAlign: 'left',
                                backgroundColor: '#f5f5f5',
                                fontWeight: 'bold'
                            }}>Barcode</th>
                            <th style={{
                                border: '1px solid #ddd',
                                padding: '8px',
                                textAlign: 'left',
                                backgroundColor: '#f5f5f5',
                                fontWeight: 'bold'
                            }}>Item</th>
                            <th style={{
                                border: '1px solid #ddd',
                                padding: '8px',
                                textAlign: 'left',
                                backgroundColor: '#f5f5f5',
                                fontWeight: 'bold'
                            }}>Brand/Model</th>
                            <th style={{
                                border: '1px solid #ddd',
                                padding: '8px',
                                textAlign: 'left',
                                backgroundColor: '#f5f5f5',
                                fontWeight: 'bold'
                            }}>Part Number</th>
                            <th style={{
                                border: '1px solid #ddd',
                                padding: '8px',
                                textAlign: 'left',
                                backgroundColor: '#f5f5f5',
                                fontWeight: 'bold'
                            }}>Kondisi</th>
                            <th style={{
                                border: '1px solid #ddd',
                                padding: '8px',
                                textAlign: 'left',
                                backgroundColor: '#f5f5f5',
                                fontWeight: 'bold'
                            }}>Tgl. Beli</th>
                            <th style={{
                                border: '1px solid #ddd',
                                padding: '8px',
                                textAlign: 'left',
                                backgroundColor: '#f5f5f5',
                                fontWeight: 'bold'
                            }}>Lokasi</th>
                            <th style={{
                                border: '1px solid #ddd',
                                padding: '8px',
                                textAlign: 'left',
                                backgroundColor: '#f5f5f5',
                                fontWeight: 'bold'
                            }}>Departemen</th>
                            <th style={{
                                border: '1px solid #ddd',
                                padding: '8px',
                                textAlign: 'left',
                                backgroundColor: '#f5f5f5',
                                fontWeight: 'bold'
                            }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map((asset, index) => (
                            <tr key={asset.id}>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '8px',
                                    textAlign: 'left',
                                    verticalAlign: 'top'
                                }}>{index + 1}</td>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '8px',
                                    textAlign: 'left',
                                    verticalAlign: 'top'
                                }}>{asset.barcode || "-"}</td>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '8px',
                                    textAlign: 'left',
                                    verticalAlign: 'top'
                                }}>{asset.item?.name || "-"}</td>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '8px',
                                    textAlign: 'left',
                                    verticalAlign: 'top'
                                }}>{[asset.brand, asset.model].filter(Boolean).join(" ") || "-"}</td>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '8px',
                                    textAlign: 'left',
                                    verticalAlign: 'top'
                                }}>{asset.partNumber || "-"}</td>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '8px',
                                    textAlign: 'left',
                                    verticalAlign: 'top'
                                }}>{asset.condition || "-"}</td>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '8px',
                                    textAlign: 'left',
                                    verticalAlign: 'top'
                                }}>
                                    {asset.purchaseDate
                                        ? format(new Date(asset.purchaseDate), "dd/MM/yyyy")
                                        : "-"}
                                </td>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '8px',
                                    textAlign: 'left',
                                    verticalAlign: 'top'
                                }}>{asset.location?.name || "-"}</td>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '8px',
                                    textAlign: 'left',
                                    verticalAlign: 'top'
                                }}>{asset.department?.nama_department || "-"}</td>
                                <td style={{
                                    border: '1px solid #ddd',
                                    padding: '8px',
                                    textAlign: 'left',
                                    verticalAlign: 'top'
                                }}>{asset.status || "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div style={{
                marginTop: '30px',
                textAlign: 'right',
                fontSize: '10px',
                color: '#666'
            }}>
                <p>Dicetak menggunakan OptiAsset</p>
            </div>
        </div>
    );
}