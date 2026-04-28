import { Metadata } from "next";
import React from "react";
import AssetClassificationWrapper from "./components/classification-wrapper";
export const metadata: Metadata = {
  title: "Klasifikasi Aset",
  description: "Manajemen klasifikasi aset perusahaan",
};
export default function AssetClassificationPage() {
  return <AssetClassificationWrapper />;
}
