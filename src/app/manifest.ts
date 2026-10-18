import type { MetadataRoute } from 'next';

/** Lets phones add CareerForge to the home screen with its icon. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CareerForge AI',
    short_name: 'CareerForge',
    start_url: '/home',
    display: 'standalone',
    background_color: '#0B1220',
    theme_color: '#2563EB',
    icons: [
      { src: '/brand/careerforge-icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/careerforge-icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/logo.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}
