import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for low-memory deployment
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
