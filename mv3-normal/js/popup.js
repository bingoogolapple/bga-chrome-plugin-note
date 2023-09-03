window.onload = () => {
  // popup 中 window.onload 无效
  console.log('popup window.onload')
  fetch('https://api.github.com/users/bingoogolapple')
    .then((resp) => resp.json())
    .then((data) => {
      document.getElementById('username').innerText = data.login
    })
}

let port = chrome.runtime.connect({name: 'popup'})
console.log('popup chrome.runtime.onConnect', port)
port.onMessage.addListener((msg) => {
  console.log('popup onMessage', msg)
})
port.postMessage('我是来自 popup 的消息')

const getCookie = async (domain, name) => {
  let cookies
  try {
    cookies = await chrome.cookies.getAll({ domain: domain, name: name })
    console.log(cookies)
  } catch (e) {
    console.log(`从 ${domain} 获取 ${name} 失败`, e)
    return null
  }

  if (cookies.length === 0) {
    console.log(`${domain} 上不存在 ${name}`)
    return null
  }

  console.log(`${domain} 上存在 ${name}`)
  return cookies[0]
}

const deleteCookie = async (domain, name) => {
  const cookie = await getCookie(domain, name)
  if (!cookie) {
    return
  }

  const protocol = cookie.secure ? 'https:' : 'http:'
  const cookieUrl = `${protocol}//${cookie.domain}${cookie.path}`
  try {
    const deleteResult = await chrome.cookies.remove({
      storeId: cookie.storeId,
      name: cookie.name,
      url: cookieUrl,
    })
    console.log(`从 ${domain} 中删除 ${name} 成功`, deleteResult)
  } catch (e) {
    console.log(`从 ${domain} 中删除 ${name} 失败`, e)
  }
}

const copyCookie = async (srcDomain, destDomain, name) => {
  const cookie = await getCookie(srcDomain, name)
  if (!cookie) {
    console.log(`未登录，先打开 https://${srcDomain} 登录`)
    chrome.tabs.create({ url: `https://${srcDomain}` })
    return
  }

  await deleteCookie(destDomain, name)
  const cookieUrl = `http://${destDomain}${cookie.path}`
  try {
    const setResult = await chrome.cookies.set({
      name: name,
      url: cookieUrl,
      value: cookie.value,
    })
    console.log(`从 ${srcDomain} 拷贝 ${name} 到 ${destDomain} 成功`, setResult)
  } catch (e) {
    console.log(`从 ${srcDomain} 拷贝 ${name} 到 ${destDomain} 失败`, e)
  }
}
;(async function initPopupWindow() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (tab?.url) {
    try {
      let url = new URL(tab.url)
      let domain = url.hostname
      document.getElementById('domain').innerText = domain
      // 也可以获取非当前页面的 cookie
      // domain = 'baidu.com'
      // const cookies = await chrome.cookies.getAll({ domain })
      // console.log('cookies', cookies)
    } catch (e) {
      console.log('获取域名失败', e)
    }
  }
})()

document.getElementById('getBackgroundPage').addEventListener('click', () => {
  console.log('getBackgroundPage', chrome.extension.getBackgroundPage())
  alert(chrome.extension.getBackgroundPage())
})
document.getElementById('getViews').addEventListener('click', () => {
  console.log('getViews', chrome.extension.getViews())
  alert(chrome.extension.getViews())
})
document.getElementById('openOptions').addEventListener('click', async () => {
  // chrome-extension://mjjadipdeeefojkjjfkgdnchfnkdggpn/html/options.html
  let url = chrome.runtime.getURL('html/options.html')
  let tab = await chrome.tabs.create({ url })
  console.log(`打开选项 tab ${JSON.stringify(tab)}`)
})
document.getElementById('openBaidu').addEventListener('click', async () => {
  let url = 'https://www.baidu.com'
  let tab = await chrome.tabs.create({ url, active: false })
  console.log(`打开百度 tab ${JSON.stringify(tab)}`)
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('popup 收到消息', request, sender)
  sendResponse('我是来自 popup 的响应消息')
})
document.getElementById('sendMessage').addEventListener('click', () => {
  chrome.runtime.sendMessage({ msg: '我是来自 popup 的消息' }, (response) => {
    console.log('popup 发送后收到返回消息', response)
  })
})
document.getElementById('chromeApps').addEventListener('click', () => {
  chrome.windows.create(
    {
      url: 'html/updateVersion.html',
      type: 'popup', // normal: 新窗口+有标签，popup: 新窗口+无标签，panel: 新窗口+无标签
      width: 400,
      height: 400,
    },
    (res) => {
      console.log('windowCreate', res)
    }
  )
  // 新标签打开
  // chrome.tabs.create({ url: chrome.runtime.getURL('html/updateVersion.html') })
  // 新标签打开
  // chrome.tabs.create({ url: 'html/updateVersion.html' })
  // 新标签打开
  // window.open(chrome.runtime.getURL('/html/updateVersion.html'))
  // 新标签打开
  // window.open('/html/updateVersion.html')
})
document
  .getElementById('getPackageDirectoryEntry')
  .addEventListener('click', () => {
    chrome.runtime.getPackageDirectoryEntry((directoryEntry) => {
      window.directoryEntry = directoryEntry
      console.log('directoryEntry', directoryEntry)
      const reader = directoryEntry.createReader()
      reader.readEntries((entries) => {
        // console.log('entries', entries)
        for (let entry of entries) {
          console.log('entry', entry)
          if (entry.name === 'test.txt') {
            window.entry = entry
            entry.createWriter(
              (writer) => {
                window.writer = writer
                writer.onwriteend = function () {
                  console.log('写入完成')
                }
                writer.onerror = function (e) {
                  console.log('写入失败', e)
                }
                console.log('writer', writer)
                let text = '这是一段文本' + new Date().getTime()
                let blob = new Blob([text], { type: 'text/plain' })
                writer.write(blob)
              },
              (err) => console.log('获取 writer 失败', err)
            )

            entry.file(
              (file) => {
                window.file = file
                console.log('file', file)
              },
              (err) => console.log('获取 file 失败', err)
            )
          }
        }
      })
    })
  })

const verifyPermission = async (fileHandle, readWrite) => {
  const options = {}
  if (readWrite) {
    options.mode = 'readwrite'
  }
  if ((await fileHandle.queryPermission(options)) === 'granted') {
    return true
  }
  if ((await fileHandle.requestPermission(options)) === 'granted') {
    return true
  }
  return false
}

// popup 中不支持写入文件，options 中支持写入文件
document.getElementById('updateVersion').addEventListener('click', async () => {
  const fileHandleList = await window.showOpenFilePicker()
  const fileHandle = fileHandleList[0]
  const file = await fileHandle.getFile()
  const content = await file.text()
  console.log('内容', content)

  // const manifestJson = JSON.parse(content)
  // manifestJson.version = '1.0.1'

  const hasPermission = await verifyPermission(fileHandle)
  if (hasPermission) {
    console.log('有权限')
  } else {
    console.log('无权限')
  }

  try {
    const writable = await fileHandle.createWritable()
    // await writable.write(JSON.stringify(manifestJson))
    await writable.write('我是新内容')
    await writable.close()

    let versionDiv = document.getElementById('versionDiv')
    versionDiv.innerHTML = `当前版本：${chrome.runtime.getManifest().version}`
  } catch (e) {
    // popup 中不支持写入文件，options 中支持写入文件
    console.log('保存文件失败', e)
  }
})
window.onload = () => {
  let versionDiv = document.getElementById('versionDiv')
  versionDiv.innerHTML = `当前版本：${chrome.runtime.getManifest().version}`
}

document.getElementById('showBadge').addEventListener('click', () => {
  chrome.action.setTitle({ title: 'popup里修改标题' })
  chrome.action.setBadgeText({ text: '11' })
  chrome.action.setBadgeBackgroundColor({ color: '#00ff00' })
})
document.getElementById('hideBadge').addEventListener('click', () => {
  chrome.action.setBadgeText({ text: '' })
})
document.getElementById('sendNotification').addEventListener('click', () => {
  chrome.notifications.create(null, {
    type: 'basic',
    iconUrl: '../images/128.png',
    title: 'popup测试标题',
    message:
      'popup很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长的内容',
  })
})

document.getElementById('changePluginColor').addEventListener('click', () => {
  setPageBackgroundColor()
})

document
  .getElementById('changePageColor')
  .addEventListener('click', async () => {
    // 使用了 tabs，需要添加 activeTab 权限
    let [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    })
    console.log('当前 tab 内容', JSON.stringify(tab))
    // 使用了 executeScript，需要添加 scripting 权限
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: setPageBackgroundColor,
    })
  })

async function setPageBackgroundColor() {
  chrome.storage.sync.get('color', ({ color }) => {
    // 通过 executeScript 执行时 document 为实际的网页；未通过 executeScript 执行时 document 为插件自身的网页
    document.body.style.backgroundColor = color
  })
}

// =========================================================

let selectedClassName = 'current'
function handleButtonClick(event) {
  // 设置前一个选中按钮为未选中
  let current = event.target.parentElement.querySelector(
    `.${selectedClassName}`
  )
  if (current && current !== event.target) {
    current.classList.remove(selectedClassName)
  }

  // 设置当前按钮为选中
  let color = event.target.dataset.color
  event.target.classList.add(selectedClassName)
  chrome.storage.sync.set({ color })
}
function constructOptions(buttonColors) {
  chrome.storage.sync.get('color', (data) => {
    let currentColor = data.color
    let buttonDiv = document.getElementById('buttonDiv')
    for (let buttonColor of buttonColors) {
      let button = document.createElement('button')
      button.dataset.color = buttonColor
      button.style.backgroundColor = buttonColor

      if (buttonColor === currentColor) {
        button.classList.add(selectedClassName)
      }

      button.addEventListener('click', handleButtonClick)
      buttonDiv.appendChild(button)
    }
  })
}
const presetButtonColors = ['#3aa757', '#e8453c', '#f9bb2d', '#4688f1']
constructOptions(presetButtonColors)

let chromeJson = {
  action: { onClicked: {} },
  alarms: { onAlarm: {} },
  app: {
    isInstalled: false,
    InstallState: {
      DISABLED: 'disabled',
      INSTALLED: 'installed',
      NOT_INSTALLED: 'not_installed',
    },
    RunningState: {
      CANNOT_RUN: 'cannot_run',
      READY_TO_RUN: 'ready_to_run',
      RUNNING: 'running',
    },
  },
  commands: { onCommand: {} },
  contextMenus: {
    onClicked: {},
    ContextType: {
      ACTION: 'action',
      ALL: 'all',
      AUDIO: 'audio',
      BROWSER_ACTION: 'browser_action',
      EDITABLE: 'editable',
      FRAME: 'frame',
      IMAGE: 'image',
      LAUNCHER: 'launcher',
      LINK: 'link',
      PAGE: 'page',
      PAGE_ACTION: 'page_action',
      SELECTION: 'selection',
      VIDEO: 'video',
    },
    ItemType: {
      CHECKBOX: 'checkbox',
      NORMAL: 'normal',
      RADIO: 'radio',
      SEPARATOR: 'separator',
    },
    ACTION_MENU_TOP_LEVEL_LIMIT: 6,
  },
  cookies: {
    onChanged: {},
    OnChangedCause: {
      EVICTED: 'evicted',
      EXPIRED: 'expired',
      EXPIRED_OVERWRITE: 'expired_overwrite',
      EXPLICIT: 'explicit',
      OVERWRITE: 'overwrite',
    },
    SameSiteStatus: {
      LAX: 'lax',
      NO_RESTRICTION: 'no_restriction',
      STRICT: 'strict',
      UNSPECIFIED: 'unspecified',
    },
  },
  declarativeContent: {
    onPageChanged: {},
    PageStateMatcherInstanceType: {
      'DECLARATIVE_CONTENT.PAGE_STATE_MATCHER':
        'declarativeContent.PageStateMatcher',
    },
    RequestContentScriptInstanceType: {
      'DECLARATIVE_CONTENT.REQUEST_CONTENT_SCRIPT':
        'declarativeContent.RequestContentScript',
    },
    SetIconInstanceType: {
      'DECLARATIVE_CONTENT.SET_ICON': 'declarativeContent.SetIcon',
    },
    ShowActionInstanceType: {
      'DECLARATIVE_CONTENT.SHOW_ACTION': 'declarativeContent.ShowAction',
    },
    ShowPageActionInstanceType: {
      'DECLARATIVE_CONTENT.SHOW_PAGE_ACTION':
        'declarativeContent.ShowPageAction',
    },
  },
  dom: {},
  extension: {
    ViewType: { POPUP: 'popup', TAB: 'tab' },
    inIncognitoContext: false,
  },
  i18n: {},
  management: {
    ExtensionDisabledReason: {
      PERMISSIONS_INCREASE: 'permissions_increase',
      UNKNOWN: 'unknown',
    },
    ExtensionInstallType: {
      ADMIN: 'admin',
      DEVELOPMENT: 'development',
      NORMAL: 'normal',
      OTHER: 'other',
      SIDELOAD: 'sideload',
    },
    ExtensionType: {
      EXTENSION: 'extension',
      HOSTED_APP: 'hosted_app',
      LEGACY_PACKAGED_APP: 'legacy_packaged_app',
      LOGIN_SCREEN_EXTENSION: 'login_screen_extension',
      PACKAGED_APP: 'packaged_app',
      THEME: 'theme',
    },
    LaunchType: {
      OPEN_AS_PINNED_TAB: 'OPEN_AS_PINNED_TAB',
      OPEN_AS_REGULAR_TAB: 'OPEN_AS_REGULAR_TAB',
      OPEN_AS_WINDOW: 'OPEN_AS_WINDOW',
      OPEN_FULL_SCREEN: 'OPEN_FULL_SCREEN',
    },
  },
  permissions: { onRemoved: {}, onAdded: {} },
  runtime: {
    id: 'mjjadipdeeefojkjjfkgdnchfnkdggpn',
    onRestartRequired: {},
    onMessageExternal: {},
    onMessage: {},
    onConnectExternal: {},
    onConnect: {},
    onBrowserUpdateAvailable: {},
    onUpdateAvailable: {},
    onSuspendCanceled: {},
    onSuspend: {},
    onInstalled: {},
    onStartup: {},
    OnInstalledReason: {
      CHROME_UPDATE: 'chrome_update',
      INSTALL: 'install',
      SHARED_MODULE_UPDATE: 'shared_module_update',
      UPDATE: 'update',
    },
    OnRestartRequiredReason: {
      APP_UPDATE: 'app_update',
      OS_UPDATE: 'os_update',
      PERIODIC: 'periodic',
    },
    PlatformArch: {
      ARM: 'arm',
      ARM64: 'arm64',
      MIPS: 'mips',
      MIPS64: 'mips64',
      X86_32: 'x86-32',
      X86_64: 'x86-64',
    },
    PlatformNaclArch: {
      ARM: 'arm',
      MIPS: 'mips',
      MIPS64: 'mips64',
      X86_32: 'x86-32',
      X86_64: 'x86-64',
    },
    PlatformOs: {
      ANDROID: 'android',
      CROS: 'cros',
      LINUX: 'linux',
      MAC: 'mac',
      OPENBSD: 'openbsd',
      WIN: 'win',
    },
    RequestUpdateCheckStatus: {
      NO_UPDATE: 'no_update',
      THROTTLED: 'throttled',
      UPDATE_AVAILABLE: 'update_available',
    },
  },
  scripting: { StyleOrigin: { AUTHOR: 'AUTHOR', USER: 'USER' } },
  storage: {
    sync: {
      onChanged: {},
      QUOTA_BYTES: 102400,
      QUOTA_BYTES_PER_ITEM: 8192,
      MAX_ITEMS: 512,
      MAX_WRITE_OPERATIONS_PER_HOUR: 1800,
      MAX_WRITE_OPERATIONS_PER_MINUTE: 120,
      MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE: 1000000,
    },
    managed: { onChanged: {} },
    local: { onChanged: {}, QUOTA_BYTES: 5242880 },
    onChanged: {},
  },
  tabs: {
    onZoomChange: {},
    onReplaced: {},
    onRemoved: {},
    onAttached: {},
    onDetached: {},
    onHighlighted: {},
    onActivated: {},
    onMoved: {},
    onUpdated: {},
    onCreated: {},
    MutedInfoReason: {
      CAPTURE: 'capture',
      EXTENSION: 'extension',
      USER: 'user',
    },
    TabStatus: {
      COMPLETE: 'complete',
      LOADING: 'loading',
      UNLOADED: 'unloaded',
    },
    WindowType: {
      APP: 'app',
      DEVTOOLS: 'devtools',
      NORMAL: 'normal',
      PANEL: 'panel',
      POPUP: 'popup',
    },
    ZoomSettingsMode: {
      AUTOMATIC: 'automatic',
      DISABLED: 'disabled',
      MANUAL: 'manual',
    },
    ZoomSettingsScope: { PER_ORIGIN: 'per-origin', PER_TAB: 'per-tab' },
    MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND: 2,
    TAB_ID_NONE: -1,
  },
  windows: {
    onBoundsChanged: {},
    onFocusChanged: {},
    onRemoved: {},
    onCreated: {},
    CreateType: { NORMAL: 'normal', PANEL: 'panel', POPUP: 'popup' },
    WindowState: {
      FULLSCREEN: 'fullscreen',
      LOCKED_FULLSCREEN: 'locked-fullscreen',
      MAXIMIZED: 'maximized',
      MINIMIZED: 'minimized',
      NORMAL: 'normal',
    },
    WindowType: {
      APP: 'app',
      DEVTOOLS: 'devtools',
      NORMAL: 'normal',
      PANEL: 'panel',
      POPUP: 'popup',
    },
    WINDOW_ID_CURRENT: -2,
    WINDOW_ID_NONE: -1,
  },
}
