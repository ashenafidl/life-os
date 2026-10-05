import phosphorPkg from "@phosphor-icons/react/package.json";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  output: "standalone",
  serverExternalPackages: ["bonjour-service"],
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  env: {
    NEXT_PUBLIC_PHOSPHOR_VERSION: phosphorPkg.version,
  },
};

export default nextConfig;
