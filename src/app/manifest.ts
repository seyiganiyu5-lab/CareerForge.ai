import type { MetadataRoute } from 'next';

/** Lets phones add Hassify to the home screen with its icon. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hassify',
    short_name: 'Hassify',
    start_url: '/home',
    display: 'standalone',
    background_color: '#0B1220',
    theme_color: '#2563EB',
    icons: [
      { src: '/brand/hassify-icon-192.png?v=ascent', sizes: '192x192', type: 'image/png' },
      { src: '/brand/hassify-icon-512.png?v=ascent', sizes: '512x512', type: 'image/png' },
      { src: '/logo.svg?v=ascent', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}
