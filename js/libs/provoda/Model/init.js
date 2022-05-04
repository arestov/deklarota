import initSubPager from '../dcl/sub_pager/init'
import makeAttrsCollector from './makeAttrsCollector'

export default function initModel(self, opts, data) {
  const current_motivator = opts._motivator
  const app = opts.app
  const _highway = opts._highway

  self.current_motivator = self.current_motivator || (current_motivator)
  self.dead = false

  if (app != null) {
    self.app = app
  }

  self.app = self.app || null

  if (_highway != null) {
    self._highway = _highway
  }

  if (self._highway == null) {
    self._highway = self.app._highway
  }

  self._highway = self._highway || null

  makeAttrsCollector(self)
  self.states = self._attrs_collector.makeAttrsValues()


  self._calls_flow = self._highway.calls_flow

  // end-user place to add extra props
  self.extra = self.use_extra ? {} : null

  initSubPager(self)

  self.map_parent = opts?.map_parent || null

  self.req_order_field = null

  self._provoda_id = self._highway.models_counters++
  self._highway.models[self._provoda_id] = self

  //self.states = {};

  self.children_models = {}
  self.__mentions_as_rel = null
  self._network_source = self._network_source || null


  self.md_replacer = null
  self.mpx = null
  self._requests_deps = null

  self.init_v2_data = null
  const init_v2 = data && data.init_version === 2
  if (init_v2) {
    self.init_v2_data = data
  }

  prepareStates(self, data)

  return self
}

function toServStates(iss, states) {
  if (!states) {return iss}

  return Object.assign(iss || {}, states)
}

function createISS(self, data) {
  let iss = null


  iss = toServStates(iss, data && data.attrs)

  if (!iss) {
    return iss
  }

  for (const state_name in iss) {
    if (self.hasComplexStateFn(state_name)) {
      delete iss[state_name]
    }
  }

  return iss
}

function prepareStates(self, data) {
  self.init_states = self.init_states || null

  const iss = createISS(self, data)

  if (!iss) {
    return
  }

  self.init_states = self.init_states || {}
  self.init_states = Object.assign(self.init_states, iss)
}
