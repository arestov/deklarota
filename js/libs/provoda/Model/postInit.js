
import initDeclaredNestings from '../dcl/nest/runtime/initDeclaredNestings'
import runGlueRelSources from '../dcl/glue_rels/runtime/run'
import initApis from '../dcl/effects/legacy/api/init'
import initRoutes from '../dcl/routes/init'
import __handleInit from '../dcl/passes/handleInit/handle'
import ensureInitialAttrs from './ensureInitialAttrs'
import mockRelations from './mockRelations'
import getRelFromInitParams from '../utils/getRelFromInitParams'
import _updateRel from '../_internal/_updateRel'

import _updateAttr from '../_internal/_updateAttr'

const is_prod = typeof NODE_ENV != 'undefined' && NODE_ENV === 'production'


function assignInputRels(self, input_rels) {
  if (input_rels == null) {return}

  for (const rel_name in input_rels) {
    if (!input_rels.hasOwnProperty(rel_name)) {
      continue
    }

    _updateRel(self, rel_name, input_rels[rel_name])
  }
}

function connectStates(self, input_rels) {

  // prefill own states before connecting relations
  ensureInitialAttrs(self)

  self.children_models.$root = self.app
  self.children_models.$parent = self.map_parent
  self.__initStates()
  self.children_models.$root = null
  self.children_models.$parent = null
  _updateRel(self, '$root', self.app)
  if (self.map_parent) {
    _updateRel(self, '$parent', self.map_parent)
  }

  /* should be before prsStCon.connect.nesting */
  assignInputRels(self, input_rels)

  if (!is_prod && self._highway.relation_mocks) {
    mockRelations(self)
    return
  }
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

export default function postInitModel(self, opts, initing_params) {
  connectStates(self, getRelFromInitParams(initing_params))
  connectNests(self)

  initRoutes(self)

  const init_v2_data = self.init_v2_data
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
