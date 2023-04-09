import type { Plugin, ResolvedConfig, BuildOptions } from 'vite'
import { PreRenderedChunk, PreRenderedAsset } from 'rollup'
import WebSocket, { WebSocketServer } from 'ws'
import {
  readFileSync,
  existsSync,
  copyFileSync,
  unlinkSync,
  mkdirSync,
  rmdirSync,
} from 'fs'
import { resolve } from 'path'
import { IncomingMessage } from 'http'
import chokidar from 'chokidar'

const parseMode = (mode: string) => {
  let isIife = false
  let isBackground = false
  let isPage = false
  if (['content', 'inject'].includes(mode)) {
    isIife = true
  } else if (['background'].includes(mode)) {
    isBackground = true
  } else {
    isPage = true
  }
  return {
    isIife,
    isBackground,
    isPage,
  }
}

interface ICrxBuildConfigProps {
  isDev: boolean
  viteDirname: string
  mode: string
  pageInput?: Record<string, string>
}

/**
 * https://cn.vitejs.dev/guide/build.html
 * https://cn.vitejs.dev/config/build-options.html
 */
export const getCrxBuildConfig = ({
  isDev,
  viteDirname,
  mode,
  pageInput = {},
}: ICrxBuildConfigProps): BuildOptions => {
  let input: Record<string, string> = null
  let format: 'esm' | 'iife' = 'esm'
  const { isBackground, isIife } = parseMode(mode)
  if (isBackground) {
    input = {
      [mode]: resolve(viteDirname, `src/entries/${mode}/${mode}.ts`),
    }
  } else if (isIife) {
    input = {
      [mode]: resolve(viteDirname, `src/entries/${mode}/${mode}.ts`),
    }
    format = 'iife'
  } else {
    input = { ...pageInput }
    const defaultPageInput: Record<string, string> = {
      popup: resolve(viteDirname, 'src/entries/popup/popup.html'),
      options: resolve(viteDirname, 'src/entries/options/options.html'),
      newtab: resolve(viteDirname, 'src/entries/newtab/newtab.html'),
      devtools: resolve(viteDirname, 'src/entries/devtools/devtools.html'),
      'devtools-panel': resolve(
        viteDirname,
        'src/entries/devtools-panel/devtools-panel.html'
      ),
    }
    Object.keys(defaultPageInput).forEach((key) => {
      if (!input[key] && existsSync(defaultPageInput[key])) {
        input[key] = defaultPageInput[key]
      }
    })
  }

  return {
    /**
     * 设置为 {} 则会启用 rollup 的监听器
     * 0、默认值为 null
     */
    watch: isDev ? {} : null,
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
          // console.log(`assetFileName ${chunkInfo.name}`)
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
          // console.log(`chunkFileName ${chunkInfo.name}`)
          return 'assets/[name].js'
        },
        /**
         * 指定 chunks 的入口文件名
         * 0、默认值为 'assets/[name]-[hash].js'
         */
        entryFileNames: (chunkInfo: PreRenderedChunk) => {
          // console.log(`entryFileName ${chunkInfo.name}`)
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
  }
}

const crxHmrPort = 54321

const logServer = (...args: string[]) =>
  console.log('WebSocketServer::', ...args)

const logClient = (...args: string[]) =>
  console.log('WebSocketServerClient::', ...args)

const getQueryString = (req: IncomingMessage, name: string) => {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
  const r = req.url?.substr(2).match(reg)
  if (r != null) {
    return decodeURIComponent(r[2])
  }
  return null
}

const initWebSocketServer = (viteDirname: string) => {
  let webSocketServer: WebSocketServer = null

  const handleServerChanged = () => {
    if (webSocketServer === null) {
      logServer('handleServerChanged => 无 webSocketServer')
      return
    }

    logServer('handleServerChanged => 通过 WebSocket 触发 server 重新加载')
    webSocketServer.clients.forEach((webSocket) => {
      webSocket.send('BACKGROUND_CHANGED')
    })
  }
  const watchPublicDir = () => {
    logServer('监听 public 目录变更')

    chokidar
      .watch([resolve(viteDirname, 'public')], { ignoreInitial: true })
      .on('all', (event, path) => {
        logServer('监听到 public 目录中的文件变更', event, path)

        if (event === 'addDir') {
          return
        }

        const destFilePath = path.replace('/public/', '/dist/')

        if (event === 'unlink') {
          logServer('删除文件', destFilePath)
          unlinkSync(destFilePath)
          return
        }
        if (event === 'unlinkDir') {
          logServer('删除目录', destFilePath)
          rmdirSync(destFilePath)
          return
        }
        if (event === 'add') {
          const destFileParentPath = destFilePath.substring(
            0,
            destFilePath.lastIndexOf('/')
          )
          if (!existsSync(destFileParentPath)) {
            logServer(`新建目录 ${destFileParentPath}`)
            mkdirSync(destFileParentPath)
          }
        }

        logServer(`copy file ${path} to ${destFilePath}`)
        copyFileSync(path, destFilePath)

        handleServerChanged()
      })
  }
  const startWebSocketServer = () => {
    watchPublicDir()

    logServer('启动 WebSocketServer')
    webSocketServer = new WebSocketServer({ port: crxHmrPort })

    webSocketServer.on('connection', (webSocket, req) => {
      const mode = getQueryString(req, 'mode')
      logServer('收到新的客户端连接', mode, req.url)
      webSocket.send('heartbeatMonitor')
      const interval = setInterval(() => {
        logServer('发送心跳')
        webSocket.send('heartbeat')
      }, 3000)

      webSocket.on('message', (message) => {
        const info = `${message}`
        if (info === 'CONTENT_CHANGED') {
          logServer('监听到 content 代码变化，通知客户端重新加载')
          webSocketServer.clients.forEach((ws) => {
            ws.send(info)
          })
        } else if (info === 'PAGE_CHANGED') {
          logServer('监听到 page 代码变化，通知客户端重新加载')
          webSocketServer.clients.forEach((ws) => {
            ws.send(info)
          })
        }
      })

      webSocket.on('close', () => {
        logServer('断开连接，停止发送心跳')
        clearInterval(interval)
      })
    })
  }
  return {
    startWebSocketServer,
    handleServerChanged,
  }
}
const initWebSocketClient = (mode: string) => {
  let webSocketClient = null
  let isReady = false
  const connectWebSocketServer = () => {
    if (webSocketClient || isReady) {
      return
    }

    try {
      webSocketClient = new WebSocket(
        `ws://127.0.0.1:${crxHmrPort}?mode=${mode}`
      )
      webSocketClient.addEventListener('open', (event) => {
        logClient(mode, 'connectWebSocketServer => 成功')
        isReady = true
      })
    } catch (e) {
      logClient(mode, 'connectWebSocketServer => 失败', e)
      webSocketClient = null
      setTimeout(connectWebSocketServer, 1000)
    }
  }
  const handleClientChanged = ({
    isIife,
    isPage,
  }: {
    isIife: boolean
    isPage: boolean
  }) => {
    if (!webSocketClient || !isReady) {
      logClient(
        mode,
        'handleClientChanged => 无 webSocketClient 或未连接到服务器'
      )
      return
    }

    logClient(
      mode,
      'handleClientChanged => 通过 WebSocket 触发 client 重新加载'
    )
    if (isIife) {
      webSocketClient.send('CONTENT_CHANGED')
    } else if (isPage) {
      webSocketClient.send('PAGE_CHANGED')
    }
  }
  return {
    connectWebSocketServer,
    handleClientChanged,
  }
}

interface IProps {
  mode: string
  viteDirname: string
}

export const cxrHmrPlugin = ({ mode, viteDirname }: IProps): Plugin => {
  const { isBackground, isIife, isPage } = parseMode(mode)

  const { startWebSocketServer, handleServerChanged } =
    initWebSocketServer(viteDirname)
  const { connectWebSocketServer, handleClientChanged } =
    initWebSocketClient(mode)

  let resolvedConfig: ResolvedConfig
  let resolvedInput: string[] = []

  return {
    name: 'crx-hot-reload',
    enforce: 'pre',
    /**
     * 在解析 Vite 配置后调用。使用这个钩子读取和存储最终解析的配置
     * https://cn.vitejs.dev/guide/api-plugin.html#configresolved
     */
    configResolved(config: ResolvedConfig) {
      resolvedConfig = config
      resolvedInput = Object.values(
        resolvedConfig.build.rollupOptions.input
      ).map((item) => item.substring(0, item.lastIndexOf('.')))

      if (isBackground) {
        // 启动 ws 服务端
        startWebSocketServer()
      } else if (isIife || isPage) {
        // 链接 ws 服务端
        setTimeout(connectWebSocketServer, 2000)
      }
    },
    transform(code, id) {
      if (isBackground && id.includes('background/background.ts')) {
        const injectDevCode = readFileSync(
          resolve(__dirname, 'injectBackground.ts'),
          'utf-8'
        )
        return code + injectDevCode
      } else if (
        isPage &&
        resolvedInput.includes(id.substring(0, id.lastIndexOf('.')))
      ) {
        // TODO 注入页面代码后未生效，直接展示到了界面上
        // const injectDevCode = readFileSync(
        //   resolve(__dirname, 'injectPage.ts'),
        //   'utf-8'
        // )
        // return code + injectDevCode
      }
    },
    writeBundle() {
      if (isBackground) {
        handleServerChanged()
      } else {
        handleClientChanged({ isIife, isPage })
      }
    },
  }
}
