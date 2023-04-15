export const initHmrListener = async () => {
  chrome.runtime.onMessage.addListener((request, sender, _sendResponse) => {
    const pageName = '{pageNamePlaceholder}'
    if (request?.mode === 'page' && request?.action === 'reload') {
      console.log(`injectPage ${pageName} 收到刷新页面消息`, request, sender)
      window.location.reload()
    }
  })
}
initHmrListener()
