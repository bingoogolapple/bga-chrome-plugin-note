console.log('来自 contentScript.js 的日志')
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('content 收到消息', request, sender)
    sendResponse('我是来自 content 的响应消息')

    chrome.runtime.sendMessage(
        { msg: '我是来自 content 的消息' },
        (response) => {
            console.log('content 发送后收到返回消息', response)
        }
    )
})

// 移除百度首页广告
let node = document.querySelector('.s-hotsearch-content')
if (node) {
    node.remove()
}
node = document.querySelector('.s-hotsearch-title')
if (node) {
    node.remove()
}

// 动态加载文件时需要在 manifest.json -> web_accessible_resources 中配置
let jsPath = 'js/inject.js'
let temp = document.createElement('script')
temp.src = chrome.runtime.getURL(jsPath)
temp.setAttribute('type', 'text/javascript')
document.head.appendChild(temp)
