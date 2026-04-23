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
        destination: 'http://13.206.147.84:8080/auth/:path*',
      },
    ];
  },
} satisfies NextConfig;

export default nextConfig;