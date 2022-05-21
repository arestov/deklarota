
import CallbacksFlow from '../../../CallbacksFlow'
import SyncSender from '../../../sync_sender'
import { Proxies } from '../../../views_proxies'
import initEffects from '../../../AttrsOwner/initEffects'
import bindRuntimeError from '../../bindRuntimeError'
import onFinalTransactionStep from '../../../_internal/onFinalTransactionStep'
import callFlowStep from '../../../Model/callFlowStep'
import { getModelDataSchema } from './reinit'
import { APP_ROOT_ID } from '../../../Model/APP_ROOT_ID'

function AppRuntime(optionsRaw) {

  const options = optionsRaw || {}

  const glo = typeof globalThis !== 'undefined' ? globalThis : window
  const flow = new CallbacksFlow({
    callFlowStep,
    glo: glo,
    reportLongTask: options.reportLongTask,
    reportHugeQueue: options.reportHugeQueue,
    onError: bindRuntimeError(this, options.onError),
    onFinalTransactionStep: onFinalTransactionStep(this),
  })

  this.models_counters = 1
  this.models = {}
  this.calls_flow = flow

  this.views_counter = 1 // check to remove

  initEffects(this)

  const whenAllReady = function(fn) {
    flow.pushToFlow(fn, null, null, null, null, null, null, true)
  }

  this.whenAllReady = whenAllReady

  this.dkt_storage = options.dkt_storage || null

  this.sync_sender = options.sync_sender ? new SyncSender() : null

  const { __proxies_leaks_check, __proxies_leaks_check_interval, proxies: enable_proxies } = options
  const proxies = enable_proxies
    ? new Proxies({ __proxies_leaks_check, __proxies_leaks_check_interval })
    : null
  this.views_proxies = proxies
  this.proxies = proxies

  this.logger = options.logger || null
  this.env = options.env || null

  this.warn_unexpected_attrs = Boolean(options.warnUnexpectedAttrs !== false)

  this.relation_mocks = options.relation_mocks
  this.no_effects = Boolean(this.relation_mocks)
  this._subscribe_effect_handlers = null
  this.__model_replacers = null
  this.requests_by_declarations = null
  this.current_transaction = null
  this.expected_rels_to_chains = null
  this.live_heavy_rel_query_by_rel_name = null
  this.requests = new Set()
  Object.seal(this)
}

AppRuntime.prototype.start = function(options) {
  const self = this

  if (this.dkt_storage != null) {
    this.dkt_storage.putSchema(getModelDataSchema(options.App))
  }

  return new Promise(function(resolve) {
    self.calls_flow.input(function() {
      const app_id = self.models_counters++

      if (app_id !== APP_ROOT_ID) {
        throw new Error('app root id should be ' + APP_ROOT_ID)
      }

      const app_model = new options.App({
        interfaces: options.interfaces,
        _provoda_id: app_id,
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
