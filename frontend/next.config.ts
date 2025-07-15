import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: 'https://glanceable-backend-985142625034.us-central1.run.app/:path*',
      },
    ];
  },
};

export default nextConfig;
