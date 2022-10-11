// 业务方调用工具方法 httpRequest
// httpRequest('http://aa.bb.com/xx/yy', {
//   headers: {
//     accept: 'application/json, text/plain, */*',
//     'content-type': 'application/x-www-form-urlencoded',
//   },
//   body: 'aa=1&bb=2',
//   method: 'POST',
// })

// 封装成工具方法 httpRequest 给业务方调用
// const httpRequest = (url, options) => {
//   const uniqueId = `${new Date().getTime()}-${Math.random()}`
//   return new Promise((resolve, reject) => {
//     const onMessage = (event) => {
//       try {
//         const { source, type, payload, uniqueId: resultUniqueId } = event.data
//         if (source !== "@bga-devtools-inject-script") {
//           return
//         }
//         if (uniqueId !== resultUniqueId) {
//           return
//         }
//         switch (type) {
//           case "net_success":
//             {
//               console.log("bga 请求成功", payload)
//               resolve(payload)
//               window.removeEventListener("message", onMessage)
//             }
//             break
//           case "net_failed":
//             {
//               console.log("bga 请求失败", payload)
//               reject(payload)
//               window.removeEventListener("message", onMessage)
//             }
//             break
//         }
//       } catch (err) {
//         console.log("bga 解析 event.data 失败", err)
//       }
//     }
//     window.addEventListener("message", onMessage)

//     window.postMessage(
//       {
//         source: "@bga-devtools-inject-script",
//         type: "net_req",
//         uniqueId,
//         payload: {
//           url,
//           options,
//         },
//       },
//       window.location.origin
//     )
//   })
// }

window.addEventListener('message', (event) => {
  const data = event.data
  try {
    const { source, type, payload, uniqueId } = data
    if (source !== '@bga-devtools-inject-script') {
      return
    }
    if (type === 'net_req') {
      console.log('content.js 收到网络请求信息', data)
      chrome.runtime.sendMessage(payload, (res) => {
        console.log('content.js 网络请求结果', res)
        window.postMessage(
          {
            source: '@bga-devtools-inject-script',
            uniqueId,
            ...res,
          },
          window.location.origin
        )
      })
    }
  } catch (err) {
    console.log('content.js 解析 event.data 失败', err)
  }
})

let bgaExtensionInstalledDiv = document.createElement('div')
bgaExtensionInstalledDiv.setAttribute('id', 'bga-extension-installed')
document.body.appendChild(bgaExtensionInstalledDiv)

// 调用的地方通过是否存在该 div 来判断是否启用了插件
// let div = document.getElementById('bga-extension-installed')
