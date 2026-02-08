import type { NextConfig } from "next";

// Для GitHub Pages всегда используем basePath
// В локальной разработке (npm run dev) basePath будет пустым
const isProduction = process.env.NODE_ENV === 'production' || process.env.GITHUB_ACTIONS === 'true';
const basePath = isProduction ? '/Sky_fitnessPro' : '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve = {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
        },
      };
    }
    return config;
  },
};

export default nextConfig;
