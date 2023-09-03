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

document.getElementById('chromeApps').addEventListener('click', () => {
  chrome.windows.create(
    {
      url: 'html/updateVersion.html',
      type: 'popup',
      width: 400,
      height: 400,
    },
    (res) => {
      console.log('windowCreate', res)
    }
  )
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
    console.log('verifyPermission 有权限')
    return true
  }
  if ((await fileHandle.requestPermission(options)) === 'granted') {
    console.log('verifyPermission 有申请到权限')
    return true
  }
  console.log('verifyPermission 未申请到权限')
  return false
}

document.getElementById('updateVersion').addEventListener('click', async () => {
  const fileHandleList = await window.showOpenFilePicker()
  const fileHandle = fileHandleList[0]
  const file = await fileHandle.getFile()
  const content = await file.text()
  console.log('内容', content)

  const manifestJson = JSON.parse(content)
  manifestJson.version = '1.0.1'

  const hasPermission = await verifyPermission(fileHandle)
  if (hasPermission) {
    console.log('有权限')
  } else {
    console.log('无权限')
    return
  }

  try {
    const writable = await fileHandle.createWritable()
    await writable.write(JSON.stringify(manifestJson, null, 4))
    await writable.close()

    setTimeout(() => {
      chrome.runtime.reload()
    }, 500)
  } catch (e) {
    console.log('保存文件失败', e)
  }
})

// 递归创建目录
const recursiveCreateDir = async (parentDirHandle, pathArr) => {
  const name = pathArr.shift()
  if (name) {
    // console.log('创建新目录', name)
    const newDirHandle = await parentDirHandle.getDirectoryHandle(name, {
      create: true,
    })
    return recursiveCreateDir(newDirHandle, pathArr)
  } else {
    return parentDirHandle
  }
}

// 解压 zip 文件 https://www.misterma.com/archives/913/
const extractZipFiles = async (zipFile, ignoreFirstDir = true) => {
  // 选择要解压到的文件路径
  const rootDirectoryHandle = await window.showDirectoryPicker({
    mode: 'readwrite', // 直接把读和写权限都申请了，避免后续再写子文件时还要再次申请权限
  })

  const jsZip = await JSZip.loadAsync(zipFile)
  console.log('读取 zip 文件成功', jsZip)
  const zipEntries = Object.values(jsZip.files)
  for await (let zipEntry of zipEntries) {
    // console.log('zipEntry', zipEntry)

    const pathArr = zipEntry.name.split('/').filter((item) => item)
    if (ignoreFirstDir) {
      pathArr.shift()
    }

    if (zipEntry.dir) {
      // 递归创建目录
      await recursiveCreateDir(rootDirectoryHandle, pathArr)
    } else {
      // 先提取文件名
      const name = pathArr.pop()
      // 然后再递归创建目录
      const lastDirHandle = await recursiveCreateDir(
        rootDirectoryHandle,
        pathArr
      )
      // console.log('创建新的文件', name)
      const fileHandle = await lastDirHandle.getFileHandle(name, {
        create: true,
      })
      const blob = await zipEntry.async('blob')
      const writable = await fileHandle.createWritable()
      await writable.write(blob)
      await writable.close()
    }
  }

  console.log('更新成功')
  setTimeout(() => {
    chrome.runtime.reload()
  }, 500)
}

// 解压本地zip文件
document
  .getElementById('extractLocalZipFiles')
  .addEventListener('click', async () => {
    // 选择要解压的文件
    const fileHandleList = await window.showOpenFilePicker({
      types: [
        {
          accept: {
            'application/zip': ['.zip'],
          },
        },
      ],
    })
    const zipFileHandle = fileHandleList[0]
    console.log('zipFileHandle', zipFileHandle)
    if (!zipFileHandle.name.endsWith('.zip')) {
      return
    }
    const zipFile = await zipFileHandle.getFile()
    console.log('zipFile', zipFile)

    extractZipFiles(zipFile)
  })

// zip -qr mv3-normal.zip ./mv3-normal
const remoteZipUrl = 'http://127.0.0.1:5500/mv3-normal/mv3-normal.zip'
// 解压远程zip文件
document
  .getElementById('extractRemoteZipFiles')
  .addEventListener('click', async () => {
    const zipFileBlob = await fetch(remoteZipUrl).then((res) => res.blob())
    console.log('zipFileBlob', zipFileBlob)
    extractZipFiles(zipFileBlob)
  })

// 展示本地版本和远程版本
window.onload = async () => {
  let versionDiv = document.getElementById('versionDiv')
  versionDiv.innerHTML = `当前版本：${chrome.runtime.getManifest().version}`

  let remoteVersionDiv = document.getElementById('remoteVersionDiv')

  const zipFileBlob = await fetch(remoteZipUrl).then((res) => res.blob())
  const jsZip = await JSZip.loadAsync(zipFileBlob)
  console.log('读取 zip 文件成功', jsZip)
  const zipEntries = Object.values(jsZip.files)
  for await (let zipEntry of zipEntries) {
    if (zipEntry.name.endsWith('manifest.json')) {
      console.log('找到清单文件', zipEntry)
      const manifestContent = await zipEntry.async('text')
      const manifestJson = JSON.parse(manifestContent)
      remoteVersionDiv.innerHTML = `远程版本：${manifestJson.version}`
    }
  }
}

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

  // 也可以直接使用 api 打开选项页面
  // chrome.runtime.openOptionsPage()
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

setTimeout(() => {
  console.log('options chrome.runtime.id', chrome.runtime.id)
  chrome.management.getSelf((self) => {
    console.log('options getSelf', self)
  })

  const manifest = chrome.runtime.getManifest()
  console.log('options getManifest', manifest)

  chrome.runtime.getPlatformInfo((platformInfo) => {
    console.log('options getPlatformInfo', platformInfo)
  })
}, 5000)
