import { testChrome } from '../../utils/chrome-utils'
testChrome('background')

const color = '#3aa757'

chrome.runtime.onInstalled.addListener(async (data) => {
  console.log('onInstalled 参数', JSON.stringify(data))
  console.log(
    'OnInstalledReason',
    JSON.stringify(chrome.runtime.OnInstalledReason)
  )
  // {"CHROME_UPDATE":"chrome_update","INSTALL":"install","SHARED_MODULE_UPDATE":"shared_module_update","UPDATE":"update"}
  if (data.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    // chrome-extension://mjjadipdeeefojkjjfkgdnchfnkdggpn/html/options.html
    const url = chrome.runtime.getURL('options.html')
    const tab = await chrome.tabs.create({ url })
    console.log(`安装完后打开选项 tab ${JSON.stringify(tab)}`)
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

  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostEquals: 'www.baidu.com',
              schemes: ['https'],
            },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()],
      },
    ])
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
//     const url = chrome.runtime.getURL('html/options.html')
//     const tab = await chrome.tabs.create({ url })
//     console.log(`点击后打开选项 tab ${JSON.stringify(tab)}`)
// })

// https://developer.chrome.com/docs/extensions/reference/contextMenus
const contexts = [
  //   'all',
  'page',
  'selection',
  'link',
  'editable',
  'image',
  'video',
  'audio',
]
for (let i = 0; i < contexts.length; i++) {
  const context = contexts[i]
  const title = "Test '" + context + "' menu item"
  const id = chrome.contextMenus.create({
    id: context,
    title: title,
    contexts: [context],
  })
  console.log("'" + context + "' item:" + id)
}

// The unique ID to assign to this item. Mandatory for event pages. Cannot be the same as another ID for this extension.
const parent = chrome.contextMenus.create({
  title: 'Test parent item',
  id: 'parent',
})
const child1 = chrome.contextMenus.create({
  title: 'Child 1',
  id: 'child1',
  type: 'radio',
  parentId: parent,
})
const child2 = chrome.contextMenus.create({
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

  if ((info.menuItemId as string).startsWith('change-color-')) {
    // 使用了 tabs，需要添加 activeTab 权限
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    })
    console.log('当前 tab 内容', JSON.stringify(tab))
    if (!tab.id) {
      console.log('当前 tab 没有 id')
      return
    }
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
        () => {
          console.log('注入成功')
        }
      )
    }
  }
})

function setPageBackgroundColor(arg1: string, arg2: string) {
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
  // @ts-ignore
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

chrome.webRequest.onBeforeRequest.addListener(
  (request) => {
    console.log('发起网络请求', request)
  },
  // { urls: ['<all_urls>'] }
  { urls: ['https://www.baidu.com/*'] }
)

chrome.runtime.onConnect.addListener((port) => {
  console.log('chrome.runtime.onConnect', port)
  port.onMessage.addListener((msg) => {
    console.log('background onMessage', msg)
    port.postMessage('我是来自 background 的消息')
  })
})
