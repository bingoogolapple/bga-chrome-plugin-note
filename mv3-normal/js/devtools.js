let port = chrome.runtime.connect()
console.log('devtools chrome.runtime.onConnect', port)
port.onMessage.addListener((msg) => {
  console.log('devtools onMessage', msg)
})
port.postMessage('我是来自 devtools 的消息')

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('devtools 收到消息', request, sender)
  sendResponse('我是来自 devtools 的响应消息')
})

// 可以创建多个面板
chrome.devtools.panels.create(
  'BGA面板1',
  'images/32.png',
  'html/devtools-panel1.html',
  function (panel) {
    console.log('BGA面板1创建成功', panel)
  }
)
