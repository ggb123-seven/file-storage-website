import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  // Vercel环境优化
  experimental: {
    // 其他实验性功能可以在这里配置
  },
  // 环境变量配置
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // 生产环境优化
  ...(process.env.NODE_ENV === 'production' && {
    output: 'standalone',
    compress: true,
  }),
};

export default nextConfig;
