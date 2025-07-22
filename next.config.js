/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Experimental features for performance
  experimental: {
    appDir: false, // Using pages router for Story 1
    serverComponentsExternalPackages: ['@anthropic-ai/sdk'],
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Headers for Brazilian market optimization
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
          // Brazilian timezone
          { key: 'X-Timezone', value: 'America/Sao_Paulo' },
          // Cache control for API responses
          { key: 'Cache-Control', value: 'public, max-age=60, stale-while-revalidate=300' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          // Security headers
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          // LGPD compliance
          { key: 'X-Data-Protection', value: 'LGPD-Compliant' },
        ],
      },
    ];
  },
  
  // Redirects for Brazilian users
  async redirects() {
    return [
      {
        source: '/',
        destination: '/test', // For Story 1 testing
        permanent: false,
      },
    ];
  },
  
  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Webpack configuration for Brazilian market
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle for Claude API
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
  
  // Performance optimizations for Brazilian infrastructure
  poweredByHeader: false,
  compress: true,
  
  // API routes configuration
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '10mb',
  },
};

module.exports = nextConfig; 