import child_process from 'child_process'

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