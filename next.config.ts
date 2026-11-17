import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{
      source: "/:path*",
      has: [{ type: "host", value: "hack-trail\\.vercel\\.app" }],
      destination: "https://unrekttt.vercel.app/:path*",
      permanent: true,
    }];
  },
  async rewrites() {
    return [{ source: "/incident/:slug/opengraph-image", destination: "/api/og/:slug" }];
  },
};

export default nextConfig;
