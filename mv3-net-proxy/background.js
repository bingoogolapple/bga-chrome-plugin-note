// chrome.webRequest.onBeforeRequest.addListener(
//   (request) => {
//     if (request.initiator.indexOf('hrome-extension://') > 0) {
//       console.log('插件发起的网络请求，忽略')
//       return
//     }
//     console.log('非插件发起的网络请求', request)

//     fetch('https://aa.bb.com/xx/yy', {
//       headers: {
//         accept: 'application/json, text/plain, */*',
//         'content-type': 'application/x-www-form-urlencoded',
//       },
//       body: 'aa=1&bb=2',
//       method: 'POST',
//     })
//       .then((res) => res.json())
//       .then((res) => {
//         console.log('bga then', res)
//       })
//       .catch((err) => {
//         console.error('bga err', err)
//       })
//   },
//   { urls: ['*://aa.bb.com/xx/*'] }
// )

/*
payload：content.js 发送过来的消息对象
sender：当前标签信息
{
    "id": "ocdmggocjpdpggkbofmjadbeijifmnog",
    "url": "",
    "origin": "",
    "frameId": 0,
    "tab": {
        "active": true,
        "audible": false,
        "autoDiscardable": true,
        "discarded": false,
        "groupId": -1,
        "height": 1035,
        "highlighted": true,
        "id": 181,
        "incognito": false,
        "index": 5,
        "mutedInfo": {
            "muted": false
        },
        "pinned": false,
        "selected": true,
        "status": "loading",
        "title": "xxxx",
        "url": "https://xxxx",
        "width": 1383,
        "windowId": 1
    }
}
*/
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('background.js 收到消息', request)

  fetch(request.url, request.options)
    .then((res) => res.json())
    .then((res) => {
      console.log('background.js 网络请求成功', res)
      sendResponse({ type: 'net_success', payload: res })
    })
    .catch((err) => {
      console.error('background.js 网络请求失败', err)
      sendResponse({ type: 'net_failed', payload: err })
    })
  return true
})
