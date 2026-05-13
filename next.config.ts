import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    '20.20.20.230',
    '10.223.232.47',
    '172.17.87.55',
    'optiasset.loca.lt',
  ],
};

export default nextConfig;
