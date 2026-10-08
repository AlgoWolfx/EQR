import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import { staticSite } from './src/site/plugin';
import { resolveSite } from './src/site/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'PUBLIC_');
  const location = resolveSite(env.PUBLIC_SITE_URL);
  return {
    base: location.base,
    plugins: [
      react(),
      staticSite(env.PUBLIC_SITE_URL ?? ''),
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png'],
        manifest: {
          name: 'EQR — Free QR Code Generator',
          short_name: 'EQR',
          description: 'Free, private QR codes. Your data stays on your device.',
          theme_color: '#fafaf9',
          background_color: '#fafaf9',
          scope: location.base,
          start_url: location.base,
          display: 'standalone',
          icons: [
            { src: `${location.base}icon-192.png`, sizes: '192x192', type: 'image/png' },
            { src: `${location.base}icon-512.png`, sizes: '512x512', type: 'image/png' },
          ],
        },
        workbox: {
          clientsClaim: true,
          globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
          globIgnores: ['**/404.html', '**/og-card.png'],
          maximumFileSizeToCacheInBytes: 3_000_000,
        },
      }),
    ],
    test: { include: ['src/**/*.test.ts'], environment: 'node' },
  };
});
