// msw 这种方式目前在浏览器插件中行不通，无法访问指定域名下的 mockServiceWorker.js 文件
import { setupWorker, rest } from 'msw'
setTimeout(() => {
    const worker = setupWorker(
        rest.get('/testMock', (req, res, ctx) => {
            return res(
                ctx.delay(1500),
                ctx.status(202, 'Mocked status'),
                ctx.json({
                    message: 'Mocked response JSON body',
                }),
            )
        }),
    )
    worker.start()
}, 2000);