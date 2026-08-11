import type { NextConfig } from 'next';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const nextConfig: NextConfig = {
  env: {
    APP_ENV: process.env.APP_ENV || 'development',
  },
  transpilePackages: ['mathml2omml', 'pptxgenjs'],
  serverExternalPackages: ['@prisma/client'],
  // TODO: Remove after fixing pre-existing export errors (getLXCLevel, etc.)
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  experimental: {
    proxyClientMaxBodySize: '200mb',
  },
};

export default nextConfig;
