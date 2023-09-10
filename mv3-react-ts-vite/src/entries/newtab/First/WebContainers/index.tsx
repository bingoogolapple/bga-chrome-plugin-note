import { useEffect, useRef, useState } from 'react'
import './index.css'
import { WebContainer, FileNode } from '@webcontainer/api'
import { files } from './files'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

// https://webcontainers.io/tutorial/1-build-your-first-webcontainer-app
const WebContainers = () => {
    const [webcontainerInstance, setWebcontainerInstance] = useState<WebContainer>()
    const [indexJsContents, setIndexJsContents] = useState<string>()
    const [iframeSrc, setIframeSrc] = useState<string>()
    const terminalRef = useRef(null)

    // 自动安装依赖
    const installDependencies = async (terminal: Terminal) => {
        if (!webcontainerInstance) {
            return
        }
        // Install dependencies
        const installProcess = await webcontainerInstance.spawn('npm', ['install'])
        installProcess.output.pipeTo(
            new WritableStream({
                write(data) {
                    console.log(data)
                    terminal.write(data)
                },
            })
        )
        // Wait for install command to exit
        return installProcess.exit
    }
    // 自动启动服务
    const startDevServer = async (terminal: Terminal) => {
        if (!webcontainerInstance) {
            return
        }
        // Run `npm run start` to start the Express app
        const serverProcess = await webcontainerInstance.spawn('npm', [
            'run',
            'start',
        ])
        serverProcess.output.pipeTo(
            new WritableStream({
                write(data) {
                    console.log(data)
                    terminal.write(data)
                },
            })
        )
    }

    // 保存内容
    const writeIndexJS = async (content: string) => {
        if (!webcontainerInstance) {
            return
        }
        await webcontainerInstance.fs.writeFile('/index.js', content)
    }

    // 启动 jsh
    const startShell = async (terminal: Terminal, fitAddon: FitAddon) => {
        if (!webcontainerInstance) {
            return
        }
        const shellProcess = await webcontainerInstance.spawn('jsh', {
            terminal: {
                cols: terminal.cols,
                rows: terminal.rows,
            },
        })
        shellProcess.output.pipeTo(
            new WritableStream({
                write(data) {
                    terminal.write(data)
                },
            })
        )

        const input = shellProcess.input.getWriter()
        terminal.onData((data) => {
            input.write(data)
        })

        window.addEventListener('resize', () => {
            fitAddon.fit()
            shellProcess.resize({
                cols: terminal.cols,
                rows: terminal.rows,
            })
        })

        return shellProcess
    }
    useEffect(() => {
        setIndexJsContents((files['index.js'] as FileNode).file.contents as string)

        // 初始化 Terminal
        const fitAddon = new FitAddon()
        const terminal = new Terminal({
            convertEol: true,
        })
        terminal.loadAddon(fitAddon)
        terminal.open(terminalRef.current!)
        fitAddon.fit()

        console.log('开始启动 WebContainer 实例')
        const startTime = new Date().getTime()
        // TODO 失败，内部加载 https://stackblitz.com/headless?version=1.1.5 时非同源导致加载失败，尝试指定 window.WEBCONTAINER_API_IFRAME_URL 来解决
        // https://developer.chrome.com/docs/extensions/mv3/manifest/content_security_policy/
        // https://developer.chrome.com/docs/extensions/mv3/manifest/cross_origin_opener_policy/
        // https://developer.chrome.com/docs/extensions/mv3/manifest/cross_origin_embedder_policy/
        WebContainer.boot().then(async webcontainerInstance => {
            console.log(
                '启动 WebContainer 实例成功',
                webcontainerInstance,
                new Date().getTime() - startTime
            )
            setWebcontainerInstance(webcontainerInstance)

            const packageJSON = await webcontainerInstance.fs.readFile(
                'package.json',
                'utf-8'
            )
            console.log('packageJSON', packageJSON)

            // 监听服务启动成功事件
            const unsubscribe = webcontainerInstance.on('server-ready', (port, url) => {
                console.log('启动成功', port, url)
                setIframeSrc(url)
            })

            // 自动安装依赖和启动服务
            // const exitCode = await installDependencies(terminal)
            // if (exitCode !== 0) {
            //     throw new Error('Installation failed')
            // } else {
            //     console.log('安装依赖成功')
            //     startDevServer(terminal)
            // }

            // 通过 jsh 来手动输入要执行的命名
            startShell(terminal, fitAddon)
        }).catch(e => console.error('启动 WebContainer 实例失败', e))
    }, [])

    return (
        <div className='web-containers'>
            <div className="container">
                <div className="editor">
                    <textarea value={indexJsContents} onChange={(e) => {
                        console.log('1111')
                        setIndexJsContents(e.target.value)
                        writeIndexJS(e.target.value)
                    }}></textarea>
                </div>
                <div className="preview">
                    <iframe src={iframeSrc} />
                </div>
            </div>
            <div ref={terminalRef} className="terminal"></div>
        </div>
    )
}

export default WebContainers