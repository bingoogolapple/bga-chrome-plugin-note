import { testChrome } from '../../utils/chrome-utils'
testChrome('background')

chrome.runtime.onInstalled.addListener(async (data: any) => {
  console.log('onInstalled 参数', JSON.stringify(data))
  // {"CHROME_UPDATE":"chrome_update","INSTALL":"install","SHARED_MODULE_UPDATE":"shared_module_update","UPDATE":"update"}
  if (data.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    let url = chrome.runtime.getURL('src/entries/options/options.html')
    let tab = await chrome.tabs.create({ url })
    console.log(`background 安装完后打开选项 tab ${JSON.stringify(tab)}`)

    // 也可以直接使用 api 打开选项页面
    // chrome.runtime.openOptionsPage()
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

// chrome.debugger.onEvent.addListener((source, method, params) => {
//   // console.log('source', source, 'method', method, 'params', params)
//   console.log('method', method)
//   if (method === 'Network.responseReceived') {
//     console.log('Response received:', params?.response?.url);
//     // Perform your desired action with the response data
//   }
// });


// import '../../../scripts/crx-hmr-plugin/injectBackground'
