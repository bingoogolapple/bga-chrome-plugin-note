import { testChrome } from '../../utils/chrome-utils'
testChrome('devtools')

const port = chrome.runtime.connect()
console.log('devtools chrome.runtime.onConnect', port)
port.onMessage.addListener((msg: any) => {
  console.log('devtools onMessage', msg)
})
port.postMessage('我是来自 devtools 的消息')

chrome.runtime.onMessage.addListener(
  (request: any, sender: any, sendResponse: any) => {
    console.log('devtools 收到消息', request, sender)
    sendResponse('我是来自 devtools 的响应消息')
  }
)

// 可以创建多个面板
chrome.devtools.panels.create(
  'BGA面板',
  'images/32.png',
  'devtools-panel.html',
  (panel: any) => {
    console.log('BGA面板创建成功', panel)
  }
)
