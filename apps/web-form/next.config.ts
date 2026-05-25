import type { NextConfig } from "next";

const nextConfig: NextConfig = {
images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'encicla-portal-prd-staging-fxhth4dnh3b9fqfr.eastus2-01.azurewebsites.net',
      },
    ],
  },
}

export default nextConfig;
