import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.74.211.32"],
  experimental: {
    proxyClientMaxBodySize: "60mb",
  },
};

export default nextConfig;
