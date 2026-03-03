import type { NextConfig } from "next";

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: 'http://3.111.147.73:8080/auth/:path*',
      },
    ];
  },
} satisfies NextConfig;

export default nextConfig;