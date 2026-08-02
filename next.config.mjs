const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'https://name-meaning-site-backend.vercel.app').replace(/\/+$/, '');
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'nameversecloud';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || (process.env.GITHUB_ACTIONS ? `/${repoName}` : '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath,
  assetPrefix: basePath,

  // Disable TypeScript checking during build (already validated in CI)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Performance Optimizations
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=2592000, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },

  // Image Optimization
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'nameverse.site',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Optimize package imports
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-slot',
      'lucide-react',
    ],
  },

  turbopack: {},
};

export default nextConfig;
