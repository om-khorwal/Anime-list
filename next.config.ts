// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },   // About page hero
      { protocol: "https", hostname: "cdn.myanimelist.net" },   // Jikan posters
    ],
  },
};

export default nextConfig;
