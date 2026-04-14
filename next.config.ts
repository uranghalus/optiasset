import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.91.37', process.env.NEXT_PUBLIC_BASE_URL!],
};

export default nextConfig;
