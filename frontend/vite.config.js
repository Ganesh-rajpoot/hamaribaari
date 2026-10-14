import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.svg'],
    //   manifest: {
    //     name: 'HamariBaari',
    //     short_name: 'HospQueue',
    //     description: 'Join the queue from home. Reach closer to your turn.',
    //     theme_color: '#2563eb',
    //     background_color: '#ffffff',
    //     display: 'standalone',
    //     start_url: '/',
    //     icons: [
    //       { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
    //       { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
    //       { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    //     ],
    //   },
    //   workbox: {
    //     navigateFallback: '/index.html',
    //     globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
    //     runtimeCaching: [
    //       {
    //         urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/hospitals'),
    //         handler: 'NetworkFirst',
    //         options: {
    //           cacheName: 'api-hospitals',
    //           expiration: { maxEntries: 20, maxAgeSeconds: 60 * 5 },
    //         },
    //       },
    //     ],
    //   },
    // }),

    VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.svg', 'pwa-192.png', 'pwa-512.png'],
  manifest: {
    name: 'HamariBaari',
    short_name: 'HospQueue',
    description: 'Join the queue from home. Reach closer to your turn.',
    theme_color: '#0ea5e9',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait',
    scope: '/',
    start_url: '/',
    icons: [
      { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'My tokens',  url: '/patient/tokens',  icons: [{ src: '/pwa-192.png', sizes: '192x192' }] },
      { name: 'Hospitals',  url: '/hospitals',       icons: [{ src: '/pwa-192.png', sizes: '192x192' }] },
    ],
  },
  workbox: {
    navigateFallback: '/index.html',
    globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
    runtimeCaching: [
      {
        urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/hospitals'),
        handler: 'NetworkFirst',
        options: { cacheName: 'api-hospitals', expiration: { maxEntries: 20, maxAgeSeconds: 300 } },
      },
    ],
  },
})
  ],
  server: { port: 5173 },
});