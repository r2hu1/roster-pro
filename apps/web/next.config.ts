import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  images: {
    domains: ["ik.imagekit.io"],
    unoptimized: true,
  },
}

export default nextConfig
