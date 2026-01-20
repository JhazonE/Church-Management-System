import type { NextConfig } from 'next';

const isElectron = process.env.ELECTRON === 'true';
const isProduction = process.env.NODE_ENV === 'production';
const isElectronProduction = isElectron && isProduction;

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: isElectron, // Disable PWA in Electron builds
  // Enable PWA for web deployments
  buildExcludes: [/manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    // Empty config to satisfy Next.js 16 requirement when webpack config is present
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: true, // Always use unoptimized images
  },
  // Electron production-specific configuration - only apply in production builds
  // Electron uses server mode in development, static files in production
  ...(isElectronProduction && {
    trailingSlash: true,
    distDir: 'out',
    assetPrefix: './',
    basePath: '',
  }),
  // Disable server-side features in Electron build
  ...(isElectron && {
    serverExternalPackages: [],
  }),
};

export default withPWA(nextConfig);
