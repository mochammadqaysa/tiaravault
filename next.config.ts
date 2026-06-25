import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [],
  },
  serverExternalPackages: ["bcryptjs", "@prisma/client", "prisma"],
  allowedDevOrigins: ["127.0.0.1", "localhost", "::1"],
};

export default nextConfig;
