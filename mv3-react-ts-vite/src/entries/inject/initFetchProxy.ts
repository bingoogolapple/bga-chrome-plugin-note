const originalFetch = window.fetch

window.fetch = (url, init) => {
    // 在这里你可以拦截或修改请求
    console.log('fetch 请求被拦截: ', url, init)
    const realUrl = (url as Request).url || url.toString()
    if (realUrl.includes('/testMock')) {
        console.log('拦截接口 testMock')
        const mockBody = JSON.stringify({
            code: 0,
            data: [
                {
                    id: 1,
                    name: '名称1',
                },
                {
                    id: 2,
                    name: '名称2',
                },
            ],
            message: '成功',
        })
        const mockResponse = new Response(new Blob([mockBody]), {
            status: 200,
            statusText: 'OK',
            headers: {},
        })
        return Promise.resolve(mockResponse).then((res) => {
            console.log('拦截时的结果', res)
            return res
        })
        // return fetch("http://127.0.0.1:4523/m1/3019301-0-default/testMock", {
        //     "method": "POST"
        // }).then((res) => {
        //     console.log('apifox 拦截时的结果', res)
        //     return res
        // })
    }
    // 然后调用原始的 fetch 函数
    return originalFetch(url, init).then((res) => {
        console.log('未拦截时的结果', res)
        return res
    })
}

export { }