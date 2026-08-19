import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
    ],
    qualities: [75, 90, 95],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default withPayload(nextConfig);
