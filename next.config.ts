import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.20.45', process.env.NEXT_PUBLIC_BASE_URL!],
};

export default nextConfig;
