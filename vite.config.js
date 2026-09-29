import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Build configuration for Lumen.
 *
 * Optimization strategy:
 *  - manualChunks splits React/router vendor code from app code so a UI change
 *    never busts the (large, rarely-changing) vendor cache entry.
 *  - hashed filenames + `content` hashing give permanent, immutable caching.
 *  - esbuild minification for JS/CSS, with console/debugger stripped from prod.
 *  - Rollup outputs a compact, tree-shaken bundle.
 */
export default defineConfig({
  plugins: [react()],

  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    cssCodeSplit: true,
    // Warn when a chunk grows past 500 kB — keeps the payload honest.
    chunkSizeWarningLimit: 500,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('react-router')) return 'vendor-router'
          if (id.includes('react-dom') || id.includes('/react/')) return 'vendor-react'
          return 'vendor'
        },
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || ''
          if (/\.(png|jpe?g|svg|webp|avif|gif)$/i.test(name)) return 'assets/img/[name].[hash][extname]'
          if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) return 'assets/fonts/[name].[hash][extname]'
          return 'assets/[name].[hash][extname]'
        }
      }
    }
  },

  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none'
  },

  server: {
    port: 5173,
    open: false
  },

  preview: {
    port: 4173
  }
})