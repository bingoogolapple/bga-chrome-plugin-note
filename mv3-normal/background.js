let color = '#3aa757'

chrome.runtime.onInstalled.addListener(async (data) => {
  console.log('onInstalled 参数', JSON.stringify(data))
  console.log(
    'OnInstalledReason',
    JSON.stringify(chrome.runtime.OnInstalledReason)
  )
  chrome.runtime.getPlatformInfo((info) => {
    console.log('getPlatformInfo', info)
  })
  // 该方法不能在 background 中访问
  // chrome.runtime.getPackageDirectoryEntry((directoryEntry) => {
  //   console.log('directoryEntry', directoryEntry)
  // })
  console.log('chrome.runtime', chrome.runtime)
  console.log('getManifest', chrome.runtime.getManifest())
  console.log('selfManagement', chrome.management.getSelf())
  // {"CHROME_UPDATE":"chrome_update","INSTALL":"install","SHARED_MODULE_UPDATE":"shared_module_update","UPDATE":"update"}
  if (data.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    // chrome-extension://mjjadipdeeefojkjjfkgdnchfnkdggpn/html/options.html
    let url = chrome.runtime.getURL('html/options.html')
    let tab = await chrome.tabs.create({ url })
    console.log(`安装完后打开选项 tab ${JSON.stringify(tab)}`)

    // 也可以直接使用 api 打开选项页面
    // chrome.runtime.openOptionsPage()
  }

  if (data.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    console.log(`更新完后打开选项 tab`)
    // 也可以直接使用 api 打开选项页面
    // chrome.runtime.openOptionsPage()
  }

  // 存储颜色，需要配置 storage 权限
  chrome.storage.sync.set({ color }, () => {
    console.log('2-Default background color set to %cgreen', `color: ${color}`)
  })
  console.log('1-Default background color set to %cgreen', `color: ${color}`)

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('background 收到消息', request, sender)
    sendResponse('我是来自 background 的响应消息')

    chrome.runtime.sendMessage(
      { msg: '我是来自 background 的消息' },
      (response) => {
        console.log('background 发送后收到返回消息', response)
      }
    )
  })

  console.log('初始化完成')
})

function reddenPage() {
  document.body.style.backgroundColor = 'red'
}

// 必须在 manifest.json 中添加 action 节点，否则 js 代码中 chrome.action 为 undefined；并且也不能指定 default_popup，否则此次的 onClicked 不会生效
// chrome.action.onClicked.addListener((tab) => {
//     console.log('background chrome.action.onClicked')
//     chrome.scripting.executeScript({
//         target: { tabId: tab.id },
//         func: reddenPage,
//     })
// })

// chrome.action.onClicked.addListener(async () => {
//     let url = chrome.runtime.getURL('html/options.html')
//     let tab = await chrome.tabs.create({ url })
//     console.log(`点击后打开选项 tab ${JSON.stringify(tab)}`)
// })

// https://developer.chrome.com/docs/extensions/reference/contextMenus
var contexts = [
  //   'all',
  'page',
  'selection',
  'link',
  'editable',
  'image',
  'video',
  'audio',
]
for (var i = 0; i < contexts.length; i++) {
  var context = contexts[i]
  var title = "Test '" + context + "' menu item"
  var id = chrome.contextMenus.create({
    id: context,
    title: title,
    contexts: [context],
  })
  console.log("'" + context + "' item:" + id)
}

// The unique ID to assign to this item. Mandatory for event pages. Cannot be the same as another ID for this extension.
var parent = chrome.contextMenus.create({
  title: 'Test parent item',
  id: 'parent',
})
var child1 = chrome.contextMenus.create({
  title: 'Child 1',
  id: 'child1',
  type: 'radio',
  parentId: parent,
})
var child2 = chrome.contextMenus.create({
  title: 'Child 2',
  id: 'child2',
  type: 'checkbox',
  parentId: parent,
  documentUrlPatterns: ['https://*.baidu.com/*'], // 仅在百度展示该菜单
})
console.log('parent:' + parent + ' child1:' + child1 + ' child2:' + child2)

chrome.contextMenus.create({
  id: 'change-color-js-func',
  title: 'js 方法方式修改背景色',
})

chrome.contextMenus.create({
  id: 'change-color-js-files',
  title: 'js 文件方式修改背景色',
})

chrome.contextMenus.create({
  id: 'change-color-css-css',
  title: 'css 代码方式修改背景色',
})

chrome.contextMenus.create({
  id: 'change-color-css-files',
  title: 'css 文件方式修改背景色',
})

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log('item ' + info.menuItemId + ' was clicked')
  console.log('info: ' + JSON.stringify(info))
  console.log('tab: ' + JSON.stringify(tab))
  if (info.menuItemId === 'selection' && info.selectionText) {
    // chrome.windows.create({
    //   url: `https://translate.google.com/?source=gtx&sl=zh-CN&tl=en&text=${info.selectionText}&op=translate`,
    //   type: 'popup',
    //   top: 5,
    //   left: 5,
    //   width: 400,
    //   height: 300,
    // })

    // 需要添加清单文件中添加 tts 权限
    chrome.tts.speak(info.selectionText, { rate: 1.5 })
  }

  if (info.menuItemId.startsWith('change-color-')) {
    // 使用了 tabs，需要添加 activeTab 权限
    let [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    })
    console.log('当前 tab 内容', JSON.stringify(tab))
    // 使用了 executeScript，需要添加 scripting 权限
    if (info.menuItemId === 'change-color-js-func') {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: setPageBackgroundColor,
          args: ['参数1', '参数2'], // 可选
        },
        (injectionResults) => {
          for (const frameResult of injectionResults) {
            console.log('注入成功：' + JSON.stringify(frameResult))
          }
        }
      )
    } else if (info.menuItemId === 'change-color-js-files') {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          files: ['js/changePageColor.js'],
        },
        (injectionResults) => {
          for (const frameResult of injectionResults) {
            console.log('注入成功：' + JSON.stringify(frameResult))
          }
        }
      )
    } else if (info.menuItemId === 'change-color-css-code') {
      chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        css: `
        body {
            background-color: red !important;
            font-size: 20px !important;
        }
        `,
      })
    } else if (info.menuItemId === 'change-color-css-files') {
      chrome.scripting.insertCSS(
        {
          target: { tabId: tab.id },
          files: ['style/changePageColor.css'],
        },
        (injectionResults) => {
          console.log('注入成功：' + JSON.stringify(injectionResults))
        }
      )
    }
  }
})

function setPageBackgroundColor(arg1, arg2) {
  console.log('arg1', arg1, 'arg2', arg2)
  chrome.storage.sync.get('color', ({ color }) => {
    document.body.style.backgroundColor = color
  })
}

chrome.omnibox.onInputEntered.addListener((text) => {
  console.log('onInputEntered', text)
  // chrome.tabs.update(tabId, { url: 'xxxxxx'})
})
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  console.log('onInputChanged', text)
  if (text == '11') {
    suggest([
      { content: text + 'aa', description: '你要找的是aa？' },
      { content: text + 'bb', description: '你要找的是bb？' },
    ])
  }
})

// 可以在代码里动态修改图标
function updateIcon() {
  const canvas = new OffscreenCanvas(16, 16)
  const iconContext = canvas.getContext('2d')
  iconContext.clearRect(0, 0, 16, 16)
  iconContext.fillStyle = 'green'
  iconContext.fillRect(0, 0, 16, 16)
  iconContext.strokeStyle = 'red'
  iconContext.strokeText('测试', 0, 10)
  const iconData = iconContext.getImageData(0, 0, 16, 16)
  chrome.action.setIcon({ imageData: iconData })
}
// updateIcon()

// chrome.alarms.onAlarm.addListener((alarm) => {
//     console.log('收到定时任务', JSON.stringify(alarm))
//     chrome.notifications.create(undefined, {
//         type: 'progress',
//         iconUrl: '../images/128.png',
//         title: alarm.name,
//         progress: 30,
//         message: new Date(alarm.scheduledTime).toUTCString()
//     })
// })
// const when = Date.now() + 3000
// console.log('定时任务执行时间', when)
// chrome.alarms.create('alarm-demo', {
//     when: when,
//     periodInMinutes: 1,
// })

// 修复休眠导致 alarm 失效
// chrome.idle.onStateChanged.addListener((newState) => {
//     console.log(`新状态 ${newState}`)
//     if (newState == 'active') {
//         chrome.alarms.getAll((alarms) => {
//             alarms.forEach((alarm) => {
//                 console.log(`alarm 为 ${JSON.stringify(alarm)}`)
//                 chrome.alarms.create(alarm.name, {
//                     when: alarm.scheduledTime,
//                     periodInMinutes: alarm.periodInMinutes,
//                 })
//             })
//         })
//     }
// })

// chrome.webRequest.onBeforeRequest.addListener(
//   (request) => {
//     console.log('发起网络请求', request)
//   },
//   // { urls: ['<all_urls>'] }
//   { urls: ['https://www.baidu.com/*'] }
// )

// 这种方式添加 header 在 v3 中已失效
// chrome.webRequest.onBeforeSendHeaders.addListener(
//   (details) => {
//     console.log('修改请求头', details)
//     details.requestHeaders?.push({
//       name: 'x-test-req',
//       value: 'test value req'
//     })
//   },
//   {
//     urls: ['https://www.baidu.com/*']
//   },
//   ['blocking']
// )
// chrome.webRequest.onHeadersReceived.addListener(
//   (details) => {
//     console.log('修改响应头', details)
//     details.responseHeaders?.push({
//       name: 'x-test-resp',
//       value: 'test value resp'
//     })
//   },
//   {
//     urls: ['https://www.baidu.com/*']
//   },
//   ['blocking']
// )

chrome.runtime.onConnect.addListener((port) => {
  console.log('chrome.runtime.onConnect', port)
  port.onMessage.addListener((msg) => {
    console.log('background onMessage', msg)
    port.postMessage('我是来自 background 的消息')
  })
})

// setTimeout(() => {
//   console.log('background chrome.runtime.id', chrome.runtime.id)
//   chrome.management.getSelf((self) => {
//     console.log('background getSelf', self)
//   })

//   const manifest = chrome.runtime.getManifest()
//   console.log('background getManifest', manifest)

//   chrome.runtime.getPlatformInfo(
//     (platformInfo) => {
//       console.log('background getPlatformInfo', platformInfo)
//     }
//   )
// }, 3000);



// 这种方式只能监听插件自身的网络请求
// const initFetchListener = () => {
//   console.log('初始化 fetch event listener')
//   const mockData = [{
//     url: '/xxx',
//     method: 'get',
//     responseData: JSON.stringify({
//       code: 0,
//       data: [
//         {
//           name: 'bga1',
//           age: 31
//         },
//         {
//           name: 'bga2',
//           age: 32
//         }
//       ]
//     })
//   }]
//   const checkMockData = (url, method) => {
//     for (let data of mockData) {
//       // if (data.url === url && data.method === method) {
//         return data.responseData
//       // }
//     }
//   }
//   self.addEventListener('fetch', (e) => {
//     console.log('监听到 fetch', e)
//     const response = checkMockData(e.request.url, e.request.method)
//     if (response) {
//       e.respondWith(new Response(response, { headers: { 'Content-Type': 'text/html' } }))
//     }
//   })
// }
// initFetchListener()


// chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
//   chrome.declarativeContent.onPageChanged.addRules([
//     {
//       conditions: [
//         new chrome.declarativeContent.PageStateMatcher({
//           pageUrl: {
//             hostEquals: 'www.baidu.com',
//             schemes: ['https'],
//           },
//         }),
//       ],
//       actions: [new chrome.declarativeContent.ShowPageAction()],
//     },
//   ])
// })


// https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/
const dynamicRule1 = {
  id: 20230415,
  priority: 1,
  // action: {
  //   type: "block"
  // },
  action: {
    type: "modifyHeaders",
    requestHeaders: [
      {
        operation: "set",
        header: 'x-test-req-key-1',
        value: 'x-test-req-value-1'
      }
    ],
    responseHeaders: [
      {
        operation: "set",
        header: 'x-test-resp-key-1',
        value: 'x-test-resp-value-1'
      }
    ],
  },
  condition: {
    urlFilter: 'baidu.com',
    // resourceTypes: ['main_frame'],
  },
}
chrome.declarativeNetRequest.getDynamicRules((rules) => {
  console.log('getDynamicRules', rules)
  chrome.declarativeNetRequest.updateDynamicRules({
    // 插件卸载后规则还会存在，每次添加前需要将之前的规则删除
    removeRuleIds: rules.map(rule => rule.id),
    addRules: [dynamicRule1]
  }, (args) => {
    console.log('updateDynamicRules', args)
  })
})
// 需要添加 declarativeNetRequestFeedback 权限
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(
  (info) => {
    console.log('declarativeNetRequest.onRuleMatchedDebug', info)
  }
)
chrome.declarativeNetRequest.getEnabledRulesets((rulesetIds) => {
  console.log('getEnabledRulesets', rulesetIds)
})