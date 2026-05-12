import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["20.20.20.230", process.env.NEXT_PUBLIC_BASE_URL!],
};

export default nextConfig;
