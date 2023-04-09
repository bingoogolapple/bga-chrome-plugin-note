const crxHmrPort = 54321

const reloadContent = async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
    // currentWindow: true,
  })
  if (!tab) {
    console.log('background reloadContent::', '当前 tab 内容为空')
    return
  }
  console.log('background reloadContent::', '当前 tab 为', JSON.stringify(tab))
  if (!tab.id) {
    console.log('background reloadContent::', '当前 tab 没有 id')
    return
  }

  chrome.scripting
    .executeScript({
      target: { tabId: tab.id },
      files: ['assets/content.js'],
    })
    .then((results) => {
      for (const result of results) {
        console.log(
          'background reloadContent::',
          '注入脚本成功',
          JSON.stringify(result)
        )
      }
    })
    .catch((e) => {
      console.log('background reloadContent::', '注入脚本失败', e)
    })
}
const reloadPage = async () => {
  let tabs = await chrome.tabs.query({})
  tabs = tabs.filter(
    (tab) => !tab.url || tab.url?.startsWith('chrome-extension')
  )
  console.log('tabs', tabs)
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
    // currentWindow: true,
  })
  if (!tab) {
    console.log('background reloadPage::', '当前 tab 内容为空')
    return
  }
  console.log('background reloadPage::', '当前 tab 为', JSON.stringify(tab))
  if (!tab.id) {
    console.log('background reloadPage::', '当前 tab 没有 id')
    return
  }

  // 这种方式只能刷新当前选中的 tab，不支持自动刷新 popup、devtools、devtools-panel
  chrome.tabs.reload(tab.id)

  // 这种方式没权限刷新所有的 page
  // chrome.scripting
  //   .executeScript({
  //     target: { tabId: tab.id },
  //     func: () => window.location.reload(),
  //   })
  //   .then((results) => {
  //     for (const result of results) {
  //       console.log(
  //         'background reloadPage::',
  //         '注入脚本成功',
  //         JSON.stringify(result)
  //       )
  //     }
  //   })
  //   .catch((e) => {
  //     console.log('background reloadPage::', '注入脚本失败', e)
  //   })

  // TODO 插件中注入页面代码后未生效，直接展示到了界面上
  // chrome.runtime.sendMessage({ mode: 'page', action: 'reload' })
}
const initCrxHmrWebSocket = () => {
  const webSocketClient = new WebSocket(
    `ws://127.0.0.1:${crxHmrPort}?mode=background`
  )
  console.log('background initWebSocketClient::', '初始化 webSocketClient')

  let isAlive = true
  webSocketClient.addEventListener('message', (e) => {
    const { data } = e
    if (data === 'BACKGROUND_CHANGED') {
      console.log(
        'background initWebSocketClient::',
        '收到更新 background.js 消息，关闭 ws 并重新加载'
      )
      webSocketClient.close()
      setTimeout(() => {
        chrome.runtime.reload()
      }, 500)
    } else if (data === 'CONTENT_CHANGED') {
      console.log(
        'background initWebSocketClient::',
        '收到更新 content.js 消息'
      )
      reloadContent()
    } else if (data === 'PAGE_CHANGED') {
      console.log('background initWebSocketClient::', '收到更新页面消息')
      reloadPage()
    } else if (data === 'heartbeatMonitor') {
      isAlive = true
      const interval = setInterval(() => {
        if (!isAlive) {
          console.log(
            'background initWebSocketClient::',
            'heartbeatMonitor 非激活状态 => 重连来探测服务的是否在线'
          )
          const detectWs = new WebSocket(
            `ws://127.0.0.1:${crxHmrPort}?mode=background`
          )
          detectWs.onopen = () => {
            console.log(
              'background initWebSocketClient::',
              'heartbeatMonitor 非激活状态 => 重连来探测服务的是否在线 => 在线'
            )
            detectWs.close()
            clearInterval(interval)
            initCrxHmrWebSocket()
          }
        }
      }, 3000 + 500)
    } else if (data === 'heartbeat') {
      console.log('background initWebSocketClient::', 'heartbeat')
      isAlive = true
      setTimeout(() => {
        isAlive = false
      }, 2500)
    }
  })
}
initCrxHmrWebSocket()
