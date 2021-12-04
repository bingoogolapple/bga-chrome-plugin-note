window.onload = () => {
  fetch('https://api.github.com/users/bingoogolapple')
    .then((resp) => resp.json())
    .then((data) => {
      document.getElementById('username').innerText = data.login
    })
}

let port = chrome.runtime.connect()
console.log('options chrome.runtime.onConnect', port)
port.onMessage.addListener((msg) => {
  console.log('options onMessage', msg)
})
port.postMessage('我是来自 options 的消息')

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('options 收到消息', request, sender)
  sendResponse('我是来自 options 的响应消息')
})
document.getElementById('sendMessage').addEventListener('click', () => {
  chrome.runtime.sendMessage({ msg: '我是来自 options 的消息' }, (response) => {
    console.log('options 发送后收到返回消息', response)
  })
})

document.getElementById('showBadge').addEventListener('click', () => {
  chrome.action.setTitle({ title: 'options里修改标题' })
  chrome.action.setBadgeText({ text: '22' })
  chrome.action.setBadgeBackgroundColor({ color: 'red' })
})
document.getElementById('hideBadge').addEventListener('click', () => {
  chrome.action.setBadgeText({ text: '' })
})

document.getElementById('sendNotification').addEventListener('click', () => {
  chrome.notifications.create(null, {
    type: 'image',
    iconUrl: '../images/128.png',
    title: 'options测试标题',
    message:
      'options很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长的内容',
    imageUrl: '../images/128.png',
  })
})

document.getElementById('openOptions').addEventListener('click', async () => {
  // chrome-extension://mjjadipdeeefojkjjfkgdnchfnkdggpn/html/options.html
  let url = chrome.runtime.getURL('html/options.html')
  let tab = await chrome.tabs.create({ url })
  console.log(`打开选项 tab ${JSON.stringify(tab)}`)
})
document.getElementById('openBaidu').addEventListener('click', async () => {
  let url = 'https://www.baidu.com'
  let tab = await chrome.tabs.create({ url })
  console.log(`打开百度 tab ${JSON.stringify(tab)}`)
})

document.getElementById('changePluginColor').addEventListener('click', () => {
  setPageBackgroundColor()
})

function setPageBackgroundColor() {
  chrome.storage.sync.get('color', ({ color }) => {
    document.body.style.backgroundColor = color
  })
}

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

chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log('changes', changes)
  console.log('namespace', namespace)
  console.log('entries', Object.entries(changes))

  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`
    )
  }
})
