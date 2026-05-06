import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["10.223.232.47", process.env.NEXT_PUBLIC_BASE_URL!],
};

export default nextConfig;
