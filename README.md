# bga-chrome-plugin-note

Chrome 插件开发学习笔记

## 相关链接

- [官方文档](https://developer.chrome.com/docs/extensions/mv3/getstarted)
- [chrome-extensions-samples](https://github.com/GoogleChrome/chrome-extensions-samples)
- [接口文档](https://developer.chrome.com/docs/extensions/reference/)
- [清单文件 - manifest.json](https://developer.chrome.com/docs/extensions/mv3/manifest/)
- [权限申请 - permissions](https://developer.chrome.com/docs/extensions/reference/permissions/)
- [后台服务 - background](https://developer.chrome.com/docs/extensions/mv3/service_workers/)
- [右上角 logo、按钮、浮窗 - action](https://developer.chrome.com/docs/extensions/reference/action/)
- [插件可选项配置页面 - options-ui](https://developer.chrome.com/docs/extensions/mv3/options/)
- [内容脚本 - content_scripts](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)
- [各模块通信 - message](https://developer.chrome.com/docs/extensions/mv3/messaging/)
- [右键菜单 - contextMenus](https://developer.chrome.com/docs/extensions/reference/contextMenus/)
- [开发者工具 - devtools](https://developer.chrome.com/docs/extensions/mv3/devtools/)
- [注册开发者账号](https://chrome.google.com/webstore/devconsole)
- [插件发布地址](https://developer.chrome.com/docs/webstore/publish/)
- 可以结合 [crx npm 包](https://www.npmjs.com/package/crx) 打包
- [国人整理的各种 Chrome 插件 demo](https://github.com/sxei/chrome-plugin-demo)
- [中文文档](https://github.com/facert/chrome-extension-guide)
- [Vite2 插件：用于使用 Vite2 + Vue3 开发 Chrome 拓展，且支持开发过程中插件热重载](https://github.com/yeqisong/vite-plugin-vue-crx3)
- [Webpack + React 开发 Chrome 插件样板代码](https://github.com/lxieyang/chrome-extension-boilerplate-react)
- [参考文章 1](https://github.com/0326/iBookmark/wiki)
- [Chrome 插件开发日志](https://juejin.cn/column/7140235168777764894)
- [CRXJS](https://github.com/crxjs/chrome-extension-tools/tree/main/packages/vite-plugin)
- [chrome-extension-vite-react](https://github.com/spiderT/chrome-extension-vite-react)
- [ajax-proxy](https://github.com/g0ngjie/ajax-proxy)
- [Ajax-hook](https://github.com/wendux/Ajax-hook)
- [做个Chrome小扩展mock请求从此测试如飞](https://juejin.cn/post/6955828684594872333)
- [使用 Chrome Extension Manifest 3 来处理 CORS 限制](https://github.com/carl-jin/blogs-new/blob/569c4bbe323380e6720ccf1831426ef4334b899d/content/posts/chrome-extension-cors.md)
- [Chrome 扩展 V3 中文文档](https://doc.yilijishu.info/chrome/)
- [Chrome 拖拽文件系统](https://blog.mn886.net/chenjianhua/show/86cfc389a52c/index.html)

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
- 调试 newtab、option、devtools 与调试普通网页一样，按 F12 即可
- 前期可以直接在控制台中测试各种 API 用法，通了再拷贝到代码文件中

## 其他注意事项

- 不允许在 html 中加载远程 js，需要下载到本地
- 不允许使用内联 js

## 查看其他 Chrome 插件源码学习用法

- 访问 chrome://version 找到个人资料路径
- 其他插件源码地址为：${个人资料路径}/Extensions
- 也可以在不安装插件的情况下，直接使用 [Chrome extension source viewer](https://chrome.google.com/webstore/detail/chrome-extension-source-v/jifpbeccnghkjeaalbbjmodiffmgedin?hl=zh-CN) 查看应用商店里其他插件的源码
