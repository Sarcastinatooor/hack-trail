import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/incident/:slug/opengraph-image", destination: "/api/og/:slug" }];
  },
};

export default nextConfig;
