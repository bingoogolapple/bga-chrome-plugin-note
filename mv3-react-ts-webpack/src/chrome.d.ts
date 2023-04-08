// 最新版 @types/chrome 已支持 "manifest_version": 3，但还有部分类型未支持
declare namespace chrome.runtime {
  export enum OnInstalledReason {
    CHROME_UPDATE = 'chrome_update',
    INSTALL = 'install',
    SHARED_MODULE_UPDATE = 'shared_module_update',
    UPDATE = 'update',
  }
}
