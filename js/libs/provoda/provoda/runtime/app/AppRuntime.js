
import CallbacksFlow from '../../../CallbacksFlow'
import SyncSender from '../../../sync_sender'
import { Proxies } from '../../../views_proxies'
import initEffects from '../../../StatesEmitter/initEffects'

function AppRuntime(optionsRaw) {

  var options = optionsRaw || {}

  var glo = typeof globalThis !== 'undefined' ? globalThis : window
  var flow = new CallbacksFlow({
    glo: glo,
    reportLongTask: options.reportLongTask,
    reportHugeQueue: options.reportHugeQueue,
    onError: options.onError,
    onTransactionHandeled: options.onTransactionHandeled,
  })

  this.calcSeparator = options.calcSeparator || null

  this.models_counters = 1
  this.models = {}
  this.calls_flow = flow

  this.views_counter = 1 // check to remove

  initEffects(this)

  var whenAllReady = function(fn) {
    flow.pushToFlow(fn, null, null, null, null, null, null, true)
  }

  this.whenAllReady = whenAllReady

  this.sync_sender = options.sync_sender ? new SyncSender() : null

  const { __proxies_leaks_check, __proxies_leaks_check_interval, proxies: enable_proxies } = options
  var proxies = enable_proxies
    ? new Proxies({ __proxies_leaks_check, __proxies_leaks_check_interval })
    : null
  this.views_proxies = proxies
  this.proxies = proxies

  this.logger = options.logger || null
  this.env = options.env || null

  this.warn_unexpected_attrs = Boolean(options.warnUnexpectedAttrs)

  this.relation_mocks = options.relation_mocks
  this.no_effects = Boolean(this.relation_mocks)
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
}

export default AppRuntime
