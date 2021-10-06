import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { PreRenderedChunk, PreRenderedAsset } from 'rollup'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [react()],
  build: {
    minify: false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        options: resolve(__dirname, 'options.html'),
        newtab: resolve(__dirname, 'newtab.html'),
        background: resolve(__dirname, 'src/entries/background/background.ts'),
        content: resolve(__dirname, 'src/entries/content/content.ts'),
        inject: resolve(__dirname, 'src/entries/inject/inject.ts'),
      },
      output: {
        // 'assets/[name].[hash][extname]'
        assetFileNames: (chunkInfo: PreRenderedAsset) => {
          console.log(`assetFileName ${chunkInfo.name}`)
          return 'assets/[name][extname]'
        },
        // 'assets/[name].[hash].js'
        chunkFileNames: (chunkInfo: PreRenderedChunk) => {
          console.log(`chunkFileName ${chunkInfo.name}`)
          return 'assets/[name].js'
        },
        // 'assets/[name].[hash].js'
        entryFileNames: (chunkInfo: PreRenderedChunk) => {
          console.log(`entryFileName ${chunkInfo.name}`)

          // Chrome 扩展要求 background.js 必须要放到最外层
          if (chunkInfo.name === 'background') {
            return '[name].js'
          }
          return 'assets/[name].js'
        },
      },
    },
  },
})
