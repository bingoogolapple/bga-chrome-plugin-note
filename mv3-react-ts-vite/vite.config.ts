import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import { PreRenderedChunk, PreRenderedAsset } from 'rollup'

export const r = (...args: string[]) => resolve(__dirname, '.', ...args)

export const __DEV__ = process.env.CRX_ENV === 'development'

// https://cn.vitejs.dev/config/
// https://cn.vitejs.dev/guide/build.html
// pnpm dev => { mode: 'development', command: 'serve', ssrBuild: false }
// pnpm build => { mode: 'production', command: 'build', ssrBuild: false }
// pnpm preview => { mode: 'production', command: 'serve', ssrBuild: false }
export default defineConfig(async ({ mode, command }) => {
  console.log('process.env.CRX_ENV', process.env.CRX_ENV, __DEV__)
  if (command === 'serve') {
    // dev 独有配置
  } else {
    // build 独有配置
  }

  let input: Record<string, string> = {
    popup: r('src/entries/popup/popup.html'),
    options: r('src/entries/options/options.html'),
    newtab: r('src/entries/newtab/newtab.html'),
    devtools: r('src/entries/devtools/devtools.html'),
    'devtools-panel': r('src/entries/devtools-panel/devtools-panel.html'),
    background: r('src/entries/background/background.ts'),
  }
  let format: 'esm' | 'iife' = 'esm'
  if (['content', 'inject'].includes(mode)) {
    input = {
      [mode]: r(`src/entries/${mode}/${mode}.ts`),
    }
    format = 'iife'
  }

  return {
    define: {
      __DEV__,
    },
    resolve: {
      alias: {
        '@': r('src'),
      },
    },
    plugins: [react()],
    /**
     * https://cn.vitejs.dev/config/build-options.html
     */
    build: {
      /**
       * 设置为 {} 则会启用 rollup 的监听器
       * 0、默认值为 null
       */
      watch: __DEV__ ? {} : null,
      /**
       * 是否最小化混淆，或指定使用哪种混淆器
       * 0、默认值为 esbuild
       * 1、true | false | 'esbuild' | 'terser'
       */
      minify: false,
      /**
       * 构建后是否生成 source map 文件
       * 0、默认值为 false
       * 1、如果为 true，将会创建一个独立的 source map 文件
       * 2、如果为 'inline'，source map 将作为一个 data URI 附加在输出文件中
       * 3、'hidden' 的工作原理与 'true' 相似，只是 bundle 文件中相应的注释将不被保留。浏览器不会自动加载 sourcemap，需要在浏览器的调试控制台中右键 - Add source map
       */
      sourcemap: false,
      /**
       * 是否清空 outDir
       * 0、默认值为 true
       */
      emptyOutDir: false,
      /**
       * 是否启用 CSS 代码拆分。启用代码分割时 content.css 会被内联到 content.js 内部
       * 0、默认值为 true
       */
      cssCodeSplit: false,
      /**
       * https://www.rollupjs.com/guide/big-list-of-options
       */
      rollupOptions: {
        input,
        output: {
          /**
           * 自定义构建结果中的静态文件名称
           * 0、默认值为 'assets/[name]-[hash][extname]'
           */
          assetFileNames: (chunkInfo: PreRenderedAsset) => {
            console.log(`assetFileName ${chunkInfo.name}`)
            if (mode === 'content') {
              return `assets/content[extname]`
            }
            return `assets/[name][extname]`
          },
          /**
           * 对代码分割中产生的 chunk 文件自定义命名
           * 0、默认值为 'assets/[name]-[hash].js'
           */
          chunkFileNames: (chunkInfo: PreRenderedChunk) => {
            console.log(`chunkFileName ${chunkInfo.name}`)
            return 'assets/[name].js'
          },
          /**
           * 指定 chunks 的入口文件名
           * 0、默认值为 'assets/[name]-[hash].js'
           */
          entryFileNames: (chunkInfo: PreRenderedChunk) => {
            console.log(`entryFileName ${chunkInfo.name}`)
            // Chrome 扩展要求 background.js 必须要放到最外层
            if (chunkInfo.name === 'background') {
              return '[name].js'
            }
            return 'assets/[name].js'
          },
          /**
           * 指定是否扩展 umd 或 iife 格式中 name 选项定义的全局变量
           * 0、默认值为 false
           */
          extend: true,
          format,
        },
      },
    },
  }
})
