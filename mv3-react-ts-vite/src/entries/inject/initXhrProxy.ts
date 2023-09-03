import { proxy } from "ajax-hook"

proxy({
    onRequest: (config, handler) => {
        console.log('111111 onRequest', config, handler)
        if (config.url.includes('/testMock')) {
            console.log('111111 onRequest', config)
            handler.resolve({
                config: config,
                status: 200,
                headers: { 'content-type': 'application/json;charset=utf-8' },
                response: JSON.stringify({
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
                }),
            })
        }
        if (config.url === 'https://aa/') {
            handler.resolve({
                config: config,
                status: 200,
                headers: { 'content-type': 'text/text' },
                response: 'hi world',
            })
        } else {
            handler.next(config)
        }
    },
    onError: (err, handler) => {
        console.log('111111 onError', err, handler)
        if (err.config.url === 'https://bb/') {
            handler.resolve({
                config: err.config,
                status: 200,
                headers: { 'content-type': 'text/text' },
                response: 'hi world',
            })
        } else {
            handler.next(err)
        }
    },
    onResponse: (response, handler) => {
        console.log('111111 response', response, handler)
        if (response.config.url === location.href) {
            handler.reject({
                config: response.config,
                type: 'error',
            })
        } else {
            handler.next(response)
        }
    },
})
