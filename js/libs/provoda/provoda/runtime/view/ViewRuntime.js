
import cloneObj from '../../../../spv/cloneObj'
import CallbacksFlow from '../../../CallbacksFlow'
import initEffects from '../../../AttrsOwner/initEffects'
import bindRuntimeError from '../../bindRuntimeError'
import onFinalTransactionStep from '../../../_internal/onFinalTransactionStep'
import callFlowStep, { validateFlowStep } from '../../../View/callFlowStep'

function ViewRuntime(optionsRaw) {
  const options = optionsRaw || {}

  const glo = typeof globalThis !== 'undefined' ? globalThis : window
  const flow = new CallbacksFlow({
    callFlowStep,
    validateFlowStep,
    glo: glo,
    reportLongTask: options.reportLongTask,
    reportHugeQueue: options.reportHugeQueue,
    onError: bindRuntimeError(this, options.onError),
    onFinalTransactionStep: onFinalTransactionStep(this),
  })

  this.views_counter = 1
  this.views_proxies = options.proxies
  this.calls_flow = flow

  initEffects(this)

  const whenAllReady = function(fn) {
    flow.whenReady(fn)
  }

  this.whenAllReady = whenAllReady

  this.local_calls_flow = flow
  this.sync_r = options.sync_r || null
  this.requests = new Set()
}

ViewRuntime.prototype.start = function(options) {
  const self = this
  const mpx = options.mpx
  const interfaces = options.interfaces
  const bwlev = options.bwlev
  const RootView = options.RootView

  return new Promise(function(resolve) {
    self.calls_flow.input(function() {
      const win = interfaces.win

      const all_interfaces = {}
      cloneObj(all_interfaces, interfaces)
      all_interfaces.whenAllReady = self.whenAllReady

      const view = new RootView({
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

export default ViewRuntime
