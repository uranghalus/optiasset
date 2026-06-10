import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    '20.20.20.230',
    '10.223.232.47',
    '172.17.87.55',
    'optiasset.loca.lt',
    '172.18.24.152',
    '10.84.193.47'
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

export default nextConfig;
