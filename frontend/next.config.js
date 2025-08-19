/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "media-hosting.imagekit.io",
      "ik.imagekit.io", 
      "images.scalebranding.com",
      "coin-images.coingecko.com",
      "s2.coinmarketcap.com",
      "raw.githubusercontent.com",
      "assets.coingecko.com"
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media-hosting.imagekit.io",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "images.scalebranding.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "coin-images.coingecko.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "s2.coinmarketcap.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
        pathname: "/**"
      }
    ]
  },
  compress: true,
  reactStrictMode: false,
  sassOptions: {
    includePaths: ['./styles']
  },
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js'
        }
      }
    }
  }
}

module.exports = nextConfig
