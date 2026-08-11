const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["lucide-react", "react-icons"],
  serverExternalPackages: ["@prisma/client"],
};

module.exports = nextConfig;
