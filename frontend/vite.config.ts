import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const network = process.env.DFX_NETWORK || 'local';
const host = network === 'local' ? 'http://127.0.0.1:4943' : 'https://icp-api.io';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env.DFX_NETWORK': JSON.stringify(network),
    'process.env.BACKEND_CANISTER_ID': JSON.stringify(process.env.BACKEND_CANISTER_ID),
  },
  server: {
    proxy: {
      '/api': {
        target: host,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        passes: 2,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: true,
      format: {
        comments: false,
      },
    },
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-switch',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-sheet',
          ],
          'icp-vendor': [
            '@dfinity/agent',
            '@dfinity/auth-client',
            '@dfinity/identity',
            '@dfinity/principal',
            '@dfinity/candid',
          ],
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff2?|ttf|otf|eot/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-query'],
  },
});
