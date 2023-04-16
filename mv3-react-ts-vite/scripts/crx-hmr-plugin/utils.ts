import child_process from 'child_process'
import fs from 'fs'

export const killProcessByPort = (port: number) => {
    var lsofCommand = child_process.spawn('lsof', [
        '-i',
        `:${port}`,
    ])
    lsofCommand.stdout.on('data', rst => {
        const data = rst.toString('utf8', 0, rst.length)
        let pid: string | null = null;
        data.split(/[\n|\r]/).forEach((item: string) => {
            if (item.indexOf('LISTEN') !== -1 && !pid) {
                const reg = item.split(/\s+/)
                if (/\d+/.test(reg[1])) {
                    pid = reg[1]
                }
            }
        })
        if (!pid) {
            console.log(`无进程暂用端口 ${port}`)
            return
        }
        child_process.exec(`kill -9 ${pid}`, (_error, _stdout, _stderr) => {
            console.log(`关闭端口 ${port} 占用的进程 ${pid}`)
        })
    });
    lsofCommand.stderr.on('data', rst => {
        const data = rst.toString('utf8', 0, rst.length)
        console.log(`查询占用端口 ${port} 的进程失败`, data)
    });
}

export const deleteFolderRecursive = (path: string) => {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(file => {
            const curPath = `${path}/${file}`
            if (fs.lstatSync(curPath).isDirectory()) {
                // 递归删除文件夹
                deleteFolderRecursive(curPath)
            } else {
                // 删除文件
                if (fs.existsSync(curPath)) {
                    fs.unlinkSync(curPath)
                }
            }
        })
        // 删除文件夹
        if (fs.existsSync(path)) {
            fs.rmdirSync(path)
        }
    }
}

export const copyFolderRecursive = (src: string, dest: string) => {
    fs.mkdirSync(dest, { recursive: true })
    fs.readdirSync(src).forEach(file => {
        const srcFile = `${src}/${file}`
        const destFile = `${dest}/${file}`
        if (fs.lstatSync(srcFile).isDirectory()) {
            copyFolderRecursive(srcFile, destFile)
        } else {
            fs.copyFileSync(srcFile, destFile)
        }
    })
}