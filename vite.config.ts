import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const base = '/debtpilot-pwa/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifestFilename: 'manifest.json',
      includeAssets: ['icon.svg', 'apple-touch-icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webmanifest}'],
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true
      },
      manifest: {
        name: 'DebtPilot',
        short_name: 'DebtPilot',
        description: 'Offline-first VND debt tracker and payoff simulator for Vietnam.',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#fbfcf8',
        theme_color: '#0f766e',
        categories: ['finance', 'productivity'],
        icons: [
          {
            src: `${base}icon.svg`,
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: `${base}icon-192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: `${base}icon-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});
