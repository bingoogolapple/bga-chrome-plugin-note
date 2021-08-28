# bga-chrome-plugin-note

Chrome 插件开发学习笔记

## 文档

- [官方文档](https://developer.chrome.com/docs/extensions/mv3/getstarted)
- [chrome-extensions-samples](https://github.com/GoogleChrome/chrome-extensions-samples)
- [中文文档](https://wizardforcel.gitbooks.io/chrome-doc/content/index.html)

## manifest.json

- 插件的核心之一是一个 manifest.json 文件，这个文件是 chrome 插件的配置清单，chrome 浏览器通过读取插件的配置清单来获取插件的详细信息，同时为插件开放相应的 api 能力

## 后台服务(backgrund)

修改后不用在扩展插件中刷新插件，会自动生效

- 常驻运行在 chrome 后台的脚本，它不会因为页面的关闭而被销毁，只要浏览器没有被关闭且插件没有被禁用，那么这个插件的 background 就会一直在后台运行
- 可以在后台监听浏览器事件，根据开发者和用户的配置来对不同的事件作出不同的响应

## 用户界面网页(popup)

修改后不用在扩展插件中刷新插件，会自动生效

- 点击插件出来的小弹窗，每次点击弹出开始运行，弹窗关闭后结束
- 可以与 backgrund 脚本交互

## 内容脚本(content_scripts)

修改后需要在扩展插件中手动刷新插件后才会生效

- 安装插件后每打开一个网页可以将 content 脚本注入到页面中
- 内容脚本可以读取浏览器访问的网页的细节，并且可以修改页面
- 在浏览器中已加载页面的上下文中执行
- 应该将内容脚本视为已加载页面的一部分

## permissions

- 插件可以调用 chrome 浏览器开放的 api 对浏览器的能力进行增强，一些基础的 api 无需指定权限即可使用，但是一些比较高级的 api 是需要在 permissions 中进行指定，才能使用

## 安装

- 扩展程序 -> 打开开发者模式 -> 拖拽文件夹到浏览器中

## 调试

- 调试 background.js「chrome://extensions -> 对应插件 -> Service Worker」
- 调试 popup.js 或 background.js「两个手指点击插件图标或右键 -> 审查弹出内容」
- 前期可以直接在控制台中测试各种 API 用法，通了再拷贝到代码文件中

## 其他

- 不允许在 html 中加载远程 js，需要下载到本地
- 不允许使用内联 js
- 可以结合 [crx](https://www.npmjs.com/package/crx) 打包
