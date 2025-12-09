import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  
};

export default nextConfig;
