import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  output: "standalone",
  serverExternalPackages: ["bonjour-service"],
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
};

export default nextConfig;
