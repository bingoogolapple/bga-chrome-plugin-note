import { useCallback, useEffect, useState } from "react"
import * as JSZip from 'jszip'

// 递归创建目录
const recursiveCreateDir = async (parentDirHandle: FileSystemDirectoryHandle, pathArr: string[]): Promise<FileSystemDirectoryHandle> => {
    const name = pathArr.shift()
    if (name) {
        // console.log('创建新目录', name)
        const newDirHandle = await parentDirHandle.getDirectoryHandle(name, {
            create: true,
        })
        return recursiveCreateDir(newDirHandle, pathArr)
    } else {
        return parentDirHandle
    }
}

// 解压 zip 文件到插件所在文件夹
const extractZipFiles = async (zipFileBlob: Blob, ignoreFirstDir = true) => {
    if (!zipFileBlob) {
        return
    }

    // 选择要解压到的文件路径
    // @ts-ignore
    const rootDirectoryHandle = await window.showDirectoryPicker({
        mode: 'readwrite', // 直接把读和写权限都申请了，避免后续再写子文件时还要再次申请权限
    })

    const jsZip = await JSZip.loadAsync(zipFileBlob)
    console.log('读取 zip 文件成功', jsZip)
    const zipEntries = Object.values(jsZip.files)
    for await (let zipEntry of zipEntries) {
        // console.log('zipEntry', zipEntry)

        const pathArr = zipEntry.name.split('/').filter((item) => item)
        if (ignoreFirstDir) {
            pathArr.shift()
        }

        if (zipEntry.dir) {
            // 递归创建目录
            await recursiveCreateDir(rootDirectoryHandle, pathArr)
        } else {
            // 先提取文件名
            const name = pathArr.pop()
            // 然后再递归创建目录
            const lastDirHandle = await recursiveCreateDir(
                rootDirectoryHandle,
                pathArr
            )
            // console.log('创建新的文件', name)
            const fileHandle = await lastDirHandle.getFileHandle(name!, {
                create: true,
            })
            const blob = await zipEntry.async('blob')
            // @ts-ignore
            const writable = await fileHandle.createWritable()
            await writable.write(blob)
            await writable.close()
        }
    }

    console.log('更新成功')
    setTimeout(() => {
        chrome.runtime.reload()
    }, 500)
}

const getLatestVersion = async (zipFileBlob: Blob) => {
    const jsZip = await JSZip.loadAsync(zipFileBlob)
    console.log('读取 zip 文件成功', jsZip)
    const zipEntries = Object.values(jsZip.files)
    for await (let zipEntry of zipEntries) {
        if (zipEntry.name.endsWith('manifest.json')) {
            console.log('找到清单文件', zipEntry)
            const manifestContent = await zipEntry.async('text')
            const manifestJson = JSON.parse(manifestContent)
            return manifestJson.version
        }
    }
    return ''
}

function App() {
    const [zipFileBlob, setZipFileBlob] = useState<Blob>()
    const [latestVersion, setLatestVersion] = useState('')
    const currentVersion = chrome.runtime.getManifest().version
    useEffect(() => {
        const remoteZipUrl = 'https://127.0.0.1:5500/mv3-react-ts-vite/mv3-react-ts-vite.zip'

        fetch(remoteZipUrl)
            .then((res) => res.blob())
            .then((zipFileBlob) => {
                console.log('zipFileBlob', zipFileBlob)
                setZipFileBlob(zipFileBlob)

                getLatestVersion(zipFileBlob).then((latestVersion) => {
                    setLatestVersion(latestVersion)
                }).catch(e => console.error('获取最新版本失败', e))
            })
            .catch(e => console.error('下载安装包失败', e))
    }, [])
    const updateVersion = useCallback(() => {
        if (zipFileBlob) {
            extractZipFiles(zipFileBlob)
        }
    }, [zipFileBlob])

    return <div>
        <h1>检查更新</h1>
        {latestVersion > currentVersion && <button onClick={updateVersion}>选择当前 Chrome 插件所在文件夹进行更新</button>}
        <div>当前版本：{currentVersion}</div>
        <div>最新版本：{latestVersion}</div>
    </div>
}

export default App
