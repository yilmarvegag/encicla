import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'stgfilesdemo.z13.web.core.windows.net',
      }
    ],
  },
};

export default nextConfig;
