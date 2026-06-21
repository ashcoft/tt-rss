import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  root: resolve(__dirname, '../'),
  base: './',
  build: {
    outDir: resolve(__dirname, '../build'),
    rollupOptions: {
      input: {
        main: resolve(__dirname, '../vue/main.js'),
        prefs: resolve(__dirname, '../vue/prefs.js')
      },
      output: {
        dir: resolve(__dirname, '../build/assets'),
        entryFileNames: `[name]-[hash].js`,
        chunkFileNames: `chunk-[hash].js`,
        assetFileNames: `asset-[hash][extname]`
      }
    },
    sourcemap: true,
    minify: 'terser'
  },
  server: {
    port: 3000,
    origin: 'http://localhost:3000',
    cors: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../vue'),
      '@components': resolve(__dirname, '../vue/components'),
      '@stores': resolve(__dirname, '../vue/stores')
    }
  }
})
