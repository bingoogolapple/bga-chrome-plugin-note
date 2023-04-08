import { testChrome } from '../../utils/chrome-utils'
testChrome('background')

chrome.runtime.onInstalled.addListener(async (data: any) => {
  console.log('onInstalled 参数', JSON.stringify(data))
  // {"CHROME_UPDATE":"chrome_update","INSTALL":"install","SHARED_MODULE_UPDATE":"shared_module_update","UPDATE":"update"}
  if (data.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    let url = chrome.runtime.getURL('src/entries/options/options.html')
    let tab = await chrome.tabs.create({ url })
    console.log(`background 安装完后打开选项 tab ${JSON.stringify(tab)}`)
  }

  console.log('background 初始化完成')
})

chrome.runtime.onConnect.addListener((port) => {
  console.log('background chrome.runtime.onConnect', port)
  port.onMessage.addListener((msg) => {
    console.log('background port.onMessage', msg)
    port.postMessage('我是来自 background port.onMessage 的消息')
  })
})
