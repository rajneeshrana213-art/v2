const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

/** @type {import('next').NextConfig} */
const nextConfig = {
 
  output: "standalone",
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  turbopack: {},
  transpilePackages: ["lucide-react"],

  // TODO: Remove after fixing React 19 type issues (useRef, ReactElement.props, react-hook-form)
  typescript: {
    ignoreBuildErrors: true,
  },


  // ⚡ Performance Optimizations - Lightning Fast
  productionBrowserSourceMaps: false,
  serverExternalPackages: ["@prisma/client"],
  experimental: {
    optimizePackageImports: [
      "@headlessui/react",
      "@heroicons/react",
      "framer-motion",
      "lucide-react",
    ],
  },

  webpack: (config) => {
    return config;
  },

  // ⚡ Image Optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
       {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized image responses for 60 seconds
    minimumCacheTTL: 60,
  },

  // ⚡ HTTP Headers for caching
  async headers() {
    return [
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  env: {
    STREAM_API_KEY: process.env.STREAM_API_KEY,
  },

  async rewrites() {
    return [
      {
        source: "/superadmin/:path*",
        destination: "/dashboard/superadmin/:path*",
      },
      { source: "/admin/:path*", destination: "/dashboard/admin/:path*" },
      { source: "/teacher/:path*", destination: "/dashboard/teacher/:path*" },
      { source: "/student/:path*", destination: "/dashboard/student/:path*" },
      { source: "/parents/:path*", destination: "/dashboard/parent/:path*" },
      {
        source: "/academics/:path*",
        destination: "/dashboard/academics/:path*",
      },
      { source: "/accounts/:path*", destination: "/dashboard/accounts/:path*" },
      { source: "/driver/:path*", destination: "/dashboard/driver/:path*" },
      { source: "/employee/:path*", destination: "/dashboard/employee/:path*" },
      { source: "/hostel/:path*", destination: "/dashboard/hostel/:path*" },
      { source: "/library/:path*", destination: "/dashboard/library/:path*" },
      { source: "/staff/:path*", destination: "/dashboard/staff/:path*" },
      {
        source: "/transport/:path*",
        destination: "/dashboard/transport/:path*",
      },
      { source: "/profile", destination: "/dashboard/profile" },
    ];
  },
};

module.exports = nextConfig;
