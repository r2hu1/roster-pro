import type { NextConfig } from "next"

const API_URL = process.env.API_URL ?? "http://localhost:3000"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
        pathname: "/",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/v1/:path*`,
      },
    ]
  },
}

export default nextConfig
