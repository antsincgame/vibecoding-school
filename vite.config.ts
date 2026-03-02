import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, readdirSync, mkdirSync, existsSync, lstatSync } from 'fs'
import { join } from 'path'

function copyPublicFilesPlugin() {
  return {
    name: 'copy-public-files',
    apply: 'build' as const,
    closeBundle() {
      const publicDir = resolve(__dirname, 'public')
      const distDir = resolve(__dirname, 'dist')
      if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true })
      const files = readdirSync(publicDir)
      for (const file of files) {
        const src = join(publicDir, file)
        const dest = join(distDir, file)
        try {
          if (lstatSync(src).isFile()) copyFileSync(src, dest)
        } catch {}
      }
    }
  }
}

export default defineConfig(({ command }) => ({
  plugins: [react()],
  publicDir: 'public',
  resolve: {
    alias: [
      { find: '@vibecoding/shared/styles', replacement: resolve(__dirname, 'shared/src/styles/shared.css') },
      { find: '@vibecoding/shared', replacement: resolve(__dirname, 'shared/src') },
    ],
    dedupe: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: true,
    target: 'es2020',
    commonjsOptions: {
      include: [/shared/, /node_modules/],
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 500,
    cssCodeSplit: true,
    assetsInlineLimit: 4096
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
}))
