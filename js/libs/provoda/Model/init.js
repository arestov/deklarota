import initSubPager from '../dcl/sub_pager/init'
import { initRelsRequesting } from '../FastEventor/requestNesting'
import { initAttrsRequesting } from '../FastEventor/requestState'
import makeAttrsCollector from './makeAttrsCollector'
import initRoutes from '../dcl/routes/init'

export default function initModel(self, opts, data) {
  const app = opts.app
  const _highway = opts._highway

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
  initRoutes(self)

  self.map_parent = opts?.map_parent || null

  if (!opts._provoda_id) {
    throw new Error('provide id')
  }

  self._provoda_id = opts._provoda_id
  self._highway.models[self._provoda_id] = self

  //self.states = {};

  self.children_models = {}
  self.__mentions_as_rel = null
  self._network_source = self._network_source || null
  initAttrsRequesting(self)
  initRelsRequesting(self)


  self.md_replacer = null
  self.mpx = null

  self.init_v2_data = null
  const init_v2 = data && data.init_version === 2
  if (init_v2) {
    self.init_v2_data = data
  }

  // we going to mutate incoming `opts`
  prepareStates(self, opts, data)

  return self
}

function createISS(self, data) {
  if (!data?.attrs) {
    return null
  }

  const iss = {
    ...data.attrs
  }

  for (const state_name in iss) {
    if (self.hasComplexStateFn(state_name)) {
      delete iss[state_name]
    }
  }

  return iss
}

function prepareStates(self, opts, data) {
  if (opts.init_states) {
    throw new Error('incoming `opts` should not have `init_states`')
  }
  opts.init_states = createISS(self, data) || null
}
