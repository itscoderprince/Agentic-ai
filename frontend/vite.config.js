import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('shiki/core') || id.includes('shiki/engine') || id.includes('shiki/dist/core') || id.includes('shiki/themes')) return 'vendor-shiki';
            if (id.includes('react-markdown') || id.includes('remark') || id.includes('micromark') || id.includes('unist') || id.includes('mdast') || id.includes('vfile')) return 'vendor-markdown';
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('react') || id.includes('scheduler')) return 'vendor-react';
            if (id.includes('@base-ui') || id.includes('lucide-react')) return 'vendor-ui';
            if (id.includes('axios') || id.includes('zustand')) return 'vendor-core';
          }
        },
      },
    },
  },
})
