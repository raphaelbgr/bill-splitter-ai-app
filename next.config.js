/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Network configuration for local development
  serverRuntimeConfig: {
    // Will only be available on the server side
    hostname: '192.168.7.101',
    port: 3004,
  },
  
  // Experimental features for performance
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk'],
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
  
  // Image optimization
  images: {
    domains: ['localhost', '192.168.7.101'],
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
};

module.exports = nextConfig; 