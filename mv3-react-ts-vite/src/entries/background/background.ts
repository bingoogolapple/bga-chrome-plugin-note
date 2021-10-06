import { testChrome } from '../../utils/chrome-utils'
testChrome('background')

chrome.runtime.onInstalled.addListener(async (data: any) => {
  console.log('onInstalled 参数', JSON.stringify(data))
  // {"CHROME_UPDATE":"chrome_update","INSTALL":"install","SHARED_MODULE_UPDATE":"shared_module_update","UPDATE":"update"}
  if (data.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    let url = chrome.runtime.getURL('options.html')
    let tab = await chrome.tabs.create({ url })
    console.log(`安装完后打开选项 tab ${JSON.stringify(tab)}`)
  }

  console.log('初始化完成')
})
