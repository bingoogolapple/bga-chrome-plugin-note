const initHmrListener = async () => {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request?.mode === 'page' && request?.action === 'reload') {
      console.log('injectPage 收到刷新页面消息', request, sender)
      window.location.reload()
    }
  })
}
initHmrListener()
