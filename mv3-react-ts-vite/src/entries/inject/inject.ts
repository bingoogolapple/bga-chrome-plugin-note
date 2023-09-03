import { testChrome } from '../../utils/chrome-utils'
testChrome('inject')

// import './initXhrProxy'
// import './initFetchProxy'
// import './initMswProxy'

if (window.location.host === 'www.baidu.com') {
  const doc = document.documentElement
  const interval = setInterval(() => {
    if (doc.scrollTop >= 1000) {
      clearInterval(interval)
    } else {
      doc.scrollTop += 2
    }
  }, 50)
}
