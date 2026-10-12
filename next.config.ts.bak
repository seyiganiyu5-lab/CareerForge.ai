import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  skipTrailingSlashRedirect: true,
  allowedDevOrigins: [
    "https://preview-chat-bf92592a-d901-426a-94aa-be52e28ea402.space-z.ai",
    "http://preview-chat-bf92592a-d901-426a-94aa-be52e28ea402.space-z.ai",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
  ],
  // Experimental optimizations
  experimental: {
    // Optimize package imports for faster builds and smaller bundles
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
  // Turbopack config (Next.js 16 default bundler)
  turbopack: {
    // Silence the webpack/turbopack config mismatch warning
  },
  // Exclude Prisma from client-side bundles
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Prevent file watcher from triggering HMR on DB/log changes
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
          '**/tool-results/**',
          '**/agent-ctx/**',
          '**/node_modules/.cache/**',
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
