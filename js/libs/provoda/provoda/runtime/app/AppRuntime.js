define(function(require) {
'use strict'
var CallbacksFlow = require('../../../CallbacksFlow')
var SyncSender = require('../../../sync_sender')
var views_proxies = require('../../../views_proxies')

function AppRuntime(optionsRaw) {

  var options = optionsRaw || {}

  var glo = typeof global !== 'undefined' ? global : window
  var flow = new CallbacksFlow({
    glo: glo,
    reportLongTask: options.reportLongTask,
    reportHugeQueue: options.reportHugeQueue
  })

  this.models_counters = 1
  this.models = {}
  this.calls_flow = flow

  this.views_counter = 1 // check to remove

  var whenAllReady = function(fn) {
    flow.pushToFlow(fn, null, null, null, null, null, null, true)
  }

  this.whenAllReady = whenAllReady

  this.sync_sender = options.sync_sender ? new SyncSender() : null

  var proxies = options.proxies ? new views_proxies.Proxies() : null
  this.views_proxies = proxies
  this.proxies = proxies
  this.logger = options.logger || null
  this.env = options.env || null
}

AppRuntime.prototype.start = function(options) {
  var self = this
  return new Promise(function(resolve) {
    self.calls_flow.input(function() {
      var app_model = new options.App({
        interfaces: options.interfaces,
        _highway: self,
      })

      resolve({
        flow: self.calls_flow,
        app_model: app_model,
        sync_sender: self.sync_sender,
        views_proxies: self.views_proxies,
      })
    })
  })
};

return AppRuntime
})
