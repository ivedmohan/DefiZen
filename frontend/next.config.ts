import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "media-hosting.imagekit.io",
      "ik.imagekit.io",
      "*.imagekit.io",
      "images.scalebranding.com",
      "coin-images.coingecko.com",
      "s2.coinmarketcap.com",
      "raw.githubusercontent.com",
      "assets.coingecko.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.imagekit.io"
      },
      {
        protocol: "https",
        hostname: "media-hosting.imagekit.io"
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io"
      },
      {
        protocol: "https",
        hostname: "images.scalebranding.com"
      },
      {
        protocol: "https",
        hostname: "coin-images.coingecko.com"
      },
      {
        protocol: "https",
        hostname: "s2.coinmarketcap.com"
      },
      {
        protocol: "https",
        hostname: "media-hosting.imagekit.io"
      },
      {
        protocol:"https",
        hostname:'raw.githubusercontent.com'
      },
      {
        protocol:"https",
        hostname:"assets.coingecko.com"
      }
    ],
  },
  compress: true,
  reactStrictMode: false,
  sassOptions: {
    includePaths: ['./styles'],
  },
};

// Use CommonJS export so Next.js reliably reads options when compiled
// (prevents the config object being nested under a `default` key).
module.exports = nextConfig;

// Ensure Next.js reads the config object correctly in all environments
// (some runtimes may wrap an ES module default export). Assign to module.exports
// so the runtime receives the raw config object rather than { default: {...} }.
(module as any).exports = nextConfig;