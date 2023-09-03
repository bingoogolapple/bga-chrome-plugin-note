if (window.location.host === 'www.baidu.com') {
  // alert('inject')
  const doc = document.documentElement
  const interval = setInterval(() => {
    if (doc.scrollTop >= 1000) {
      clearInterval(interval)
    } else {
      doc.scrollTop += 2
    }
  }, 50)
}

const originalFetch = window.fetch

window.fetch = function (url, init) {
  // 在这里你可以拦截或修改请求
  console.log('fetch 请求被拦截: ', url, init)
  // 然后调用原始的 fetch 函数
  return originalFetch(url, init)
}

const originalXMLHttpRequest = window.XMLHttpRequest

// 定义一个新的XMLHttpRequest类
class MyXMLHttpRequest extends originalXMLHttpRequest {
  // 覆盖open方法
  open(method, url, async, user, password) {
    // 在这里，你可以添加你的拦截逻辑，例如打印请求信息
    console.log('xhr request info:', method, url)

    // 然后调用原始的open方法
    super.open(method, url, async, user, password)
  }
}

// 将全局的XMLHttpRequest对象替换为我们自定义的类
window.XMLHttpRequest = MyXMLHttpRequest
