import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // Cette option assure que le div#root est conservé
      jsxRuntime: 'automatic'
    })
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Option pour éviter l'optimisation trop agressive
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  base: '/'
})