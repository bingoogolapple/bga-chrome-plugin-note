import { testChrome } from '../../utils/chrome-utils'
testChrome('devtools')

const port = chrome.runtime.connect()
console.log('devtools chrome.runtime.onConnect', port)
port.onMessage.addListener((msg: any) => {
  console.log('devtools port.onMessage', msg)
})
port.postMessage('我是来自 devtools port.onMessage 的消息')

chrome.runtime.onMessage.addListener(
  (request: any, sender: any, sendResponse: any) => {
    console.log('devtools chrome.runtime.onMessage', request, sender)
    sendResponse('我是来自 devtools chrome.runtime.onMessage 的响应消息')
  }
)

// 可以创建多个面板
chrome.devtools.panels.create(
  'BGA面板',
  'images/32.png',
  'src/entries/devtools-panel/devtools-panel.html',
  (panel: any) => {
    console.log('devtools BGA面板创建成功', panel)
  }
)
