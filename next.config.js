/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  skipTrailingSlashRedirect: true,
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-separator',
      '@radix-ui/react-switch',
      '@radix-ui/react-slot',
      '@radix-ui/react-progress',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-context-menu',
      '@radix-ui/react-hover-card',
      '@radix-ui/react-label',
      '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group',
      '@radix-ui/react-avatar',
      '@radix-ui/react-toast',
    ],
  },
  turbopack: {},
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/db/**',
          '**/*.db',
          '**/*.db-journal',
          '**/*.db-wal',
          '**/*.db-shm',
          '**/dev.log',
          '**/*.log',
          '**/upload/**',
          '**/node_modules/.cache/**',
        ],
      };
    }
    return config;
  },
};

module.exports = nextConfig;
