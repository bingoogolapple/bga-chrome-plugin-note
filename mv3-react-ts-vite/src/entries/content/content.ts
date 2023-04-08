// 这里需要 import 一下 content.css，否则不会被打包
import './content.css'

import { testChrome } from '../../utils/chrome-utils'
testChrome('content')

// 动态加载文件时需要在 manifest.json -> web_accessible_resources 中配置
let jsPath = 'assets/inject.js'
let temp = document.createElement('script')
temp.src = chrome.runtime.getURL(jsPath)
temp.setAttribute('type', 'text/javascript')
document.head.appendChild(temp)
