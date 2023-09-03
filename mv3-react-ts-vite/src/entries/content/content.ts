// 这里需要 import 一下 content.less，否则不会被打包
import './content.less'

import { testChrome } from '../../utils/chrome-utils'
testChrome('content')

// 动态加载文件时需要在 manifest.json -> web_accessible_resources 中配置
let jsPath = 'assets/inject.js'
const script = document.createElement('script')
script.setAttribute('type', 'text/javascript')
script.setAttribute('src', chrome.runtime.getURL(jsPath))
document.documentElement.appendChild(script)
