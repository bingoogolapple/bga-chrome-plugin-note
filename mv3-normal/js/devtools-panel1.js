let port = chrome.runtime.connect()
console.log('devtools-panel1 chrome.runtime.onConnect', port)
port.onMessage.addListener((msg) => {
  console.log('devtools-panel1 onMessage', msg)
})
port.postMessage('我是来自 devtools-panel1 的消息')

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('devtools-panel1 收到消息', request, sender)
  sendResponse('我是来自 devtools-panel1 的响应消息')
})

document.getElementById('sendMessage').addEventListener('click', () => {
  chrome.runtime.sendMessage(
    { msg: '我是来自 devtools-panel1 的消息' },
    (response) => {
      console.log('devtools-panel1 发送后收到返回消息', response)
    }
  )
})

document.getElementById('getResources').addEventListener('click', () => {
  chrome.devtools.inspectedWindow.getResources((resources) => {
    console.log(JSON.stringify(resources))
  })
})

document.getElementById('openResource').addEventListener('click', () => {
  chrome.devtools.inspectedWindow.eval(
    'window.location.href',
    (result, isException) => {
      chrome.devtools.panels.openResource(result, 20, (res) => {
        console.log('资源打开成功', res)
      })
    }
  )
})

document.getElementById('checkJQuery').addEventListener('click', () => {
  chrome.devtools.inspectedWindow.eval(
    'jQuery.fn.jquery',
    (result, isException) => {
      if (isException) {
        console.log('当前页面没有使用 jQuery', result)
      } else {
        console.log(`当前页面使用了jQuery，版本为：${result}`)
      }
    }
  )
})
