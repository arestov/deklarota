
import initDeclaredNestings from '../initDeclaredNestings'
import prsStCon from '../prsStCon'
import nestWIndex from '../nest-watch/index'
import runGlueRelSources from '../dcl/glue_rels/runtime/run'
import initApis from '../dcl/effects/legacy/api/init'
import initRoutes from '../dcl/routes/init'
import __handleInit from '../dcl/passes/handleInit/handle'
import ensureInitialAttrs from './ensureInitialAttrs'
import mockRelations from './mockRelations'

import _updateAttr from '../_internal/_updateAttr'
var initWatchList = nestWIndex.initList

const is_prod = typeof NODE_ENV != 'undefined' && NODE_ENV === 'production'


function connectStates(self) {
  // prefill own states before connecting relations
  ensureInitialAttrs(self)

  self.__initStates()

  if (!is_prod && self._highway.relation_mocks) {
    mockRelations(self)
    return
  }

  prsStCon.connect.parent(self, self)
  prsStCon.connect.root(self, self)
  prsStCon.connect.nesting(self, self)
}

function connectNests(self) {
  if (self.nestings_declarations) {
    self.nextTick(initDeclaredNestings, null, false, self.current_motivator)
  }

  runGlueRelSources(self)
}

function markInitied(md) {
  // - this state shuld be true when all preparations, all initial triggers and subscribtions are done
  // - use it to not produce effects for states changes during initialization
  _updateAttr(md, '$meta$inited', true)
}

export default function postInitModel(self, opts) {
  connectStates(self)
  connectNests(self)

  initWatchList(self, self.st_nest_matches)
  initRoutes(self)

  var init_v2_data = self.init_v2_data
  if (init_v2_data != null) {
    __handleInit(self, init_v2_data)
    self.init_v2_data = null
  } else {
    __handleInit(self, null)
  }

  if (init_v2_data != null && init_v2_data.interfaces != null) {
    initApis(self, init_v2_data.interfaces)
  }
  initApis(self, opts && opts.interfaces)

  self.nextTick(markInitied, null, false, self.current_motivator)
  Object.seal(self)
}
