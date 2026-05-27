import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  distDir: "dist",
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
