import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        globIgnores: ['**/quarkington/**'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replaceAll('\\', '/')
          const isFirebase = normalizedId.includes('/node_modules/firebase/') || normalizedId.includes('/node_modules/@firebase/')
          if (isFirebase) {
            if (/(?:@firebase|firebase)\/(?:firestore)(?:\/|$)/.test(normalizedId)) return 'firebase-firestore'
            if (/(?:@firebase|firebase)\/(?:auth)(?:\/|$)/.test(normalizedId)) return 'firebase-auth'
            if (/(?:@firebase|firebase)\/(?:app|component|logger|util|installations|webchannel-wrapper)(?:\/|$)/.test(normalizedId)) return 'firebase-core'
            return 'firebase-support'
          }
          if (id.includes('node_modules/react') || id.includes('react-router')) return 'react'
        },
      },
    },
  },
})
