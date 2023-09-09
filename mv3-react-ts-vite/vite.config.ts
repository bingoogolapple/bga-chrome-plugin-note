import { defineConfig, PluginOption } from 'vite'
import react from '@vitejs/plugin-react-swc'
import vitePluginImp from 'vite-plugin-imp'
import { cxrHmrPlugin, getCrxBuildConfig } from './scripts/crx-hmr-plugin'
import { resolve } from 'path'

// https://cn.vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  console.log('process.env.CRX_ENV', mode, process.env.CRX_ENV)
  const isDev = process.env.CRX_ENV === 'development'

  const plugins: PluginOption[] = [
    react(),
    vitePluginImp({
      libList: [
        {
          libName: 'antd',
          style(name) {
            return `antd/es/${name}/style/index.js`
          },
        },
      ],
    }),
  ]
  if (isDev) {
    plugins.push(cxrHmrPlugin({ mode }))
  }

  const crxBuildConfig = getCrxBuildConfig({
    isDev,
    mode,
    pageInput: {
      'update-version': resolve(
        process.cwd(),
        'src/entries/update-version/update-version.html'
      ),
    }
  })

  return {
    define: {
      __DEV__: isDev,
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    plugins,
    build: {
      ...crxBuildConfig,
    },
  }
})
