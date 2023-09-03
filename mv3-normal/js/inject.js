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
  if (url.includes('/testMock')) {
    console.log('拦截接口 testMock')
    const mockBody = JSON.stringify({
      code: 0,
      data: [
        {
          id: 1,
          name: '名称1',
        },
        {
          id: 2,
          name: '名称2',
        },
      ],
      message: '成功',
    })
    const mockResponse = new Response(new Blob([mockBody]), {
      status: 200,
      statusText: 'OK',
      headers: {},
    })
    return Promise.resolve(mockResponse).then((res) => {
      console.log('拦截时的结果', res)
      return res
    })
  }
  // 然后调用原始的 fetch 函数
  return originalFetch(url, init).then((res) => {
    console.log('未拦截时的结果', res)
    return res
  })
}

// https://github.com/wendux/ajax-hook/tree/master
!(function (e, t) {
  for (var n in t) e[n] = t[n]
})(
  window,
  (function (e) {
    function t(r) {
      if (n[r]) return n[r].exports
      var o = (n[r] = { i: r, l: !1, exports: {} })
      return e[r].call(o.exports, o, o.exports, t), (o.l = !0), o.exports
    }
    var n = {}
    return (
      (t.m = e),
      (t.c = n),
      (t.i = function (e) {
        return e
      }),
      (t.d = function (e, n, r) {
        t.o(e, n) ||
          Object.defineProperty(e, n, {
            configurable: !1,
            enumerable: !0,
            get: r,
          })
      }),
      (t.n = function (e) {
        var n =
          e && e.__esModule
            ? function () {
                return e.default
              }
            : function () {
                return e
              }
        return t.d(n, 'a', n), n
      }),
      (t.o = function (e, t) {
        return Object.prototype.hasOwnProperty.call(e, t)
      }),
      (t.p = ''),
      t((t.s = 3))
    )
  })([
    function (e, t, n) {
      'use strict'
      function r(e, t) {
        var n = {}
        for (var r in e) n[r] = e[r]
        return (n.target = n.currentTarget = t), n
      }
      function o(e, t) {
        function n(t) {
          return function () {
            var n = this.hasOwnProperty(t + '_') ? this[t + '_'] : this[u][t],
              r = (e[t] || {}).getter
            return (r && r(n, this)) || n
          }
        }
        function o(t) {
          return function (n) {
            var o = this[u],
              i = this,
              s = e[t]
            if ('on' === t.substring(0, 2))
              (i[t + '_'] = n),
                (o[t] = function (s) {
                  ;(s = r(s, i)), (e[t] && e[t].call(i, o, s)) || n.call(i, s)
                })
            else {
              var a = (s || {}).setter
              ;(n = (a && a(n, i)) || n), (this[t + '_'] = n)
              try {
                o[t] = n
              } catch (e) {}
            }
          }
        }
        function a(t) {
          return function () {
            var n = [].slice.call(arguments)
            if (e[t]) {
              var r = e[t].call(this, n, this[u])
              if (r) return r
            }
            return this[u][t].apply(this[u], n)
          }
        }
        function c() {
          ;(t.XMLHttpRequest = f), (f = void 0)
        }
        t = t || window
        var f = t.XMLHttpRequest
        return (
          (t.XMLHttpRequest = function () {
            for (var e = new f(), t = 0; t < s.length; ++t) {
              var r = 'on' + s[t]
              void 0 === e[r] && (e[r] = null)
            }
            for (var c in e) {
              var h = ''
              try {
                h = i(e[c])
              } catch (e) {}
              'function' === h
                ? (this[c] = a(c))
                : c !== u &&
                  Object.defineProperty(this, c, {
                    get: n(c),
                    set: o(c),
                    enumerable: !0,
                  })
            }
            var v = this
            ;(e.getProxy = function () {
              return v
            }),
              (this[u] = e)
          }),
          Object.assign(t.XMLHttpRequest, {
            UNSENT: 0,
            OPENED: 1,
            HEADERS_RECEIVED: 2,
            LOADING: 3,
            DONE: 4,
          }),
          { originXhr: f, unHook: c }
        )
      }
      Object.defineProperty(t, '__esModule', { value: !0 })
      var i =
        'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
          ? function (e) {
              return typeof e
            }
          : function (e) {
              return e &&
                'function' == typeof Symbol &&
                e.constructor === Symbol &&
                e !== Symbol.prototype
                ? 'symbol'
                : typeof e
            }
      ;(t.configEvent = r), (t.hook = o)
      var s = (t.events = [
          'load',
          'loadend',
          'timeout',
          'error',
          'readystatechange',
          'abort',
        ]),
        u = '__origin_xhr'
    },
    function (e, t, n) {
      'use strict'
      function r(e, t) {
        return (t = t || window), c(e, t)
      }
      function o(e) {
        return e.replace(/^\s+|\s+$/g, '')
      }
      function i(e) {
        return e.watcher || (e.watcher = document.createElement('a'))
      }
      function s(e, t) {
        var n = e.getProxy(),
          r = 'on' + t + '_',
          o = (0, f.configEvent)({ type: t }, n)
        n[r] && n[r](o)
        var s
        'function' == typeof Event
          ? (s = new Event(t, { bubbles: !1 }))
          : ((s = document.createEvent('Event')), s.initEvent(t, !1, !0)),
          i(e).dispatchEvent(s)
      }
      function u(e) {
        ;(this.xhr = e), (this.xhrProxy = e.getProxy())
      }
      function a(e) {
        function t(e) {
          u.call(this, e)
        }
        return (t[x] = Object.create(u[x])), (t[x].next = e), t
      }
      function c(e, t) {
        function n(e, t) {
          var n = new b(e),
            r = t.responseType,
            i = r && 'text' !== r && 'json' !== r ? t.response : t.responseText,
            s = {
              response: i,
              status: t.status,
              statusText: t.statusText,
              config: e.config,
              headers:
                e.resHeader ||
                e
                  .getAllResponseHeaders()
                  .split('\r\n')
                  .reduce(function (e, t) {
                    if ('' === t) return e
                    var n = t.split(':')
                    return (e[n.shift()] = o(n.join(':'))), e
                  }, {}),
            }
          if (!v) return n.resolve(s)
          v(s, n)
        }
        function r(e, t, n, r) {
          var o = new w(e)
          ;(n = { config: e.config, error: n, type: r }),
            x ? x(n, o) : o.next(n)
        }
        function u() {
          return !0
        }
        function a(e) {
          return function (t, n) {
            return r(t, this, n, e), !0
          }
        }
        function c(e, t) {
          return (
            4 === e.readyState && 0 !== e.status
              ? n(e, t)
              : 4 !== e.readyState && s(e, p),
            !0
          )
        }
        var h = e.onRequest,
          v = e.onResponse,
          x = e.onError,
          E = (0, f.hook)(
            {
              onload: u,
              onloadend: u,
              onerror: a(l),
              ontimeout: a(d),
              onabort: a(y),
              onreadystatechange: function (e) {
                return c(e, this)
              },
              open: function (e, t) {
                var n = this,
                  r = (t.config = { headers: {} })
                ;(r.method = e[0]),
                  (r.url = e[1]),
                  (r.async = e[2]),
                  (r.user = e[3]),
                  (r.password = e[4]),
                  (r.xhr = t)
                var o = 'on' + p
                if (
                  (t[o] ||
                    (t[o] = function () {
                      return c(t, n)
                    }),
                  h)
                )
                  return !0
              },
              send: function (e, t) {
                var n = t.config
                if (
                  ((n.withCredentials = t.withCredentials), (n.body = e[0]), h)
                ) {
                  var r = function () {
                    h(n, new g(t))
                  }
                  return !1 === n.async ? r() : setTimeout(r), !0
                }
              },
              setRequestHeader: function (e, t) {
                if (((t.config.headers[e[0].toLowerCase()] = e[1]), h))
                  return !0
              },
              addEventListener: function (e, t) {
                var n = this
                if (-1 !== f.events.indexOf(e[0])) {
                  var r = e[1]
                  return (
                    i(t).addEventListener(e[0], function (t) {
                      var o = (0, f.configEvent)(t, n)
                      ;(o.type = e[0]), (o.isTrusted = !0), r.call(n, o)
                    }),
                    !0
                  )
                }
              },
              getAllResponseHeaders: function (e, t) {
                var n = t.resHeader
                if (n) {
                  var r = ''
                  for (var o in n) r += o + ': ' + n[o] + '\r\n'
                  return r
                }
              },
              getResponseHeader: function (e, t) {
                var n = t.resHeader
                if (n) return n[(e[0] || '').toLowerCase()]
              },
            },
            t
          )
        return { originXhr: E.originXhr, unProxy: E.unHook }
      }
      Object.defineProperty(t, '__esModule', { value: !0 }), (t.proxy = r)
      var f = n(0),
        h = f.events[0],
        v = f.events[1],
        d = f.events[2],
        l = f.events[3],
        p = f.events[4],
        y = f.events[5],
        x = 'prototype'
      u[x] = Object.create({
        resolve: function (e) {
          var t = this.xhrProxy,
            n = this.xhr
          ;(t.readyState = 4),
            (n.resHeader = e.headers),
            (t.response = t.responseText = e.response),
            (t.statusText = e.statusText),
            (t.status = e.status),
            s(n, p),
            s(n, h),
            s(n, v)
        },
        reject: function (e) {
          ;(this.xhrProxy.status = 0), s(this.xhr, e.type), s(this.xhr, v)
        },
      })
      var g = a(function (e) {
          var t = this.xhr
          ;(e = e || t.config),
            (t.withCredentials = e.withCredentials),
            t.open(e.method, e.url, !1 !== e.async, e.user, e.password)
          for (var n in e.headers) t.setRequestHeader(n, e.headers[n])
          t.send(e.body)
        }),
        b = a(function (e) {
          this.resolve(e)
        }),
        w = a(function (e) {
          this.reject(e)
        })
    },
    ,
    function (e, t, n) {
      'use strict'
      Object.defineProperty(t, '__esModule', { value: !0 }), (t.ah = void 0)
      var r = n(0),
        o = n(1)
      t.ah = { proxy: o.proxy, hook: r.hook }
    },
  ])
)

ah.proxy({
  onRequest: (config, handler) => {
    //   console.log('111111 onRequest', config, handler)
    if (config.url.includes('/testMock')) {
      console.log('111111 onRequest', config)
      handler.resolve({
        config: config,
        status: 200,
        headers: { 'content-type': 'application/json;charset=utf-8' },
        response: JSON.stringify({
          code: 0,
          data: [
            {
              id: 1,
              name: '名称1',
            },
            {
              id: 2,
              name: '名称2',
            },
          ],
          message: '成功',
        }),
      })
    }
    if (config.url === 'https://aa/') {
      handler.resolve({
        config: config,
        status: 200,
        headers: { 'content-type': 'text/text' },
        response: 'hi world',
      })
    } else {
      handler.next(config)
    }
  },
  onError: (err, handler) => {
    console.log('111111 onError', err, handler)
    if (err.config.url === 'https://bb/') {
      handler.resolve({
        config: err.config,
        status: 200,
        headers: { 'content-type': 'text/text' },
        response: 'hi world',
      })
    } else {
      handler.next(err)
    }
  },
  onResponse: (response, handler) => {
    // console.log('111111 response', response, handler)
    if (response.config.url === location.href) {
      handler.reject({
        config: response.config,
        type: 'error',
      })
    } else {
      handler.next(response)
    }
  },
})
