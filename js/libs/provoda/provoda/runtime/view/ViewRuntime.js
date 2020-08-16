define(function(require) {
'use strict'
var cloneObj = require('spv/cloneObj')
var CallbacksFlow = require('../../../CallbacksFlow')

function ViewRuntime(optionsRaw) {
  var options = optionsRaw || {}

  var glo = typeof global !== 'undefined' ? global : window
  var flow = new CallbacksFlow({
    glo: glo,
    reportLongTask: options.reportLongTask,
    reportHugeQueue: options.reportHugeQueue
  })

  this.views_counter = 1
  this.views_proxies = options.proxies
  this.calls_flow = flow

  var whenAllReady = function(fn) {
    flow.pushToFlow(fn, null, null, null, null, null, null, true)
  }

  this.whenAllReady = whenAllReady

  this.local_calls_flow = flow
  this.sync_r = options.sync_r || null
}

ViewRuntime.prototype.start = function(options) {
  var self = this
  var mpx = options.mpx
  var interfaces = options.interfaces
  var bwlev = options.bwlev
  var RootView = options.RootView


  return new Promise(function(resolve) {
    self.calls_flow.input(function() {
      var win = interfaces.win

      var all_interfaces = {}
      cloneObj(all_interfaces, interfaces)
      all_interfaces.whenAllReady = self.whenAllReady

      var view = new RootView({
        mpx: mpx,
        whenAllReady: self.whenAllReady,
        proxies_space: options.proxies_space,
        _highway: self,
      }, {
        d: win.document,
        can_die: false,
        bwlev: bwlev,
        interfaces: all_interfaces,
      })

      // window.rootView = view

      mpx.addView(view, options.name)
      // view.onDie(function() {
      //
      // })
      view.requestAll()
      resolve(view)
    })
  })
}

return ViewRuntime
})
