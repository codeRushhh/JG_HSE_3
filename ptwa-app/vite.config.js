import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/ptwa/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png'],
      manifest: {
        name: 'Joseph Group PTWA',
        short_name: 'PTWA',
        description: 'Joseph Group Permit to Work Application',
        theme_color: '#16294D',
        background_color: '#F4F5F3',
        display: 'standalone',
        start_url: '/ptwa/',
        icons: [
          { src: 'logo.png', sizes: '192x192', type: 'image/png' },
          { src: 'logo.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
