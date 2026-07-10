import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  
  // Root directory
  root: '.',
  
  // Public directory
  publicDir: 'images',
  
  // Build options
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'js/index.html'
    }
  },
  
  // Development server options
  server: {
    port: 3000,
    https: false,
    // Proxy API requests to PHP backend
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/backend.php': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/cache': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  
  // Resolve options
  resolve: {
    alias: {
      // Map Dojo module paths
      'dojo': path.resolve(__dirname, 'lib/dojo'),
      'dijit': path.resolve(__dirname, 'lib/dijit'),
      'dojox': path.resolve(__dirname, 'lib/dojox'),
      'fox': path.resolve(__dirname, 'js')
    },
    extensions: ['.js', '.json']
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['vue', 'element-plus']
  }
});
