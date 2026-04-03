"use client";

import { QRCodeSVG } from "qrcode.react";
import React from "react";

interface AssetQRCodeProps {
  assetId: string;
  value?: string;
  size?: number;
  level?: "L" | "M" | "Q" | "H";
  includeMargin?: boolean;
}

export function AssetQRCode({
  assetId,
  value,
  size = 120,
  level = "M",
  includeMargin = true,
}: AssetQRCodeProps) {
  // If no specific value is provided, we default to the view asset URL
  const qrValue =
    value ||
    `${typeof window !== "undefined" ? window.location.origin : ""}/assets/view/${assetId}`;

  return (
    <div className="flex flex-col items-center justify-center bg-white p-2 border border-muted rounded-sm">
      <QRCodeSVG
        value={qrValue}
        size={size}
        level={level}
        includeMargin={includeMargin}
      />
    </div>
  );
}
