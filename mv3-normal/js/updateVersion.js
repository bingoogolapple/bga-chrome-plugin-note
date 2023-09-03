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

window.onload = () => {
  let versionDiv = document.getElementById('versionDiv')
  versionDiv.innerHTML = `当前版本：${chrome.runtime.getManifest().version}`
}
